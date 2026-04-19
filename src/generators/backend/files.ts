import type { ProjectConfig } from "../../cli/types";

export function generateBackendTsConfig(): object {
  return {
    compilerOptions: {
      target: "ES2020",
      module: "commonjs",
      lib: ["ES2020"],
      outDir: "./dist",
      rootDir: "./src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      sourceMap: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"],
  };
}

export function generateServerIndex(config: ProjectConfig): string {
  const imports: string[] = [
    `import 'dotenv/config'`,
    `import 'express-async-errors'`,
    `import { createApp } from './app'`,
    `import { env } from './config/env'`,
  ];

  if (config.database !== "none") {
    imports.push(`import { connectDB } from './config/database'`);
  }

  const dbConnect = config.database !== "none" ? `\n  await connectDB()` : "";

  const loggerImport =
    config.logger === "pino"
      ? `import { logger } from './utils/logger'`
      : config.logger === "winston"
      ? `import { logger } from './utils/logger'`
      : "";

  if (loggerImport) imports.push(loggerImport);

  const logFn =
    config.logger !== "none"
      ? `logger.info(\`🚀 Server running on port \${env.PORT}\`)`
      : `console.info(\`🚀 Server running on port \${env.PORT}\`)`;

  return `${imports.join("\n")}

async function bootstrap(): Promise<void> {${dbConnect}
  const app = createApp()

  const server = app.listen(env.PORT, () => {
    ${logFn}
  })

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    ${config.logger !== "none" ? "logger.info" : "console.info"}(\`\${signal} received. Shutting down gracefully...\`)
    server.close(async () => {
      ${config.logger !== "none" ? "logger.info" : "console.info"}('HTTP server closed')
      process.exit(0)
    })
    // Force close after 10s
    setTimeout(() => process.exit(1), 10_000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
`;
}

export function generateApp(config: ProjectConfig): string {
  const imports: string[] = [
    `import express, { Application, Request, Response, NextFunction } from 'express'`,
  ];
  const middlewareLines: string[] = [];

  if (config.helmetSecurity) {
    imports.push(`import helmet from 'helmet'`);
    middlewareLines.push(`  app.use(helmet())`);
  }

  if (config.corsSetup) {
    imports.push(`import { corsOptions } from './config/cors'`);
    imports.push(`import cors from 'cors'`);
    middlewareLines.push(`  app.use(cors(corsOptions))`);
  }

  if (config.rateLimiting) {
    imports.push(`import { rateLimiter } from './middleware/rateLimiter'`);
    middlewareLines.push(`  app.use('/api', rateLimiter)`);
  }

  if (config.logger === "pino") {
    imports.push(`import { httpLogger } from './utils/logger'`);
    middlewareLines.push(`  app.use(httpLogger)`);
  } else if (config.logger === "winston") {
    imports.push(`import { httpLogger } from './utils/logger'`);
    middlewareLines.push(`  app.use(httpLogger)`);
  }

  if (config.authStrategy === "jwt-refresh") {
    imports.push(`import cookieParser from 'cookie-parser'`);
    middlewareLines.push(`  app.use(cookieParser())`);
  }

  middlewareLines.push(
    `  app.use(express.json({ limit: '10mb' }))`,
    `  app.use(express.urlencoded({ extended: true, limit: '10mb' }))`
  );

  imports.push(`import { apiRouter } from './routes'`);
  imports.push(`import { errorHandler } from './middleware/errorHandler'`);
  imports.push(`import { notFound } from './middleware/notFound'`);

  return `${imports.join("\n")}

export function createApp(): Application {
  const app = express()

${middlewareLines.join("\n")}

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // API Routes
  app.use('/api/v1', apiRouter)

  // Error handling (must be last)
  app.use(notFound)
  app.use(errorHandler)

  return app
}
`;
}

