import xmind from 'simple-mind-map/src/parse/xmind.js'

export async function parseXMindFile(file: File) {
  return xmind.parseXmindFile(file)
}
