/**
 * 表示上传进度事件的类
 */
class FetchProgressEvent {
  constructor(
    public lengthComputable: boolean,
    public loaded: number,
    public total: number,
  ) {}
}

/**
 * 计算流的总大小
 */
export async function getStreamSize(stream: ReadableStream): Promise<number> {
  const reader = stream.getReader()
  let size = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done)
      break
    size += value.length
  }

  return size
}

/**
 * 为请求添加进度跟踪功能
 * @param request 原始请求
 * @param onProgress 进度回调
 */
async function trackRequestProgress(
  request: Request,
  onProgress?: (evt: FetchProgressEvent) => void,
): Promise<Request> {
  if (!onProgress)
    return request

  // 检查浏览器支持
  const supportsStreaming = (() => {
    let isDuplex = false
    const test = new Request(request.url, {
      body: new ReadableStream(),
      method: 'POST',
      get duplex() {
        isDuplex = true
        return 'half' as const
      },
    })
    return isDuplex && !test.headers.has('Content-Type')
  })()

  if (!request.body || !supportsStreaming)
    return request

  const [stream1, stream2] = request.body.tee()
  const totalSize = await getStreamSize(stream1)
  let loaded = 0

  const progress = new TransformStream({
    start: () => {
      onProgress(new FetchProgressEvent(true, 0, totalSize))
    },
    transform: (chunk, controller) => {
      controller.enqueue(chunk)
      loaded += chunk.byteLength
      onProgress(new FetchProgressEvent(true, loaded, totalSize))
    },
    flush: () => {
      onProgress(new FetchProgressEvent(true, totalSize, totalSize))
    },
  })

  return new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body: stream2.pipeThrough(progress),
    duplex: 'half',
  })
}

export {
  FetchProgressEvent,
  trackRequestProgress,
}