export function generateEnvConfig(config: ProjectConfig): string {
  const envFields: string[] = [
    `  PORT: z.string().default('5000').transform(Number),`,
    `  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),`,
  ];

  if (config.database === "mongodb") {
    envFields.push(`  MONGODB_URI: z.string().url(),`);
  }
  if (config.database === "postgresql" || config.database === "mysql") {
    envFields.push(`  DATABASE_URL: z.string().url(),`);
  }
  if (config.authStrategy !== "none") {
    envFields.push(
      `  JWT_SECRET: z.string().min(32),`,
      `  JWT_EXPIRES_IN: z.string().default('15m'),`
    );
  }
  if (config.authStrategy === "jwt-refresh") {
    envFields.push(
      `  JWT_REFRESH_SECRET: z.string().min(32),`,
      `  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),`
    );
  }
  if (config.corsSetup) {
    envFields.push(`  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),`);
  }

  return `import { z } from 'zod'

const envSchema = z.object({
${envFields.join("\n")}
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('❌ Invalid environment variables:')
  console.error(_env.error.format())
  process.exit(1)
}

export const env = _env.data

export type Env = typeof env
`;
}

export function generateCorsConfig(): string {
  return `import { CorsOptions } from 'cors'
import { env } from './env'

const origins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, Postman, etc.)
    if (!origin) return callback(null, true)
    if (origins.includes(origin) || origins.includes('*')) {
      return callback(null, true)
    }
    callback(new Error(\`CORS policy: Origin \${origin} not allowed\`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Total-Count', 'X-Page'],
  maxAge: 86400, // 24h preflight cache
}
`;
}

export function generateErrorHandler(): string {
  return `import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { StatusCodes } from 'http-status-codes'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

interface ErrorResponse {
  success: false
  message: string
  errors?: unknown
  stack?: string
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV === 'development'

  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      success: false,
      message: 'Validation error',
      errors: err.flatten().fieldErrors,
    }
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(response)
    return
  }

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      message: err.message,
      ...(isDev && { stack: err.stack }),
    }
    res.status(err.statusCode).json(response)
    return
  }

  // Unknown / unhandled errors
  const response: ErrorResponse = {
    success: false,
    message: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack }),
  }
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response)
}
`;
}

export function generateNotFound(): string {
  return `import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export function notFound(req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: \`Route \${req.method} \${req.originalUrl} not found\`,
  })
}
`;
}

export function generateApiRouter(config: ProjectConfig): string {
  const imports = [`import { Router } from 'express'`];
  const uses: string[] = [];

  if (config.authStrategy !== "none") {
    imports.push(`import authRoutes from './auth.routes'`);
    uses.push(`router.use('/auth', authRoutes)`);
  }

  imports.push(`import userRoutes from './user.routes'`);
  uses.push(`router.use('/users', userRoutes)`);

  return `${imports.join("\n")}

const router = Router()

${uses.join("\n")}

export { router as apiRouter }
`;
}

export function generateUserRoutes(): string {
  return `import { Router } from 'express'
import { getUsers, getUserById } from '../controllers/user.controller'

const router = Router()

router.get('/', getUsers)
router.get('/:id', getUserById)

export default router
`;
}

export function generateUserController(): string {
  return `import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '../middleware/errorHandler'

export async function getUsers(_req: Request, res: Response): Promise<void> {
  // TODO: Implement user fetching logic
  res.status(StatusCodes.OK).json({
    success: true,
    data: [],
    message: 'Users fetched successfully',
  })
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  const { id } = req.params

  if (!id) {
    throw new AppError('User ID is required', StatusCodes.BAD_REQUEST)
  }

  // TODO: Implement user fetching by ID
  res.status(StatusCodes.OK).json({
    success: true,
    data: { id },
    message: 'User fetched successfully',
  })
}
`;
}

export function generateRateLimiter(): string {
  return `import rateLimit from 'express-rate-limit'

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // Limit each IP to 100 req per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
})

export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests on this endpoint, please try again later.',
  },
})
`;
}
