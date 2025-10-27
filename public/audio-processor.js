class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // 600ms 对应的样本数 (48000 * 0.6 = 28800)
    this.sampleRate = 48000;
    this.targetDurationMs = 600;
    this.bufferSize = Math.floor(this.sampleRate * this.targetDurationMs / 1000);
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const inputData = input[0];
      
      for (let i = 0; i < inputData.length; i++) {
        this.buffer[this.bufferIndex] = inputData[i];
        this.bufferIndex++;
        
        // 检查是否达到目标缓冲区大小
        if (this.bufferIndex >= this.bufferSize) {
          // 发送当前缓冲区中的数据
          this.port.postMessage({
            type: 'audioData',
            data: new Float32Array(this.buffer.slice(0, this.bufferIndex))
          });
          
          // 重置缓冲区
          this.bufferIndex = 0;
        }
      }
    }
    
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);