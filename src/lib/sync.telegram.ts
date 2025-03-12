import * as cheerio from 'cheerio'
import dayjs from 'dayjs'

export async function syncTelegram() {
  const url = `https://telegram.dog/s/emt_channel`
  const html = await fetch(url).then(res => res.text())
  const $ = cheerio.load(html)

  return $('.tgme_widget_message_wrap').map((i, el) => {
    const $el = $(el)
    const content = $el.find('.tgme_widget_message_text').html()
    const time = $el.find('time').attr('datetime')
    const createdAt = dayjs(time).toDate()
    const id = $el.find('[data-post]').attr('data-post')
    const images = $el.find('.tgme_widget_message_photo_wrap')
      .map((_, el) => {
        const styleString = $(el).attr('style')
        const regex = /background-image\s*:\s*url\(['"]?(.*?)['"]?\)/i
        const match = styleString?.match(regex)
        const url = match?.[1] || ''

        return {
          url,
        }
      })
      .filter((_, x) => Boolean(x.url))
      .get()
    return {
      content,
      id,
      createdAt,
      images,
    }
  }).get()
}
