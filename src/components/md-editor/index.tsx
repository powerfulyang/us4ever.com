'use client'

import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

loader.config({ monaco })

window.MonacoEnvironment = {
  getWorker() {
    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url), {
      type: 'module',
      name: 'editor.worker',
    })
  },
}

export default Editor
