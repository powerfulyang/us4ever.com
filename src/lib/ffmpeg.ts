import { Buffer } from 'node:buffer'
import { PassThrough } from 'node:stream'
import ffmpeg from 'fluent-ffmpeg'

export async function getVideoDuration(input: File) {
  const videoStream = new PassThrough()
  const buffer = await input.arrayBuffer()
  videoStream.end(Buffer.from(buffer))
  return new Promise<number>((resolve, reject) => {
    ffmpeg().addInput(videoStream).ffprobe((err, data) => {
      if (err) {
        reject(err)
      }
      const duration = data.format.duration
      if (duration) {
        resolve(duration)
      }
      else {
        reject(new Error('Failed to get video duration'))
      }
    })
  })
}
