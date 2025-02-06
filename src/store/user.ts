import type { Prisma } from '@prisma/client'
import { create } from 'zustand'

export type User = Prisma.UserGetPayload<{ include: { group: true } }>

interface UserState {
  currentUser: User | null | undefined
  isPending: boolean
  setCurrentUser: (user?: User | null) => void
  setIsPending: (isPending: boolean) => void
  isAuthenticated: boolean
}

export const useUserStore = create<UserState>(set => ({
  currentUser: null,
  isPending: true,
  setCurrentUser: (user) => {
    const isAuthenticated = !!user
    const isPending = false
    set({ currentUser: user, isAuthenticated, isPending })
  },
  setIsPending: isPending => set({ isPending }),
  isAuthenticated: false,
}))
