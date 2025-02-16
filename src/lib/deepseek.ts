import { env } from '@/env'
import { lkeap } from 'tencentcloud-sdk-nodejs'

const client = new lkeap.v20240522.Client({
  region: 'ap-shanghai',
  credential: {
    secretId: env.TENCENT_CLOUD_SECRET_ID,
    secretKey: env.TENCENT_CLOUD_SECRET_KEY,
  },
  profile: {
    httpProfile: {
      // 单位秒
      reqTimeout: 3600,
    },
  },
})

export async function enhancement(prompt: string) {
  const res = await client.ChatCompletions({
    Model: 'deepseek-r1',
    Messages: [
      {
        Role: 'user',
        Content: `你是一位专业的知识顾问。接下来我会提供一些内容，请你：

1. 知识体系梳理
   - 找出主要知识点和核心概念
   - 理清概念之间的关联性和层次关系
   - 构建完整的知识框架
   - 指出知识体系中的薄弱环节

2. 内容扩充
   - 对内容进行一定程度相关性扩充
   - 使内容更加完善，饱满
   - 内容要正确，并具有相关性
   - 标注可能存在争议的观点

3. 知识扩充
   - 补充每个知识点的深层原理和底层机制
   - 添加专业术语和学术定义
   - 联系相关知识领域，提供跨学科视角
   - 介绍最新研究进展和发展趋势
   - 提供实践案例和最佳实践
   - 说明常见问题和解决方案

在分析过程中，请：
- 保持严谨性，确保信息准确
- 按照从基础到高级的顺序组织内容
- 对重要概念提供详细解释
- 标注可能存在争议的观点
- 提供可靠的参考资源

输出要求：
- 以博文形式呈现，语言优美流畅
- 使用清晰的段落结构
- 确保行文有逻辑性和连贯性
- 保障只输出博文内容，不要输出其他介绍信息，**不要输出 prompt 介绍**
- 行文风格不要拘泥于 prompt，像一位技术人员行文，不需要按照 prompt 本身的结构来输出
- 拥有更多自主思考，主动关联知识点，举一反三
- 输出格式为 Markdown，但是不需要 Markdown 标签，只是 Markdown 格式的内容`,
      },
      {
        Role: 'user',
        Content: prompt,
      },
    ],
  })
  return res.Choices?.[0]?.Message?.Content || ''
}
