// 根据 id 查询用户是否存在

import type { User } from '@prisma/client'
import { db } from '@/server/db'

export async function createOrSignIn(user: User) {
  return db.user.upsert({
    create: user,
    update: user,
    where: {
      id: user.id,
    },
  })
}

/**
 * 通过 id 查询用户是否存在
 * @param id 用户 id
 * @returns 用户数据
 */
export async function findUserWithGroupById(id: string) {
  return db.user.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      group: {
        include: {
          users: true,
        },
      },
    },
  })
}

export const userService = {
  createOrSignIn,
  findUserWithGroupById,
}
