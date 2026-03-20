import { EdgeTTS, VoicesManager } from 'edge-tts-universal'
import { cors } from 'hono/cors'
import { app } from '@/server/hono'
import { logger } from '@/server/logger'

export function loadTtsRouter() {
  app.use('/tts', cors())
  app.use('/tts/*', cors())

  app.get('/tts', async (ctx) => {
    const text = ctx.req.query('text')
    const voice = ctx.req.query('voice') || 'zh-CN-XiaoxiaoNeural'
    const rate = ctx.req.query('rate')
    const volume = ctx.req.query('volume')
    const pitch = ctx.req.query('pitch')

    if (!text) {
      logger.tts.warn('TTS request missing text parameter')
      return ctx.json({ error: 'Text is required' }, 400)
    }

    logger.tts.info('TTS synthesis request', { textLength: text.length, voice, rate, volume, pitch })

    try {
      const tts = new EdgeTTS(text, voice, { rate, volume, pitch })
      const result = await tts.synthesize()

      const arrayBuffer = await result.audio.arrayBuffer()
      ctx.header('Content-Type', result.audio.type || 'audio/mpeg')
      ctx.header('Cache-Control', 'public, max-age=31536000, immutable')
      logger.tts.info('TTS synthesis successful', { size: arrayBuffer.byteLength })
      return ctx.body(arrayBuffer)
    }
    catch (e: any) {
      logger.tts.error('TTS synthesis failed', { error: e.message })
      return ctx.json({ error: e.message }, 500)
    }
  })

  app.post('/tts', async (ctx) => {
    const body = await ctx.req.json().catch(() => ({}))
    const { text, voice = 'zh-CN-XiaoxiaoNeural', rate, volume, pitch } = body

    if (!text) {
      logger.tts.warn('TTS POST request missing text parameter')
      return ctx.json({ error: 'Text is required' }, 400)
    }

    logger.tts.info('TTS synthesis POST request', { textLength: text.length, voice })

    try {
      const tts = new EdgeTTS(text, voice, { rate, volume, pitch })
      const result = await tts.synthesize()

      const arrayBuffer = await result.audio.arrayBuffer()
      ctx.header('Content-Type', result.audio.type || 'audio/mpeg')
      ctx.header('Cache-Control', 'public, max-age=31536000, immutable')
      logger.tts.info('TTS POST synthesis successful', { size: arrayBuffer.byteLength })
      return ctx.body(arrayBuffer)
    }
    catch (e: any) {
      logger.tts.error('TTS POST synthesis failed', { error: e.message })
      return ctx.json({ error: e.message }, 500)
    }
  })

  app.get('/tts/voices', async (ctx) => {
    logger.tts.info('Fetching TTS voices')
    try {
      const manager = await VoicesManager.create()
      const locale = ctx.req.query('locale')
      if (locale) {
        const voices = manager.find({ Locale: locale })
        logger.tts.info(`Found ${voices.length} voices for locale`, { locale })
        return ctx.json(voices)
      }
      const voices = manager.find({})
      logger.tts.info(`Found ${voices.length} total voices`)
      return ctx.json(voices)
    }
    catch (e: any) {
      logger.tts.error('Failed to fetch voices', { error: e.message })
      return ctx.json({ error: e.message }, 500)
    }
  })

  logger.tts.startup('TTS router loaded')
}
