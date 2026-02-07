import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-me'
)

export interface SessionUser {
  id: string
  username: string
  name: string
  isAdmin: boolean
}

export async function createSession(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET)

  return token
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        isAdmin: true,
      },
    })

    return user
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth()
  if (!session.isAdmin) {
    throw new Error('Admin access required')
  }
  return session
}
