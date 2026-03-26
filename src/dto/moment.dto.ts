import { z } from 'zod'
import { BaseCategoryField } from '@/dto/base.dto'

export const queryMomentPageSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(6),
  category: BaseCategoryField,
  visibility: z.enum(['all', 'public', 'private']).default('all'),
})

export type QueryMomentPageDTO = z.infer<typeof queryMomentPageSchema>
