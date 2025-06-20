export interface BaseFilter {
  userIds?: string[]
  userId?: string
}

export interface BaseListFilter extends BaseFilter {
  isPublic?: boolean
  category?: string
}

export interface BaseUpdateInput {
  id: string
}

export interface BaseCreateInput {
  isPublic?: boolean
}
