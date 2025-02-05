import { extractTitle, summaryContent } from '@/lib/gemini'
import { describe } from 'vitest'

describe('gemini', () => {
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
})
