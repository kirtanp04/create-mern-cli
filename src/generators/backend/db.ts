import type { ProjectConfig } from "../../cli/types";

export function generateDatabaseConfig(config: ProjectConfig): string {
  if (config.database === "mongodb") {
    return generateMongoConfig(config);
  }
  if (config.database === "postgresql" || config.database === "mysql") {
    return generatePrismaConfig(config);
  }
  return "";
}

function generateMongoConfig(config: ProjectConfig): string {
  const logLine =
    config.logger !== "none"
      ? `import { logger } from '../utils/logger'\nconst log = (msg: string) => logger.info(msg)\nconst logErr = (msg: string, e: unknown) => logger.error(msg, e)`
      : `const log = (msg: string) => console.log(msg)\nconst logErr = (msg: string, e: unknown) => console.error(msg, e)`;

  return `import mongoose from 'mongoose'
import { env } from './env'
${logLine}

let isConnected = false

export async function connectDB(): Promise<void> {
  if (isConnected) return

  mongoose.set('strictQuery', true)

  try {
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    isConnected = true
    log('✅ MongoDB connected')

    mongoose.connection.on('error', (err) => {
      logErr('MongoDB connection error:', err)
      isConnected = false
    })

    mongoose.connection.on('disconnected', () => {
      log('MongoDB disconnected')
      isConnected = false
    })
  } catch (error) {
    logErr('Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return
  await mongoose.disconnect()
  isConnected = false
}
`;
}

function generatePrismaConfig(config: ProjectConfig): string {
  const logLine =
    config.logger !== "none"
      ? `import { logger } from '../utils/logger'\nconst log = (msg: string) => logger.info(msg)\nconst logErr = (msg: string, e: unknown) => logger.error(msg, e)`
      : `const log = (msg: string) => console.log(msg)\nconst logErr = (msg: string, e: unknown) => console.error(msg, e)`;

  return `import { PrismaClient } from '@prisma/client'
${logLine}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect()
    log('✅ Database connected via Prisma')
  } catch (error) {
    logErr('Failed to connect to database:', error)
    process.exit(1)
  }
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect()
}
`;
}

export function generatePrismaSchema(config: ProjectConfig): string {
  const provider = config.database === "postgresql" ? "postgresql" : "mysql";
  return `// This is your Prisma schema file
// Learn more: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

enum Role {
  USER
  ADMIN
}
`;
}

export function generateMongoUserModel(): string {
  return `import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
  refreshTokens: string[]
  createdAt: Date
  updatedAt: Date
  comparePassword(candidate: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    refreshTokens: { type: [String], default: [], select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password
        delete ret.refreshTokens
        delete ret.__v
        return ret
      },
    },
  }
)

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema)
`;
}
