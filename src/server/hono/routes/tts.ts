import { EdgeTTS, VoicesManager } from 'edge-tts-universal'
import { cors } from 'hono/cors'
import { app } from '@/server/hono'

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
      return ctx.json({ error: 'Text is required' }, 400)
    }

    try {
      const tts = new EdgeTTS(text, voice, { rate, volume, pitch })
      const result = await tts.synthesize()

      const arrayBuffer = await result.audio.arrayBuffer()
      ctx.header('Content-Type', result.audio.type || 'audio/mpeg')
      ctx.header('Cache-Control', 'public, max-age=31536000, immutable')
      return ctx.body(arrayBuffer)
    }
    catch (e: any) {
      return ctx.json({ error: e.message }, 500)
    }
  })

  app.post('/tts', async (ctx) => {
    const body = await ctx.req.json().catch(() => ({}))
    const { text, voice = 'zh-CN-XiaoxiaoNeural', rate, volume, pitch } = body

    if (!text) {
      return ctx.json({ error: 'Text is required' }, 400)
    }

    try {
      const tts = new EdgeTTS(text, voice, { rate, volume, pitch })
      const result = await tts.synthesize()

      const arrayBuffer = await result.audio.arrayBuffer()
      ctx.header('Content-Type', result.audio.type || 'audio/mpeg')
      ctx.header('Cache-Control', 'public, max-age=31536000, immutable')
      return ctx.body(arrayBuffer)
    }
    catch (e: any) {
      return ctx.json({ error: e.message }, 500)
    }
  })

  app.get('/tts/voices', async (ctx) => {
    try {
      const manager = await VoicesManager.create()
      const locale = ctx.req.query('locale')
      if (locale) {
        const voices = manager.find({ Locale: locale })
        return ctx.json(voices)
      }
      const voices = manager.find({})
      return ctx.json(voices)
    }
    catch (e: any) {
      return ctx.json({ error: e.message }, 500)
    }
  })
}
