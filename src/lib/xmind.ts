import xmind from 'simple-mind-map/src/parse/xmind.js'

export async function parseXMindFile(file: File): Promise<Record<any, any>> {
  return xmind.parseXmindFile(file)
}
