import type { ProjectConfig } from "../../cli/types";

export function generateJwtUtils(config: ProjectConfig): string {
  const refreshLogic =
    config.authStrategy === "jwt-refresh"
      ? `
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload
}`
      : "";

  return `import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload
}
${refreshLogic}
`;
}

export function generateAuthMiddleware(): string {
  return `import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { verifyAccessToken, TokenPayload } from '../utils/jwt'
import { AppError } from './errorHandler'

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('No token provided', StatusCodes.UNAUTHORIZED)
  }

  const token = authHeader.split(' ')[1]

  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    throw new AppError('Invalid or expired token', StatusCodes.UNAUTHORIZED)
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        \`Role '\${req.user.role}' is not authorized for this action\`,
        StatusCodes.FORBIDDEN
      )
    }
    next()
  }
}
`;
}

export function generateAuthRoutes(config: ProjectConfig): string {
  const refreshRoute =
    config.authStrategy === "jwt-refresh"
      ? `router.post('/refresh', refreshToken)
router.post('/logout', authenticate, logout)`
      : "";

  return `import { Router } from 'express'
import { register, login${config.authStrategy === "jwt-refresh" ? ", refreshToken, logout" : ""} } from '../controllers/auth.controller'
${config.authStrategy !== "none" ? "import { authenticate } from '../middleware/auth'" : ""}

const router = Router()

router.post('/register', register)
router.post('/login', login)
${refreshRoute}
router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, data: req.user })
})

export default router
`;
}

export function generateAuthController(config: ProjectConfig): string {
  const refreshLogic =
    config.authStrategy === "jwt-refresh"
      ? `
export async function refreshToken(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken as string | undefined

  if (!token) {
    throw new AppError('No refresh token', StatusCodes.UNAUTHORIZED)
  }

  const payload = verifyRefreshToken(token)
  const accessToken = generateAccessToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  })

  res.json({ success: true, data: { accessToken } })
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('refreshToken')
  res.json({ success: true, message: 'Logged out' })
}`
      : "";

  const jwtImports =
    config.authStrategy === "jwt-refresh"
      ? `import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt'`
      : `import { generateAccessToken } from '../utils/jwt'`;

  return `import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
${jwtImports}
import { AppError } from '../middleware/errorHandler'

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(72),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function register(req: Request, res: Response): Promise<void> {
  const body = registerSchema.parse(req.body)
  // TODO: Check if user exists, create user, return token
  const accessToken = generateAccessToken({ userId: 'new-id', email: body.email, role: 'user' })
  res.status(StatusCodes.CREATED).json({ success: true, data: { accessToken } })
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = loginSchema.parse(req.body)
  // TODO: Find user, compare password, return token
  void body
  const accessToken = generateAccessToken({ userId: 'user-id', email: body.email, role: 'user' })
  ${
    config.authStrategy === "jwt-refresh"
      ? `const refreshToken = generateRefreshToken({ userId: 'user-id', email: body.email, role: 'user' })
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 })`
      : ""
  }
  res.json({ success: true, data: { accessToken } })
}
${refreshLogic}
`;
}
