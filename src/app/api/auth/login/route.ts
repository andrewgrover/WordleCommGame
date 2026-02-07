import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const sessionToken = await createSession(user.id)

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name },
    })

    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
