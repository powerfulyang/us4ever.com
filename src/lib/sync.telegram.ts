import * as cheerio from 'cheerio'

export async function syncTelegram() {
  const url = `https://telegram.dog/s/emt_channel`
  const html = await fetch(url).then(res => res.text())
  const $ = cheerio.load(html)

  return $('.tgme_widget_message_wrap').map((i, el) => {
    const $el = $(el)
    const content = $el.find('.tgme_widget_message_text').html()
    const id = $el.find('[data-post]').attr('data-post')
    return {
      content,
      id,
    }
  }).get()
}
