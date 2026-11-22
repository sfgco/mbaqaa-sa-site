import { z } from 'zod'
import { email } from './common'

export const roles = ['admin', 'editor'] as const
export const role = z.enum(roles)
export type Role = z.infer<typeof role>

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(200),
})
export type LoginInput = z.infer<typeof loginSchema>

export const userCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email,
  password: z.string().min(8).max(200),
  role,
})
export type UserCreateInput = z.infer<typeof userCreateSchema>

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  role: role.optional(),
  active: z.boolean().optional(),
  password: z.union([z.string().min(8).max(200), z.literal('')]).optional(),
})
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
