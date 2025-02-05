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
  isPending: false,
  setCurrentUser: (user) => {
    const isAuthenticated = !!user
    set({ currentUser: user, isAuthenticated })
  },
  setIsPending: isPending => set({ isPending }),
  isAuthenticated: false,
}))
