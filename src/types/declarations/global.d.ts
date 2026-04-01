// global.d.ts
interface RequestInit {
  duplex?: 'half'
  get duplex(): 'half'
}

declare global {
  const __REPOSITORY_FILE_PATH__: string // 全局变量
}

export {}
