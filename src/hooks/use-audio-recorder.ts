import { useCallback, useRef, useState } from 'react'

export interface UseAudioRecorder {
  startRecording(): Promise<void>
  stopRecording(): void
  isRecording: boolean
  error: Error | null
}

interface UseAudioRecorderOptions {
  onAudioData?: (data: ArrayBuffer) => void
  sampleRate?: number
  chunkDuration?: number // 毫秒
}

export const useAudioRecorder = (options: UseAudioRecorderOptions = {}): UseAudioRecorder => {
  const { onAudioData, sampleRate = 16000, chunkDuration = 600 } = options
  
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const audioBufferRef = useRef<Float32Array[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 将 Float32Array 转换为 Int16Array PCM 格式
  const floatTo16BitPCM = (float32Array: Float32Array): Int16Array => {
    const buffer = new ArrayBuffer(float32Array.length * 2)
    const view = new DataView(buffer)
    let offset = 0
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, float32Array[i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
    return new Int16Array(buffer)
  }

  // 发送音频数据
  const sendAudioChunk = useCallback(() => {
    if (audioBufferRef.current.length === 0) return

    // 合并所有缓冲的音频数据
    const totalLength = audioBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0)
    const mergedBuffer = new Float32Array(totalLength)
    let offset = 0
    
    for (const chunk of audioBufferRef.current) {
      mergedBuffer.set(chunk, offset)
      offset += chunk.length
    }

    // 转换为 PCM 格式
    const pcmData = floatTo16BitPCM(mergedBuffer)
    
    // 发送数据
    if (onAudioData) {
      onAudioData(pcmData.buffer as ArrayBuffer)
    }

    // 清空缓冲区
    audioBufferRef.current = []
  }, [onAudioData])

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      setError(null)
      
      // 获取麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      mediaStreamRef.current = stream

      // 创建 AudioContext
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const audioContext = new AudioContextClass({
        sampleRate
      })
      audioContextRef.current = audioContext

      // 创建音频源
      const source = audioContext.createMediaStreamSource(stream)

      // 创建 ScriptProcessorNode 处理音频数据
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (event) => {
        if (!isRecording) return

        const inputBuffer = event.inputBuffer
        const inputData = inputBuffer.getChannelData(0)
        
        // 将音频数据添加到缓冲区
        audioBufferRef.current.push(new Float32Array(inputData))
      }

      // 连接音频节点
      source.connect(processor)
      processor.connect(audioContext.destination)

      // 开始定期发送音频数据
      intervalRef.current = setInterval(sendAudioChunk, chunkDuration)

      setIsRecording(true)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('获取麦克风权限失败')
      setError(error)
      throw error
    }
  }, [isRecording, sampleRate, chunkDuration, sendAudioChunk])

  const stopRecording = useCallback((): void => {
    setIsRecording(false)

    // 停止定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // 发送最后一批音频数据
    sendAudioChunk()

    // 停止媒体流
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    // 断开音频节点
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }

    // 关闭 AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // 清空缓冲区
    audioBufferRef.current = []
  }, [sendAudioChunk])

  return {
    startRecording,
    stopRecording,
    isRecording,
    error
  }
}
