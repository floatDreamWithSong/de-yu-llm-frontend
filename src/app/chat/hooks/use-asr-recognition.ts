import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { env } from "@/env";
import type { ASRResponse } from "@/apis/requests/asr";
import { tokenStore } from "@/lib/request";
import RecordRTC from "recordrtc";
declare global {
  interface Window {
    EXPORT_FILE_FLAG: boolean;
  }
}
window.EXPORT_FILE_FLAG = false;
interface UseAsrRecognitionReturn {
  status: "idle" | "pending" | "recognizing";
  startRecognition: () => void;
  stopRecognition: () => void;
  error: string | null;
}
export function useAsrRecognition({
  onMessage,
}: {
  onMessage: (recognizedText: string) => void;
}): UseAsrRecognitionReturn {
  const [status, setStatus] = useState<"idle" | "pending" | "recognizing">(
    "idle"
  );
  const onlineTextRef = useRef<string>("");
  const offlineTextRef = useRef<string>("");
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const clearText = () => {
    onlineTextRef.current = "";
    offlineTextRef.current = "";
  };
  // 清理资源
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (recorderRef.current) {
      recorderRef.current.stopRecording();
      recorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    clearText();
    setStatus("idle");
  }, []);

  // 发送音频数据到 WebSocket
  const sendAudioData = useCallback((audioData: Blob) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);

      // 发送音频数据包
      wsRef.current?.send(uint8Array);
    };
    reader.readAsArrayBuffer(audioData);
  }, []);

  // 停止语音识别时发送尾包
  const sendLastPacket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const lastPacket = new Uint8Array([255]); // 全为1的字节 (0xFF)
      wsRef.current.send(lastPacket);
    }
  }, []);

  // 停止语音识别
  const stopRecognition = useCallback(() => {
    try {
      sendLastPacket();

      // 停止录音并在回调中导出 WAV 文件
      if (recorderRef.current) {
        recorderRef.current.stopRecording(() => {
          if (!import.meta.env.DEV && !window.EXPORT_FILE_FLAG) return;
          try {
            const blob = recorderRef.current?.getBlob();

            // 检查 Blob 是否有效且不为空
            if (blob && blob.size > 0) {
              const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
              const fileName = `asr_recording_${timestamp}.wav`;

              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);

              console.log(
                `导出 WAV 文件: ${fileName}, 大小: ${(blob.size / 1024).toFixed(
                  2
                )} KB`
              );
            } else {
              console.warn("录音数据为空，跳过导出");
            }
          } catch (blobError) {
            console.error("导出 WAV 文件失败:", blobError);
          }
        });
      }
      toast.info("正在停止语音识别，请稍后...");
    } catch (err) {
      console.error("停止语音识别失败:", err);
      setError("停止语音识别失败");
    } finally {
      timeoutRef.current = setTimeout(() => {
        cleanup();
        timeoutRef.current = null;
      }, 3000);
    }
  }, [sendLastPacket, cleanup]);

  // 开始语音识别
  const startRecognition = useCallback(async () => {
    if (timeoutRef.current) return;
    setStatus("pending");
    try {
      setError(null);
      clearText();

      // 获取麦克风权限 (48kHz采样率，单声道，600ms包长度)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000, // 48kHz采样率
          channelCount: 1, // 单声道
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaStreamRef.current = stream;

      // 创建 RecordRTC 录音机
      const options: RecordRTC.Options = {
        type: "audio",
        recorderType: RecordRTC.StereoAudioRecorder,
        mimeType: "audio/wav",
        numberOfAudioChannels: 1,
        sampleRate: 48000,
        desiredSampRate: 48000,
        bufferSize: 16384,
        timeSlice: 600, // 600ms 切片，匹配原来的包大小
        ondataavailable: sendAudioData
      };

      const recorder = new RecordRTC(stream, options);
      recorderRef.current = recorder;

      // 建立 WebSocket 连接
      const ws = new WebSocket(env.VITE_ASR_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        // 发送初始化消息
        ws.send(
          JSON.stringify({
            Authorization: tokenStore.get(),
          })
        );

        // 发送首包 (FirstASR包，全0长度为1的字节数组)
        const firstPacket = new Uint8Array([0]);
        ws.send(firstPacket);

        // 开始录制
        recorder.startRecording();
        setStatus("recognizing");
        toast.success("开始语音识别");
      };

      ws.onmessage = (event) => {
        try {
          const response: ASRResponse = JSON.parse(event.data);
          if (response.is_final) {
            // 最终响应，替换全部文本
            onlineTextRef.current = "";
            offlineTextRef.current = response.text;
          } else {
            if (response.mode === "2pass-online") {
              onlineTextRef.current += response.text;
            } else {
              offlineTextRef.current += response.text;
              onlineTextRef.current = "";
            }
          }
          onMessage(offlineTextRef.current + onlineTextRef.current);
        } catch (err) {
          console.error("解析 ASR 响应失败:", err);
          setError("解析识别结果失败");
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket 错误:", err);
        setError("语音识别连接失败");
        toast.error("语音识别连接失败");
        cleanup();
      };

      ws.onclose = (event) => {
        console.log("WebSocket 连接关闭", event);
        cleanup();
      };
    } catch (err) {
      console.error("启动语音识别失败:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("麦克风权限被拒绝");
          toast.error("请允许麦克风权限");
        } else if (err.name === "NotFoundError") {
          setError("未找到麦克风设备");
          toast.error("未找到麦克风设备");
        } else {
          setError("启动语音识别失败");
          toast.error("启动语音识别失败");
        }
      } else {
        setError("未知错误");
        toast.error("启动语音识别失败");
      }
      cleanup();
    }
  }, [sendAudioData, cleanup, onMessage]);

  // 组件卸载时清理资源
  useEffect(() => cleanup, [cleanup]);

  return {
    status,
    startRecognition,
    stopRecognition,
    error,
  };
}
