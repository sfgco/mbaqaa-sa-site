import bcrypt from 'bcryptjs'
import type { LoginInput } from '../../shared/schemas/user'
import type { AuthUser } from '../http/types'
import { UserModel } from '../models/User'
import { HttpError } from '../utils/httpError'

export async function login(input: LoginInput): Promise<AuthUser> {
  const user = await UserModel.findOne({ email: input.email }).select('+passwordHash')
  // Compare even when user is missing to keep timing similar.
  const hash = user?.passwordHash ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva'
  const okPw = await bcrypt.compare(input.password, hash)
  if (!user || !okPw || !user.active) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
  user.lastLoginAt = new Date()
  await user.save()
  return { id: String(user._id), name: user.name, email: user.email, role: user.role }
}

export async function getMe(id: string) {
  const u = await UserModel.findById(id).lean()
  if (!u) throw new HttpError(401, 'UNAUTHORIZED', 'Authentication required')
  return { _id: String(u._id), name: u.name, email: u.email, role: u.role, active: u.active }
}

export function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10)
}
