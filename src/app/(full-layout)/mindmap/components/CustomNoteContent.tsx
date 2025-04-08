/* eslint-disable react-dom/no-dangerously-set-innerhtml */
'use client'

import { useMindMapNoteStore } from '@/store/mind-map-note'
import { cn } from '@/utils'
import DOMPurify from 'dompurify'
import { useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useClickAway } from 'react-use'
import styles from './note.module.scss'

export function CustomNoteContent() {
  const ref = useRef<HTMLDivElement>(null!)
  const { isVisible, content, left, top, hideNote } = useMindMapNoteStore()
  useClickAway(ref, hideNote)

  const safeHtml = useMemo(() => {
    return DOMPurify.sanitize(content)
  }, [content])

  if (!isVisible)
    return null

  return createPortal(
    <div
      ref={ref}
      className={cn(styles.noteContent, 'prose')}
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        borderRadius: '4px',
        zIndex: 1000,
      }}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />,
    document.body,
  )
}
