import { useCallback, useEffect, useState } from 'react'

interface UseImageUploadProps {
  onFileSelect?: (file?: File) => void
  accept?: string
}

export function useImageUpload({
  onFileSelect,
  accept = 'image/*',
}: UseImageUploadProps = {}) {
  const [preview, setPreview] = useState<string>()

  useEffect(() => {
    return () => {
      // 清理预览URL
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/'))
      return

    // 清理之前的预览
    if (preview) {
      URL.revokeObjectURL(preview)
    }

    setPreview(URL.createObjectURL(file))
    onFileSelect?.(file)
  }, [preview, onFileSelect])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer?.files[0]
    if (file)
      handleFile(file)
  }, [handleFile])

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const file = e.clipboardData?.files[0]
    if (file)
      handleFile(file)
  }, [handleFile])

  useEffect(() => {
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  const reset = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    onFileSelect?.()
    setPreview(undefined)
  }, [onFileSelect, preview])

  return {
    preview,
    handleFile,
    handleDrop,
    reset,
    accept,
  }
}
