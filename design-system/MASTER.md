# 颠覆性重构设计系统 - us4ever

> Raycast 风格 + 中性灰黑 + 侧边栏导航

## 设计哲学

**核心理念**: 功能优先，内容为王，键盘驱动

- 每个像素都有目的
- 装饰性元素减到最少
- 交互反馈即时可见
- 键盘操作优于鼠标

---

## 色彩系统

### 亮色模式 (Light)

```css
:root {
  /* 背景 - 从白到灰的层级 */
  --background: 0 0% 100%;           /* #FFFFFF - 页面背景 */
  --background-secondary: 0 0% 98%;  /* #FAFAFA - 卡片背景 */
  --background-tertiary: 0 0% 96%;   /* #F5F5F5 - 侧边栏/输入框 */
  --background-elevated: 0 0% 100%;  /* #FFFFFF - 弹窗/下拉菜单 */

  /* 前景 - 从黑到灰的文字 */
  --foreground: 0 0% 5%;             /* #0D0D0D - 主文字 */
  --foreground-secondary: 0 0% 40%;  /* #666666 - 次要文字 */
  --foreground-tertiary: 0 0% 60%;   /* #999999 - 占位符/禁用 */

  /* 边框 */
  --border: 0 0% 90%;                /* #E5E5E5 - 默认边框 */
  --border-focus: 0 0% 70%;          /* #B3B3B3 - 聚焦边框 */

  /* 强调色 - 仅用于关键操作 */
  --accent: 0 0% 5%;                 /* #0D0D0D - 主按钮 */
  --accent-foreground: 0 0% 100%;    /* #FFFFFF - 主按钮文字 */

  /* 语义色 */
  --success: 142 71% 45%;            /* #16A34A */
  --warning: 38 92% 50%;             /* #F59E0B */
  --destructive: 0 72% 51%;          /* #DC2626 */

  /* 特殊效果 */
  --overlay: 0 0% 0% / 0.5;          /* 遮罩层 */
  --ring: 0 0% 5%;                   /* 焦点环 */
}
```

### 暗色模式 (Dark) - 默认

```css
.dark {
  /* 背景 - 从深黑到深灰的层级 */
  --background: 0 0% 4%;             /* #0A0A0A - 页面背景 */
  --background-secondary: 0 0% 7%;   /* #121212 - 卡片背景 */
  --background-tertiary: 0 0% 10%;   /* #1A1A1A - 侧边栏/输入框 */
  --background-elevated: 0 0% 12%;   /* #1F1F1F - 弹窗/下拉菜单 */

  /* 前景 - 从白到灰的文字 */
  --foreground: 0 0% 98%;            /* #FAFAFA - 主文字 */
  --foreground-secondary: 0 0% 60%;  /* #999999 - 次要文字 */
  --foreground-tertiary: 0 0% 40%;   /* #666666 - 占位符/禁用 */

  /* 边框 */
  --border: 0 0% 18%;                /* #2E2E2E - 默认边框 */
  --border-focus: 0 0% 30%;          /* #4D4D4D - 聚焦边框 */

  /* 强调色 - 仅用于关键操作 */
  --accent: 0 0% 98%;                /* #FAFAFA - 主按钮 */
  --accent-foreground: 0 0% 4%;      /* #0A0A0A - 主按钮文字 */

  /* 语义色 */
  --success: 142 70% 45%;
  --warning: 38 92% 50%;
  --destructive: 0 62% 50%;

  /* 特殊效果 */
  --overlay: 0 0% 0% / 0.7;
  --ring: 0 0% 98%;
}
```

---

## 排版系统

### 字体

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### 字号层级

| 名称 | 大小 | 行高 | 用途 |
|------|------|------|------|
| `text-xs` | 12px | 1.5 | 标签、时间戳 |
| `text-sm` | 13px | 1.5 | 次要内容、列表项 |
| `text-base` | 14px | 1.6 | 正文 |
| `text-lg` | 16px | 1.5 | 标题、重要内容 |
| `text-xl` | 18px | 1.4 | 页面标题 |
| `text-2xl` | 24px | 1.3 | 大标题 |

### 字重

- Regular (400): 正文
- Medium (500): 强调、标签
- Semibold (600): 标题

---

## 间距系统

基于 4px 基础单位：

```css
--spacing-0: 0;
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
```

---

## 圆角系统

```css
--radius-sm: 4px;    /* 小元素：标签、徽章 */
--radius-md: 6px;    /* 中等：按钮、输入框 */
--radius-lg: 8px;    /* 大元素：卡片 */
--radius-xl: 12px;   /* 特大：弹窗、模态框 */
```

---

## 阴影系统

Raycast 风格极少使用阴影，主要依靠边框和背景色区分层级：

```css
/* 仅用于浮层元素 */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.2);
```

---

## 组件规范

### 侧边栏

```
宽度: 240px (可折叠至 64px)
背景: background-tertiary
边框: 右侧 1px border
项目高度: 36px
项目间距: 2px
悬停: background-secondary
激活: background-secondary + 左侧 2px accent 条
```

### 命令面板 (Cmd+K)

```
宽度: 640px
最大高度: 480px
圆角: 12px
背景: background-elevated
输入框高度: 48px
列表项高度: 40px
分组标题高度: 32px
```

### 按钮

```
高度:
  - xs: 24px
  - sm: 32px
  - md: 36px (默认)
  - lg: 40px

内边距: 12px 水平
圆角: 6px
字体: 14px medium
过渡: 150ms ease
```

### 输入框

```
高度: 36px
内边距: 12px
圆角: 6px
边框: 1px border
聚焦: border-focus + ring (2px)
```

### 卡片

```
背景: background-secondary
边框: 1px border 或无
圆角: 8px
内边距: 16px
悬停: border-focus
```

---

## 动画规范

### 时长

- 微交互: 150ms
- 状态变化: 200ms
- 页面过渡: 300ms
- 命令面板: 200ms spring

### 缓动

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 动画类型

1. **淡入淡出** - 内容切换
2. **滑动** - 侧边栏展开、命令面板
3. **缩放** - 模态框（仅轻微，0.95 → 1）
4. **高度变化** - 列表展开/折叠

---

## 交互模式

### 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd/Ctrl + K` | 打开命令面板 |
| `Cmd/Ctrl + N` | 新建笔记 |
| `Cmd/Ctrl + /` | 快捷搜索 |
| `Cmd/Ctrl + B` | 切换侧边栏 |
| `Cmd/Ctrl + ,` | 打开设置 |
| `Esc` | 关闭弹窗/命令面板 |

### 命令面板功能

- 全局搜索（笔记、待办、动态）
- 快速导航（跳转到任意页面）
- 快速操作（新建、删除、切换主题）
- 最近访问记录

---

## 图标规范

- 图标库: Lucide Icons
- 尺寸: 16px (小), 20px (中), 24px (大)
- 描边宽度: 1.5px
- 风格: 线性，一致圆角

---

## 可访问性

1. **对比度**: 所有文字对比度 ≥ 4.5:1
2. **焦点状态**: 明显的焦点环（2px ring）
3. **键盘导航**: 所有功能可通过键盘访问
4. **减少动画**: 支持 prefers-reduced-motion
5. **屏幕阅读器**: 所有图标按钮有 aria-label

---

## 反模式 (避免)

❌ 渐变背景
❌ 装饰性阴影
❌ 彩色强调（除语义色外）
❌ 圆角过大（>12px）
❌ 过度动画
❌ 图标使用 emoji
❌ 悬停时布局偏移
❌ 硬编码颜色值