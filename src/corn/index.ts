import { env } from '@/env'
import { extractText } from '@/lib/extractText'
import { extractTitle, summaryContent } from '@/lib/gemini'
import { db } from '@/server/db'
import { concatMap, filter, interval, startWith } from 'rxjs'

async function keepCorn() {
  // keep 相关总结
  // 获取需要更新标题的记录
  const keep = await db.keep.findFirst({
    where: {
      OR: [
        {
          title: '',
        },
        {
          summary: '',
        },
      ],
    },
  })

  if (!keep)
    return 'no keep need update'

  // 遍历记录并生成标题
  if (!keep.title) {
    const title = await extractTitle(keep.content)
    const result = await db.keep.update({
      where: { id: keep.id },
      data: { title },
    })
    return `【${result.id}】[${result.title}] updated successfully.`
  }
  if (!keep.summary) {
    const summary = await summaryContent(keep.content)
    const result = await db.keep.update({
      where: { id: keep.id },
      data: { summary },
    })
    return `【${result.id}】[${result.summary}] updated successfully.`
  }
}

async function mindMapCorn() {
  // mindmap 总结
  // summary 为空字符串的
  const mindmap = await db.mindMap.findFirst({
    where: {
      summary: '',
    },
  })

  if (!mindmap)
    return 'no mindmap need update'

  if (!mindmap.summary) {
    const content = extractText(mindmap.content)
    const summary = await summaryContent(content)
    const result = await db.mindMap.update({
      where: { id: mindmap.id },
      data: { summary },
    })

    return `【${result.id}】[${result.summary}] updated successfully.`
  }
}

// 每 3分钟 执行一次任务，一次只处理一条
interval(1000 * 60 * 3)
  .pipe(
    startWith(env.NODE_ENV),
    filter(value => value !== 'production'),
    concatMap(async () => {
      return (await keepCorn()) || (await mindMapCorn())
    }),
  )
  .subscribe({
    next: result => console.log(result),
    error: err => console.error('Subscription failed:', err),
  })
