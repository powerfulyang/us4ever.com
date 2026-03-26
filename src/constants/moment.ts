export const MomentCategoryMap = {
  'default': {
    title: '动态',
    description: '分享生活点滴',
  },
  'eleven': {
    title: 'Eleven 专栏',
    description: '记录 Eleven 的成长过程',
  },
  'prompt': {
    title: 'prompt 收藏',
    description: '收藏有趣的 prompt',
  },
  'telegram:emt_channel': {
    title: 'Telegram EMT Channel',
    description: 'Telegram EMT Channel',
  },
} as const

export function getTitle(category: keyof typeof MomentCategoryMap | string) {
  switch (category) {
    case 'default':
      return MomentCategoryMap.default.title
    case 'eleven':
      return MomentCategoryMap.eleven.title
    case 'prompt':
      return MomentCategoryMap.prompt.title
    case 'telegram:emt_channel':
      return MomentCategoryMap['telegram:emt_channel'].title
    default:
      return `动态 - ${category}`
  }
}

export function getDescription(category: keyof typeof MomentCategoryMap | string) {
  switch (category) {
    case 'default':
      return MomentCategoryMap.default.description
    case 'eleven':
      return MomentCategoryMap.eleven.description
    case 'prompt':
      return MomentCategoryMap.prompt.description
    case 'telegram:emt_channel':
      return MomentCategoryMap['telegram:emt_channel'].description
    default:
      return `分享生活点滴 - ${category}`
  }
}
