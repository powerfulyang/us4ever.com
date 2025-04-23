import { BASE_URL } from '@/lib/constants'
import { NextResponse } from 'next/server'
import { Builder } from 'xml2js'

interface SitemapData {
  sitemapindex: {
    $: {
      xmlns: string
    }
    sitemap: Array<{
      loc: Array<string>
    }>
  }
}

const sitemapData: SitemapData = {
  sitemapindex: {
    $: {
      xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
    },
    sitemap: [
      {
        loc: [`${BASE_URL}/application/sitemap.xml`],
      },
      {
        loc: [`${BASE_URL}/keep/sitemap.xml`],
      },
      {
        loc: [`${BASE_URL}/moment/sitemap.xml`],
      },
    ],
  },
}

export async function GET() {
  const builder = new Builder({
    xmldec: {
      version: '1.0',
      encoding: 'UTF-8',
    },
  })

  const xml = builder.buildObject(sitemapData)

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
