import { extractTitle, summaryContent } from '@/lib/gemini'
import { db } from '@/server/db'
import { concatMap, interval } from 'rxjs'

// 每 3分钟 执行一次任务，一次只处理一条
interval(1000 * 60 * 3)
  .pipe(
    concatMap(async () => {
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
        return 'No keeps to update.'

      // 遍历记录并生成标题
      if (!keep.title) {
        const title = await extractTitle(keep.content)
        const result = await db.keep.update({
          where: { id: keep.id },
          data: { title },
        })
        return `${result.id}[${result.title}] updated successfully.`
      }
      if (!keep.summary) {
        const summary = await summaryContent(keep.content)
        const result = await db.keep.update({
          where: { id: keep.id },
          data: { summary },
        })
        return `${result.id}[${result.title}] updated successfully.`
      }
    }),
  )
  .subscribe({
    next: result => console.log(result),
    error: err => console.error('Subscription failed:', err),
  })
