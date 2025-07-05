import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const BaseCategoryField = z
  .string()
  .transform(val => !val ? undefined : decodeURIComponent(val))
  .default('default')
  .optional()

export const BaseFormDataCategoryField = zfd
  .text()
  .transform(val => !val ? undefined : decodeURIComponent(val))
  .default('default')
  .optional()

export const BaseQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).default(9),
  cursor: z.string().optional().transform(val => !val ? undefined : val),
  category: BaseCategoryField,
})

export const BasePrimaryKeySchema = z.object({
  id: z.string().min(1, 'id不能为空'),
})

export const UpdateViewsSchema = z.object({
  updateViews: z.boolean().default(false),
})

export const QuerySearchSchema = z.object({
  query: z.string().min(1, 'query不能为空'),
})
