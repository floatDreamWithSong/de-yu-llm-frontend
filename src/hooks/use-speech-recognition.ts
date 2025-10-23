import { useCallback, useEffect, useRef, useState } from 'react'
import { createASRWebSocket, type ASRClient } from '@/apis/requests/asr'
import { useAudioRecorder } from './use-audio-recorder'

export interface UseSpeechRecognition {
  startRecognition(): Promise<void>
  stopRecognition(): void
  isRecognizing: boolean
  recognitionText: string
  error: Error | null
}

interface UseSpeechRecognitionOptions {
  onIntermediateResult?: (text: string) => void
  onFinalResult?: (text: string) => void
  onError?: (error: Error) => void
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}): UseSpeechRecognition => {
  const { onIntermediateResult, onFinalResult, onError } = options
  
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [recognitionText, setRecognitionText] = useState('')
  const [error, setError] = useState<Error | null>(null)
  
  const asrClientRef = useRef<ASRClient | null>(null)
  const hasStartedRef = useRef(false)

  // 创建音频录制器
  const audioRecorder = useAudioRecorder({
    onAudioData: (data: ArrayBuffer) => {
      if (asrClientRef.current && hasStartedRef.current) {
        asrClientRef.current.sendAudio(data)
      }
    }
  })

  // 处理 ASR 消息
  const handleASRMessage = useCallback((text: string, isFinal: boolean) => {
    setRecognitionText(text)
    
    if (isFinal) {
      // 最终结果
      if (onFinalResult) {
        onFinalResult(text)
      }
    } else {
      // 中间结果
      if (onIntermediateResult) {
        onIntermediateResult(text)
      }
    }
  }, [onIntermediateResult, onFinalResult])

  // 处理错误
  const handleError = useCallback((err: Error) => {
    setError(err)
    if (onError) {
      onError(err)
    }
  }, [onError])

  // 开始识别
  const startRecognition = useCallback(async (): Promise<void> => {
    try {
      setError(null)
      setRecognitionText('')
      
      // 创建 ASR WebSocket 客户端
      const asrClient = createASRWebSocket()
      asrClientRef.current = asrClient

      // 设置消息和错误回调
      asrClient.onMessage(handleASRMessage)
      asrClient.onError(handleError)

      // 连接 WebSocket
      await asrClient.connect()

      // 发送 FirstASR 包（全0长度为1的字节数组）
      asrClient.startRecording()

      hasStartedRef.current = true
      setIsRecognizing(true)

      // 开始录音
      await audioRecorder.startRecording()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('启动语音识别失败')
      handleError(error)
      throw error
    }
  }, [audioRecorder, handleASRMessage, handleError])

  // 停止识别
  const stopRecognition = useCallback((): void => {
    hasStartedRef.current = false
    setIsRecognizing(false)

    // 停止录音
    audioRecorder.stopRecording()

    // 结束 ASR 会话
    if (asrClientRef.current) {
      asrClientRef.current.endRecording()
      asrClientRef.current.close()
      asrClientRef.current = null
    }
  }, [audioRecorder])

  // 清理资源
  useEffect(() => {
    return () => {
      if (asrClientRef.current) {
        asrClientRef.current.close()
      }
    }
  }, [])

  // 合并音频录制器的错误
  useEffect(() => {
    if (audioRecorder.error) {
      // 使用 setTimeout 避免同步状态更新
      setTimeout(() => handleError(audioRecorder.error!), 0)
    }
  }, [audioRecorder.error, handleError])

  return {
    startRecognition,
    stopRecognition,
    isRecognizing,
    recognitionText,
    error
  }
}
