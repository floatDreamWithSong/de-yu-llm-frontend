import z from 'zod'
import { env } from '@/env';

const ResponseChunkSchema = z.object({
  is_final: z.boolean(),
  mode: z.string(),
  text: z.string(),
  wav_name: z.string(),
})
const ResponseFinalChunkSchema = z.object({
  is_final: z.literal(true),
  mode: z.literal("2pass-offline"),
  stamp_sents: z.array(z.object({
    end: z.number(),
    punc: z.string(),
    start: z.number(),
    text_seg: z.string(),
    ts_list: z.array(z.array(z.number())),
  })),
  text: z.string(),
  timestamp: z.string(),
  wav_name: z.string(),
})
const ResponseSchema = z.union([ResponseChunkSchema, ResponseFinalChunkSchema])

export type ASRResponse = z.infer<typeof ResponseSchema>

export interface ASRClient {
  connect(): Promise<void>
  startRecording(): void
  sendAudio(data: ArrayBuffer): void
  endRecording(): void
  onMessage(callback: (text: string, isFinal: boolean) => void): void
  onError(callback: (error: Error) => void): void
  close(): void
}

export const createASRWebSocket = (): ASRClient => {
  let socket: WebSocket | null = null
  let messageCallback: ((text: string, isFinal: boolean) => void) | null = null
  let errorCallback: ((error: Error) => void) | null = null
  let isConnected = false

  const connect = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        socket = new WebSocket(env.VITE_ASR_WS_URL)
        
        socket.onopen = () => {
          isConnected = true
          // 发送初始化消息
          socket?.send(JSON.stringify({}))
          resolve()
        }

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            const response = ResponseSchema.parse(data)
            
            if (messageCallback) {
              messageCallback(response.text, response.is_final)
            }
          } catch (error) {
            if (errorCallback) {
              errorCallback(new Error(`解析响应失败: ${error}`))
            }
          }
        }

        socket.onerror = () => {
          if (errorCallback) {
            errorCallback(new Error('WebSocket 连接错误'))
          }
          reject(new Error('WebSocket 连接错误'))
        }

        socket.onclose = () => {
          isConnected = false
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  const startRecording = (): void => {
    if (!socket || !isConnected) {
      if (errorCallback) {
        errorCallback(new Error('WebSocket 未连接'))
      }
      return
    }
    // 发送 FirstASR 包（全0长度为1的字节数组）
    const firstASR = new Uint8Array([0])
    socket.send(firstASR.buffer)
  }

  const sendAudio = (data: ArrayBuffer): void => {
    if (!socket || !isConnected) {
      if (errorCallback) {
        errorCallback(new Error('WebSocket 未连接'))
      }
      return
    }
    socket.send(data)
  }

  const endRecording = (): void => {
    if (!socket || !isConnected) {
      if (errorCallback) {
        errorCallback(new Error('WebSocket 未连接'))
      }
      return
    }
    // 发送 LastASR 包（全1长度为1的字节数组）
    const lastASR = new Uint8Array([1])
    socket.send(lastASR.buffer)
  }

  const onMessage = (callback: (text: string, isFinal: boolean) => void): void => {
    messageCallback = callback
  }

  const onError = (callback: (error: Error) => void): void => {
    errorCallback = callback
  }

  const close = (): void => {
    if (socket) {
      socket.close()
      socket = null
    }
    isConnected = false
    messageCallback = null
    errorCallback = null
  }

  return {
    connect,
    startRecording,
    sendAudio,
    endRecording,
    onMessage,
    onError,
    close
  }
}