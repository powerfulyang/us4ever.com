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

// 创建一个简单的队列管理器
class QueueManager {
  private queue: (() => Promise<void>)[] = []
  private isProcessing = false

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task()
          resolve(result)
        }
        catch (error) {
          reject(error)
        }
      })

      if (!this.isProcessing) {
        this.processQueue()
      }
    })
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0)
      return

    this.isProcessing = true
    while (this.queue.length > 0) {
      const task = this.queue.shift()
      if (task) {
        try {
          await task()
        }
        catch (error) {
          console.error('Queue task error:', error)
        }
      }
    }
    this.isProcessing = false
  }
}

const queueManager = new QueueManager()

// Knowledge Enhancement and Expansion Prompt
export async function enhancement(prompt: string) {
  return queueManager.add(async () => {
    const res = await client.ChatCompletions({
      Model: 'deepseek-r1',
      Messages: [
        {
          Role: 'user',
          Content: `作为一位专业的技术内容专家，你需要对输入的内容进行深度解析和知识增强。请遵循以下方向：

核心解析：
1. 提取关键技术要点，构建知识体系
2. 分析技术原理和实现机制
3. 探讨最佳实践和应用场景
4. 关注性能、安全等工程实践要点

知识延伸：
1. 技术演进历史和未来趋势
2. 相关技术栈和生态系统
3. 常见陷阱和解决方案
4. 业界标准和规范

深度剖析：
1. 底层实现原理
2. 架构设计思想
3. 性能优化策略
4. 工程化实践经验

注意事项：
- 保持工程师视角，注重实用性
- 结合实际案例进行说明
- 标注关键的代码示例
- 提供可靠的技术文档引用
- 分析潜在的技术风险和解决方案

输出要求：
1. 采用技术博客风格，突出技术深度
2. 结构清晰，层次分明
3. 适当使用图表、代码块等辅助说明
4. 注重实用性，可直接应用到工作中
5. 输出格式为 Markdown
6. 直接输出内容，不要有任何前置说明
7. 适当使用表格、列表等结构化形式
8. 重要概念使用加粗标记
9. 代码示例使用代码块标注
10. 技术术语使用英文原文

风格要求：
- 保持专业严谨的工程师写作风格
- 直接切入技术本质
- 多角度分析问题
- 注重实践经验分享
- 适当引用业界案例`,
        },
        {
          Role: 'user',
          Content: prompt,
        },
      ],
    })
    return res.Choices?.[0]?.Message?.Content || ''
  })
}
