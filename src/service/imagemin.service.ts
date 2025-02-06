import sharp from 'sharp'

export interface ImageminOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp' | 'avif'
}

/**
 * Compress an image with the specified options.
 *
 * @param input - The image as an ArrayBuffer.
 * @param options - The options for the image compression.
 * @param options.width - The desired width of the output image.
 * @param options.height - The desired height of the output image.
 * @param options.quality - The desired quality of the output image from 1 to 100.
 * @param options.format - The desired format of the output image. Defaults to 'avif'.
 * @returns The compressed image as an ArrayBuffer.
 */
export async function imageminService(
  input: ArrayBuffer,
  options: ImageminOptions = {},
): Promise<ArrayBuffer> {
  const {
    width,
    height,
    quality,
    format = 'avif',
  } = options

  const image = sharp(input)
    // 根据 metadata 自动旋转，解决 iOS 旋转问题
    .rotate()

  return image
    .resize({
      width,
      height,
      // background: { r: 0, g: 0, b: 0, alpha: 0 }, // 设置透明背景
    })
    .toFormat(format, {
      quality,
    })
    .toBuffer()
}
