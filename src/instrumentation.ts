export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 在 Node.js 运行时初始化
    console.log('[INSTRUMENTATION] Initializing server instrumentation...')

    console.log('[INSTRUMENTATION] Server instrumentation initialized')
  }
}
