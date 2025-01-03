import { extractTitle, summaryContent } from '@/lib/gemini'
import { db } from '@/server/db'
import { catchError, concatMap, from, interval, of, retry } from 'rxjs'

// 每 60 秒执行一次任务
interval(1000 * 60)
  .pipe(
    concatMap(() =>
      from(
        (async () => {
          // 获取需要更新标题的记录
          const keeps = await db.keep.findMany({
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

          if (!keeps.length)
            return 'No keeps to update.'

          // 遍历记录并生成标题
          const updates = []
          for (const keep of keeps) {
            const title = await extractTitle(keep.content)
            const summary = await summaryContent(keep.content)
            updates.push(
              db.keep.update({
                where: { id: keep.id },
                data: { title, summary },
              }),
            )
          }

          // 等待所有更新完成
          await Promise.all(updates)
          return `${keeps.length} keeps updated successfully.`
        })(),
      ).pipe(
        catchError((err) => {
          console.error('Error updating keeps:', err)
          return of('Error occurred.')
        }),
      ),
    ),
    retry(3),
  )
  .subscribe({
    next: result => console.log(result),
    error: err => console.error('Subscription failed:', err),
  })
