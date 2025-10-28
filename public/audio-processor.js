// audio-processor.js
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.sampleRate = 48000;
    this.targetDurationMs = 600;
    this.bufferSize = Math.floor(this.sampleRate * this.targetDurationMs / 1000);
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    
    // 静音检测相关
    this.silenceThreshold = -40; // dB 阈值，低于此值认为是静音
    this.silenceDurationMs = 4000; // 4秒静音后自动停止
    this.silenceStartTime = null;
    this.lastVolumeTime = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const inputData = input[0];

      // 计算 RMS 音量
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        this.buffer[this.bufferIndex] = inputData[i];
        sum += inputData[i] * inputData[i];
        this.bufferIndex++;
      }
      const rms = Math.sqrt(sum / inputData.length);
      const volume = 20 * Math.log10(rms + 1e-10); // dB

      // 静音检测逻辑
      const currentTime = Date.now();
      const isSilent = volume < this.silenceThreshold;
      
      if (isSilent) {
        // 开始静音计时
        if (this.silenceStartTime === null) {
          this.silenceStartTime = currentTime;
        } else {
          // 检查是否超过静音时长
          const silenceDuration = currentTime - this.silenceStartTime;
          if (silenceDuration >= this.silenceDurationMs) {
            // 发送自动停止信号
            this.port.postMessage({
              type: 'autoStop',
              volume: volume
            });
            return false; // 停止处理器
          }
        }
      } else {
        // 有声音，重置静音计时
        this.silenceStartTime = null;
      }

      // 每 600 ms 发送一次
      if (this.bufferIndex >= this.bufferSize) {
        this.port.postMessage({
          type: 'audioData',
          data: new Float32Array(this.buffer), // 拷贝
          volume,
        });
        this.bufferIndex = 0;
      }
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);