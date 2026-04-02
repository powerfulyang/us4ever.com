import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { BaseFormDataCategoryField } from '@/dto/base.dto'
import { adminProcedure, createTRPCRouter } from '@/server/api/trpc'
import { logger } from '@/server/logger'
import { assetService } from '@/service/asset.service'
import { uploadVideo } from '@/service/file.service'
import { keepService } from '@/service/keep'
import { momentService } from '@/service/moment'
import { updateAllKeepsTags, updateAllMomentsTags } from '@/service/tag.service'

export const adminRouter = createTRPCRouter({
  // 获取用户列表
  listUsers: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input
      logger.admin.info('Fetching user list', { page, pageSize, adminId: ctx.user.id })

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            group: true,
          },
        }),
        ctx.db.user.count(),
      ])

      logger.admin.info(`Found ${users.length} users`, { total })

      return {
        users,
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
      }
    }),

  // 上传图片（管理员）
  uploadImage: adminProcedure
    .input(zfd.formData({
      file: zfd.file(),
      isPublic: zfd.text().default('false'),
      category: BaseFormDataCategoryField,
    }))
    .mutation(async ({ input, ctx }) => {
      const isPublic = input.isPublic === 'true'
      logger.admin.info('Admin uploading image', {
        fileName: input.file.name,
        size: input.file.size,
        category: input.category,
        uploadedBy: ctx.user.id,
      })
      const result = await assetService.uploadImage({
        file: input.file,
        uploadedBy: ctx.user.id,
        isPublic,
        category: input.category,
      })
      logger.admin.info('Admin image uploaded successfully', { id: result.id })
      return result
    }),

  // 上传视频（管理员）
  uploadVideo: adminProcedure
    .input(zfd.formData({
      file: zfd.file(),
      isPublic: zfd.text().default('false'),
      category: BaseFormDataCategoryField,
    }))
    .mutation(async ({ input, ctx }) => {
      const isPublic = input.isPublic === 'true'
      logger.admin.info('Admin uploading video', {
        fileName: input.file.name,
        size: input.file.size,
        category: input.category,
        uploadedBy: ctx.user.id,
      })
      const result = await uploadVideo({
        file: input.file,
        uploadedBy: ctx.user.id,
        isPublic,
        category: input.category,
      })
      logger.admin.info('Admin video uploaded successfully', { id: result.id })
      return result
    }),

  // 批量生成标签
  batchTags: adminProcedure
    .mutation(async ({ ctx }) => {
      logger.admin.info('Batch tag generation request', { userId: ctx.user.id })

      const momentCount = await updateAllMomentsTags()
      const keepCount = await updateAllKeepsTags()

      logger.admin.info('Batch tag generation completed', { momentCount, keepCount, userId: ctx.user.id })
      return { success: true, momentCount, keepCount }
    }),

  // Keep 向量回填
  backfillKeep: adminProcedure
    .mutation(async ({ ctx }) => {
      logger.admin.info('Keep vector backfill request', { userId: ctx.user.id })

      const result = await keepService.backfillVectors()

      logger.admin.info('Keep vector backfill completed', { processed: result.processed, userId: ctx.user.id })
      return result
    }),

  // Moment 向量回填
  backfillMoment: adminProcedure
    .mutation(async ({ ctx }) => {
      logger.admin.info('Moment vector backfill request', { userId: ctx.user.id })

      const result = await momentService.backfillVectors()

      logger.admin.info('Moment vector backfill completed', { processed: result.processed, userId: ctx.user.id })
      return result
    }),
})
