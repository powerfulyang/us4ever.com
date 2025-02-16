import { env } from '@/env'
import { extractText } from '@/lib/extractText'
import { extractTitle, summaryContent } from '@/lib/gemini'
import { db } from '@/server/db'
import { concatMap, filter, interval, startWith } from 'rxjs'

async function keepCorn() {
  // 获取所有需要更新的记录
  const keeps = await db.keep.findMany({
    where: {
      OR: [
        { title: '' },
        { summary: '' },
      ],
    },
  })

  if (keeps.length === 0)
    return 'no keep need update'

  const results = []
  for (const keep of keeps) {
    try {
      if (!keep.title) {
        const title = await extractTitle(keep.content)
        const result = await db.keep.update({
          where: { id: keep.id },
          data: { title },
        })
        results.push(`【${result.id}】[${result.title}] title updated.`)
      }
      if (!keep.summary) {
        const summary = await summaryContent(keep.content)
        const result = await db.keep.update({
          where: { id: keep.id },
          data: { summary },
        })
        results.push(`【${result.id}】[${result.summary}] summary updated.`)
      }
    }
    catch (error) {
      console.error(`Error processing keep ${keep.id}:`, error)
      results.push(`【${keep.id}】处理失败: ${error.message}`)
    }
  }

  return results.join('\n')
}

async function mindMapCorn() {
  // 获取所有需要更新的思维导图
  const mindmaps = await db.mindMap.findMany({
    where: {
      summary: '',
    },
  })

  if (mindmaps.length === 0)
    return 'no mindmap need update'

  const results = []
  for (const mindmap of mindmaps) {
    try {
      const content = extractText(mindmap.content)
      const summary = await summaryContent(content)
      const result = await db.mindMap.update({
        where: { id: mindmap.id },
        data: { summary },
      })
      results.push(`【${result.id}】[${result.summary}] updated.`)
    }
    catch (error) {
      console.error(`Error processing mindmap ${mindmap.id}:`, error)
      results.push(`【${mindmap.id}】处理失败: ${error.message}`)
    }
  }

  return results.join('\n')
}

// 每 3分钟 执行一次任务，批量处理所有需要更新的数据
interval(1000 * 60 * 3)
  .pipe(
    startWith(env.NODE_ENV),
    filter(value => value !== 'production'),
    concatMap(async () => {
      const keepResults = await keepCorn()
      const mindMapResults = await mindMapCorn()
      return [keepResults, mindMapResults].filter(result => result !== 'no keep need update' && result !== 'no mindmap need update').join('\n\n')
    }),
  )
  .subscribe({
    next: (result) => {
      if (result)
        console.log('处理结果:\n', result)
      else
        console.log('没有需要处理的数据')
    },
    error: err => console.error('任务执行失败:', err),
  })
