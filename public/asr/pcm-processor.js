// pcm-processor.js
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.port.onmessage = this.handleMessage.bind(this)
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0] // 获取第一个输入（例如麦克风）
    if (input.length > 0) {
      const pcmData = input[0] // 单声道音频
      const int16Data = new Int16Array(pcmData.length)
      // 将 float32 PCM 数据转换为 16 位整数格式
      for (let i = 0; i < pcmData.length; i++) {
        let s = Math.max(-1, Math.min(1, pcmData[i]))
        s = s < 0 ? s * 0x8000 : s * 0x7FFF // 缩放到 16 位范围
        int16Data[i] = s
      }
      // 将处理后的数据发送到主线程
      this.port.postMessage(int16Data.buffer)
    }
    return true // 保持处理器存活
  }

  handleMessage(event) {
    // 处理来自主线程的消息（如果需要）
  }
}

registerProcessor('pcm-processor', PCMProcessor)
