export interface BaseFilter {
  userId?: string
}

export interface BaseListFilter extends BaseFilter {
  isPublic?: boolean
}

export interface BaseUpdateInput {
  id: string
}

export interface BaseCreateInput {
  isPublic?: boolean
}
