import { db } from '@/server/db'
import { app, auth } from '@/server/hono'
import { delete_object, list_all_objects } from '@/service/s3.service'
import { uploadFile } from '@/service/upload.service'
import { sha256 } from 'hono/utils/crypto'

export function loadBucketRouter() {
  app.use(auth).get('/sync/bucket/powerfulyang', async (ctx) => {
    const user = ctx.get('user')
    const objects = await list_all_objects('powerfulyang')
    for (const object of objects) {
      const blob = await fetch(`https://r2.powerfulyang.com/${object.Key}`).then(res => res.blob())
      const hash = await sha256(await blob.arrayBuffer())
      if (!hash)
        continue
      // 从 db 查询是否存在
      const file = await db.file.findFirst({
        where: {
          hash,
        },
      })
      if (file) {
        // 如果存在则从 bucket 删除
        await delete_object('powerfulyang', object.Key)
      }
      else {
        // 下载文件
        const file = new File([blob], object.Key, { type: blob.type })
        await uploadFile({
          file,
          uploadedBy: user.id,
          isPublic: true,
          category: 'powerfulyang',
        })
      }
    }
    return ctx.json({ success: true })
  })
}
