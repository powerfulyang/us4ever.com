import { enhancement } from '@/lib/deepseek'
import { extractTitle, summaryContent } from '@/lib/gemini'
import { describe, expect } from 'vitest'

describe('ai', () => {
  it('ai function', async () => {
    const content = `在 CSS 中，可以为同一个 \`font-family\` 名称设置多个 \`font-weight\`，从而实现通过加粗或细化字体的效果。这种方法允许你为一个字体系列定义多个不同权重的字体文件，并在使用时根据需要自动切换。

### 示例：一个字体设置多个 \`font-weight\`

#### 定义字体
\`\`\`css
@font-face {
    font-family: 'CustomFont'; /* 统一的字体名称 */
    src: url('font-regular.woff2') format('woff2'),
         url('font-regular.woff') format('woff');
    font-weight: 400; /* Regular 权重 */
    font-style: normal;
}

@font-face {
    font-family: 'CustomFont'; /* 统一的字体名称 */
    src: url('font-bold.woff2') format('woff2'),
         url('font-bold.woff') format('woff');
    font-weight: 700; /* Bold 权重 */
    font-style: normal;
}

@font-face {
    font-family: 'CustomFont'; /* 统一的字体名称 */
    src: url('font-light.woff2') format('woff2'),
         url('font-light.woff') format('woff');
    font-weight: 300; /* Light 权重 */
    font-style: normal;
}
\`\`\`

#### 应用字体
\`\`\`css
/* 正常字体 */
body {
    font-family: 'CustomFont', sans-serif;
    font-weight: 400;
}

/* 加粗字体 */
h1 {
    font-family: 'CustomFont', sans-serif;
    font-weight: 700;
}

/* 轻字体 */
small {
    font-family: 'CustomFont', sans-serif;
    font-weight: 300;
}
\`\`\`

### 关键点说明

1. **\`font-weight\` 的范围**
   CSS 中 \`font-weight\` 的值可以是关键字或数值：
   - 关键字：\`normal\` (等同于 400)，\`bold\` (等同于 700)。
   - 数值：范围从 \`100\` 到 \`900\`，通常以 \`100\` 为步进。

2. **不同权重的字体文件**
   每个字体文件都需要匹配相应的 \`font-weight\` 值。例如：
   - Regular 字体文件设置为 \`400\`。
   - Bold 字体文件设置为 \`700\`。
   - Light 字体文件设置为 \`300\`。

3. **统一 \`font-family\` 名称**
   为所有权重的字体文件使用相同的 \`font-family\` 名称，浏览器会根据 \`font-weight\` 值自动选择合适的字体文件。

4. **浏览器兼容性**
   现代浏览器支持这种方式，确保字体文件的格式（如 \`woff2\` 和 \`woff\`）可以兼容目标用户的浏览器。

### 优化建议
- **字体文件大小**
  仅加载需要的权重，避免加载不必要的字体文件。

- **字体子集优化**
  如果字体文件包含多种语言字符，使用子集优化工具（如 [Font Squirrel](https://www.fontsquirrel.com/tools/webfont-generator)）生成仅包含目标字符的文件，以减小文件大小。

- **懒加载字体**
  针对非关键字体权重，使用懒加载方式优化页面性能。

通过这种方式，你可以灵活地为一个字体名称绑定多种权重，并在样式中通过 \`font-weight\` 属性轻松切换。`
    const title = await extractTitle(content)
    expect(title.length).toBeLessThanOrEqual(20)
    const summary = await summaryContent(content)
    expect(summary.length).toBeLessThanOrEqual(200)
  }, Infinity)

  it('enhancement', async () => {
    const result = await enhancement(`
## 异步与同步：Node.js 应用的性能考量

**摘要：** 本文深入探讨了 Node.js 中同步与异步代码的区别，重点分析了它们对单线程事件循环的影响，并通过实际代码示例展示了在服务器应用中应如何选择以优化性能。

### 引言

在 Node.js 的世界里，异步编程是其核心特性之一。理解同步与异步操作的区别，以及它们如何影响应用程序的性能，对于编写高效的 Node.js 应用至关重要。本文将结合实际代码示例，深入探讨这一主题，并分析如何在实践中做出正确的选择。

### 1. 知识体系梳理

#### 1.1 主要知识点和核心概念

*   **同步（Synchronous）代码：** 指的是代码按照顺序依次执行，每个操作必须等待前一个操作完成后才能开始。
*   **异步（Asynchronous）代码：** 指的是代码的执行不阻塞主线程，允许在等待某些操作（如 I/O）完成时，继续执行其他任务。
*   **Node.js 单线程事件循环模型：** Node.js 采用单线程处理请求，通过事件循环机制实现非阻塞 I/O 和高并发。
*   **阻塞（Blocking）：** 指的是在同步操作中，主线程必须等待操作完成才能继续执行后续代码，导致其他任务无法执行。
*   **非阻塞（Non-blocking）：** 指的是在异步操作中，主线程发起操作后可以立即返回，继续执行其他任务，无需等待操作完成。
*   **I/O 操作：** 指的是输入/输出操作，例如文件读取、网络请求等。

#### 1.2 概念之间的关联性和层次关系

1.  **基础概念：** 同步与异步是两种不同的编程模型，它们决定了代码的执行方式。
2.  **Node.js 环境：** Node.js 的单线程事件循环模型是理解同步与异步影响的关键。
3.  **阻塞与非阻塞：** 同步操作导致阻塞，异步操作实现非阻塞。
4.  **性能影响：** 在 Node.js 中，阻塞操作会严重影响服务器的并发性能，而异步操作可以提高并发能力。

#### 1.3 知识框架

\`\`\`
Node.js 异步与同步
├── 同步代码
│   ├── 特点：顺序执行，阻塞主线程
│   ├── 优点：代码简单，逻辑直观
│   ├── 缺点：阻塞事件循环，影响并发性能
│   └── 适用场景：对性能要求不高，或需要保证执行顺序的任务
├── 异步代码
│   ├── 特点：非阻塞主线程，通过回调、Promise、async/await 实现
│   ├── 优点：提高并发性能，避免阻塞事件循环
│   ├── 缺点：代码复杂度增加，需要处理回调地狱或使用 Promise/async/await 简化
│   └── 适用场景：高并发服务器应用，I/O 密集型任务
├── 单线程事件循环模型
│   ├── 特点：单线程处理请求，通过事件循环实现非阻塞 I/O
│   ├── 作用：提高并发性能，避免阻塞
│   └── 影响：同步操作会阻塞事件循环，影响服务器性能
└── 性能考量
    ├── 并发性能：异步操作提高并发能力，同步操作降低并发能力
    ├── CPU 占用：同步操作可能更高效地利用 CPU 完成单个任务
    └── 选择原则：I/O 密集型任务选择异步，CPU 密集型任务可考虑同步（配合 Worker Threads）

\`\`\`

#### 1.4 知识体系中的薄弱环节

*   **Worker Threads：** Node.js 的单线程模型在处理 CPU 密集型任务时可能会成为瓶颈。Worker Threads 的使用可以缓解这一问题，但文章中未提及。
*   **事件循环的深入理解：** 可以更深入地介绍事件循环的各个阶段（Timer、Pending callbacks、Idle, prepare、Poll、Check、Close callbacks），以及异步操作如何在事件循环中调度。
*   **性能测试和基准测试：** 可以通过具体的性能测试数据来对比同步与异步操作的性能差异。

### 2. 知识扩充

#### 2.1 补充每个知识点的深层原理和底层机制

*   **同步代码：** 在底层，同步代码直接调用操作系统提供的 I/O 函数，等待操作系统返回结果。这个过程中，Node.js 的事件循环会被阻塞。
*   **异步代码：** 异步代码通过 libuv 库实现非阻塞 I/O。libuv 使用线程池或操作系统提供的异步 I/O 接口（如 epoll、kqueue）来执行 I/O 操作，并将结果通过回调函数通知 Node.js。
*   **Promise 和 async/await：** Promise 是一种用于处理异步操作的对象，它代表一个尚未完成的异步操作的结果。async/await 是基于 Promise 的语法糖，可以使异步代码看起来更像同步代码，提高代码的可读性。

#### 2.2 添加专业术语和学术定义

*   **事件驱动（Event-driven）：** 一种编程范式，程序的执行流程由事件的发生驱动，而不是由代码的顺序决定。
*   **回调地狱（Callback Hell）：** 指的是多层嵌套的回调函数，导致代码难以理解和维护。
*   **并发（Concurrency）：** 指的是系统同时处理多个任务的能力。
*   **并行（Parallelism）：** 指的是系统同时执行多个任务的能力。

#### 2.3 联系相关知识领域，提供跨学科视角

*   **操作系统：** Node.js 的异步 I/O 依赖于操作系统提供的异步 I/O 接口或线程池。
*   **计算机网络：** 网络请求是常见的 I/O 操作，理解网络协议和网络编程对于编写高效的 Node.js 应用至关重要。
*   **并发编程：** Node.js 的异步编程模型与并发编程中的其他概念（如锁、信号量）有一定的关联。

#### 2.4 介绍最新研究进展和发展趋势

*   **HTTP/3：** HTTP/3 协议使用 QUIC 协议作为传输层，QUIC 协议具有更好的性能和可靠性，可以提高 Node.js 应用的网络性能。
*   **ES Modules：** ES Modules 是一种新的 JavaScript 模块化标准，可以提高代码的可读性和可维护性，并支持静态分析和 Tree Shaking。
*   **Performance API：** Node.js 提供了 Performance API，可以用于测量代码的性能，并进行性能优化。

#### 2.5 提供实践案例和最佳实践

*   **案例 1：** 使用异步 I/O 处理大量并发请求的 HTTP 服务器。
*   **案例 2：** 使用 Worker Threads 处理 CPU 密集型任务，避免阻塞事件循环。
*   **最佳实践 1：** 尽量使用异步 I/O 操作，避免使用同步 I/O 操作。
*   **最佳实践 2：** 使用 Promise 和 async/await 简化异步代码。
*   **最佳实践 3：** 使用性能分析工具（如 Node.js Inspector）找出性能瓶颈，并进行优化。

#### 2.6 说明常见问题和解决方案

*   **问题 1：** 如何处理回调地狱？
    *   **解决方案：** 使用 Promise 和 async/await 简化异步代码。
*   **问题 2：** 如何避免阻塞事件循环？
    *   **解决方案：** 尽量使用异步 I/O 操作，使用 Worker Threads 处理 CPU 密集型任务。
*   **问题 3：** 如何优化 Node.js 应用的性能？
    *   **解决方案：** 使用性能分析工具找出性能瓶颈，并进行优化。例如，使用缓存、减少 I/O 操作、优化数据库查询等。

### 3. 代码示例分析

你提供的代码示例非常清晰地展示了同步与异步操作的区别，以及它们对 Node.js 服务器性能的影响。以下是一些补充说明：

*   **\`GET /sync\` 路由：** 该路由模拟了一个 CPU 密集型任务，通过循环读取文件 100000 次来阻塞事件循环。当访问该路由时，服务器的所有其他请求都会被阻塞，直到 100000 次同步读取完成。
*   **\`GET /async\` 路由：** 该路由使用异步 I/O 操作读取文件 100000 次。尽管读取操作仍然需要时间完成，但服务器可以继续响应其他请求，提高并发性能。

### 4. 结论

在 Node.js 中，异步编程是提高服务器性能的关键。通过理解同步与异步操作的区别，以及它们对单线程事件循环的影响，我们可以编写出高效、可扩展的 Node.js 应用。在实际开发中，我们应该尽量使用异步 I/O 操作，避免使用同步 I/O 操作，并使用 Promise 和 async/await 简化异步代码。

### 参考资源

*   [Node.js 官方文档](https://nodejs.org/api/)
*   [libuv 官方文档](http://docs.libuv.org/en/v1.x/)
*   [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
`)

    expect(result).toBeDefined()
  }, Infinity)
})
