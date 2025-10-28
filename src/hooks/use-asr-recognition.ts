import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { env } from "@/env";
import type { ASRResponse } from "@/apis/requests/asr";
import { tokenStore } from "@/lib/request";

interface UseAsrRecognitionReturn {
  status: "idle" |'pending'| "recognizing";
  recognizedText: string;
  startRecognition: () => void;
  stopRecognition: () => void;
  error: string | null;
}

export function useAsrRecognition({onMessage}:{
  onMessage: (message: ASRResponse) => void
}): UseAsrRecognitionReturn {
  const [status, setStatus] = useState<"idle" |'pending'| "recognizing">("idle");
  const [recognizedText, setRecognizedText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);
  const isFirstPacketRef = useRef(true);

  // 清理资源
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    isFirstPacketRef.current = true;
    setStatus("idle");
  }, []);

  // 发送音频数据到 WebSocket
  const sendAudioData = useCallback((audioData: Float32Array) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    // 转换为 PCM 16位格式
    const pcmData = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      pcmData[i] = Math.max(-32768, Math.min(32767, audioData[i] * 32768));
    }

    // 发送首包
    if (isFirstPacketRef.current) {
      const firstPacket = new Uint8Array([0]);
      wsRef.current.send(firstPacket);
      isFirstPacketRef.current = false;
    }

    // 发送音频数据包 (约600ms长度，28800样本)
    wsRef.current.send(pcmData.buffer);
  }, []);

  // 停止录音时发送尾包
  const sendLastPacket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const lastPacket = new Uint8Array([1]);
      wsRef.current.send(lastPacket);
    }
  }, []);

  // 停止语音识别
  const stopRecognition = useCallback(() => {
    try {
      // 发送尾包
      sendLastPacket();
      toast.success("停止语音识别");
    } catch (err) {
      console.error("停止语音识别失败:", err);
      setError("停止语音识别失败");
    } finally {
      cleanup();
    }
  }, [sendLastPacket, cleanup]);

  // 开始语音识别
  const startRecognition = useCallback(async () => {
    setStatus("pending");
    try {
      setError(null);
      setRecognizedText("");

      // 获取麦克风权限 (48kHz采样率，单声道，600ms包长度)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000, // 48kHz采样率
          channelCount: 1,   // 单声道
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaStreamRef.current = stream;

      // 创建音频上下文 (48kHz采样率，匹配麦克风配置)
      const audioContext = new AudioContext({ sampleRate: 48000 });
      audioContextRef.current = audioContext;

      // 创建音频源
      const source = audioContext.createMediaStreamSource(stream);

      // 加载并创建 AudioWorklet 处理器
      await audioContext.audioWorklet.addModule('/audio-processor.js');
      const processor = new AudioWorkletNode(audioContext, 'audio-processor');
      processorRef.current = processor;

      // 监听音频数据
      processor.port.onmessage = (event) => {
        if (event.data.type === 'audioData') {
          console.log(event.data.volume)
          sendAudioData(event.data.data);
        } else if (event.data.type === 'autoStop') {
          // 处理自动停止信号
          console.log('检测到静音，自动停止语音识别');
          toast.info('检测到静音，自动停止语音识别');
          stopRecognition();
        }
      };

      // 连接音频节点
      source.connect(processor);
      processor.connect(audioContext.destination);
      // 建立 WebSocket 连接
      const ws = new WebSocket(env.VITE_ASR_WS_URL);
      wsRef.current = ws;
      ws.onopen = () => {
        // 发送初始化消息
        ws.send(JSON.stringify({
          "Authorization": tokenStore.get()
        }));
        setStatus("recognizing");
        toast.success("开始语音识别");
      };

      ws.onmessage = (event) => {
        try {
          const response: ASRResponse = JSON.parse(event.data);
          onMessage(response);
          if (response.is_final) {
            // 最终响应，替换全部文本
            setRecognizedText(response.text);
            toast.success("语音识别完成");
          } else {
            // 中间响应，追加文本
            setRecognizedText(prev => prev + response.text);
          }
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
  }, [sendAudioData, cleanup, onMessage, stopRecognition]);


  // 组件卸载时清理资源
  useEffect(() => cleanup, [cleanup]);

  return {
    status,
    recognizedText,
    startRecognition,
    stopRecognition,
    error,
  };
}
