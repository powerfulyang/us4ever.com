import { Buffer } from 'node:buffer'
import { PassThrough } from 'node:stream'
import ffmpeg from 'fluent-ffmpeg'

interface VideoInfo {
  width: number
  height: number
  duration: number
  fps: number
}

export async function getVideoDuration(input: File | ArrayBuffer): Promise<VideoInfo> {
  const videoStream = new PassThrough()

  if (input instanceof File) {
    const buffer = await input.arrayBuffer()
    videoStream.end(Buffer.from(buffer))
  }
  else {
    videoStream.end(Buffer.from(input))
  }

  return new Promise<VideoInfo>((resolve, reject) => {
    ffmpeg().addInput(videoStream).ffprobe((err, data) => {
      if (err) {
        reject(err)
        return
      }

      try {
        const duration = data.format.duration || 0
        const videoStream = data.streams.find(stream => stream.codec_type === 'video')

        if (!videoStream) {
          reject(new Error('No video stream found'))
          return
        }

        const width = videoStream.width || 0
        const height = videoStream.height || 0

        // 计算fps
        let fps = 0
        if (videoStream.r_frame_rate) {
          const [num, den] = videoStream.r_frame_rate.split('/').map(Number)
          if (den && num) {
            fps = num / den
          }
        }

        resolve({
          width,
          height,
          duration,
          fps,
        })
      }
      catch (error) {
        console.error('Error parsing video metadata:', error)
        resolve({
          width: 0,
          height: 0,
          duration: 0,
          fps: 0,
        })
      }
    })
  })
}
