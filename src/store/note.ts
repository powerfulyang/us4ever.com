import { create } from 'zustand'

interface NoteState {
  isVisible: boolean
  content: string
  left: number
  top: number
  node: any
  showNote: (content: string, left: number, top: number, node: any) => void
  hideNote: () => void
}

export const useNoteStore = create<NoteState>(set => ({
  isVisible: false,
  content: '',
  left: 0,
  top: 0,
  node: null,
  showNote: (content: string, left: number, top: number, node: any) =>
    set({ isVisible: true, content, left, top, node }),
  hideNote: () => set({ isVisible: false }),
}))
