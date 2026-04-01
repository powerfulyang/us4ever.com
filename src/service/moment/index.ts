/**
 * Moment Service 模块入口
 * 统一导出所有 moment 相关服务
 */

// 类型定义
// 聚合服务对象（兼容旧版导入方式）
import * as coreService from './core.service'
import * as queryService from './query.service'
import * as searchService from './search.service'
import * as vectorService from './vector.service'

// 核心服务
export {
  addMomentAttachment,
  createMoment,
  deleteMoment,
  fetchPublicItems,
  findMoment,
  getMomentById,
  incrementMomentViews,
  updateMoment,
} from './core.service'

// 查询服务
export {
  findByTag,
  findMomentsByCursor,
  findMomentsByPage,
  getCategories,
  listMoments,
} from './query.service'

// 搜索服务
export {
  hybridSearch,
  searchAndFetchMoments,
  searchMoments,
  semanticSearch,
} from './search.service'

// 数据转换器
export { transformMomentListResponse, transformMomentResponse } from './transformer'

export * from './types'

// 向量服务
export {
  backfillVectors,
  updateMomentVectors,
} from './vector.service'

// 查询条件构建器
export { buildMomentWhereClause } from './where-clause'

export const momentService = {
  // Core
  createMoment: coreService.createMoment,
  updateMoment: coreService.updateMoment,
  deleteMoment: coreService.deleteMoment,
  getMomentById: coreService.getMomentById,
  incrementMomentViews: coreService.incrementMomentViews,
  findMoment: coreService.findMoment,
  addMomentAttachment: coreService.addMomentAttachment,
  fetchPublicItems: coreService.fetchPublicItems,
  // Query
  listMoments: queryService.listMoments,
  findMomentsByCursor: queryService.findMomentsByCursor,
  findMomentsByPage: queryService.findMomentsByPage,
  getCategories: queryService.getCategories,
  findByTag: queryService.findByTag,
  // Search
  searchMoments: searchService.searchMoments,
  searchAndFetchMoments: searchService.searchAndFetchMoments,
  semanticSearch: searchService.semanticSearch,
  hybridSearch: searchService.hybridSearch,
  // Vector
  backfillVectors: vectorService.backfillVectors,
}
