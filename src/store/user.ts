import { create } from 'zustand'

export interface User {
  id: string
  nickname: string
  avatar: string
  email: string
}

interface UserState {
  currentUser: User | null | undefined
  isPending: boolean
  setCurrentUser: (user?: User | null) => void
  setIsPending: (isPending: boolean) => void
  isAuthenticated: boolean
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  isPending: false,
  setCurrentUser: user => set({ currentUser: user }),
  setIsPending: isPending => set({ isPending }),
  get isAuthenticated() { // 通过 getter 获取 isAuthenticated
    return !!get().currentUser
  },
}))
