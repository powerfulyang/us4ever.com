'use client'

import { useOutsideClick } from '@/hooks/useOutsideClick'
import { useMindMapNoteStore } from '@/store/mind-map-note'
import { useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './note.module.scss'

export function CustomNoteContent() {
  const ref = useRef<HTMLDivElement>(null!)
  const { isVisible, content, left, top, hideNote } = useMindMapNoteStore()
  useOutsideClick(ref, hideNote)

  if (!isVisible)
    return null

  return createPortal(
    <div
      ref={ref}
      className={styles.noteContent}
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        borderRadius: '4px',
        zIndex: 1000,
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />,
    document.body,
  )
}
