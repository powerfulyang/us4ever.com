/**
 * Keep Service 模块入口
 * 统一导出所有 keep 相关服务
 */

// 类型定义
// 聚合服务对象（兼容旧版导入方式）
import * as coreService from './core.service'
import * as queryService from './query.service'
import * as searchService from './search.service'
import * as vectorService from './vector.service'

// 核心服务
export {
  createKeep,
  deleteKeep,
  getKeepById,
  incrementKeepViews,
  keepInclude,
  updateKeep,
} from './core.service'

// 查询服务
export {
  findAccessibleList,
  findAccessiblePage,
  findByTag,
  findPublicList,
  getCategories,
} from './query.service'

// 搜索服务
export {
  hybridSearch,
  searchKeeps,
  searchKeepsWithAccess,
  semanticSearch,
} from './search.service'

export * from './types'

// 向量服务
export {
  backfillVectors,
  updateKeepVectors,
} from './vector.service'

// 查询条件构建器
export { buildKeepWhereClause } from './where-clause'

export const keepService = {
  // Core
  createKeep: coreService.createKeep,
  updateKeep: coreService.updateKeep,
  getKeepById: coreService.getKeepById,
  deleteKeep: coreService.deleteKeep,
  // Query
  findAccessibleList: queryService.findAccessibleList,
  findAccessiblePage: queryService.findAccessiblePage,
  findPublicList: queryService.findPublicList,
  getCategories: queryService.getCategories,
  findByTag: queryService.findByTag,
  // Search
  searchKeepsWithAccess: searchService.searchKeepsWithAccess,
  semanticSearch: searchService.semanticSearch,
  hybridSearch: searchService.hybridSearch,
  // Vector
  backfillVectors: vectorService.backfillVectors,
}
