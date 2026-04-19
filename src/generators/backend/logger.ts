import type { ProjectConfig } from "../../cli/types";

export function generateLogger(config: ProjectConfig): string {
  if (config.logger === "winston") return generateWinstonLogger();
  if (config.logger === "pino") return generatePinoLogger();
  return "";
}

function generateWinstonLogger(): string {
  return `import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import morgan from 'morgan'
import { Request, Response, NextFunction } from 'express'

const { combine, timestamp, printf, colorize, errors, json } = winston.format

const isDev = process.env.NODE_ENV === 'development'

// Dev format: colorized, human readable
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack }) =>
    stack
      ? \`\${timestamp} [\${level}]: \${message}\\n\${stack}\`
      : \`\${timestamp} [\${level}]: \${message}\`
  )
)

// Production format: JSON for log aggregators
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
)

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  format: isDev ? devFormat : prodFormat,
  defaultMeta: { service: process.env.npm_package_name },
  transports: [
    new winston.transports.Console(),
    ...(isDev
      ? []
      : [
          new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '14d',
            zippedArchive: true,
          }),
          new DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            zippedArchive: true,
          }),
        ]),
  ],
})

// HTTP request logger middleware
const morganStream = { write: (msg: string) => logger.http(msg.trim()) }

export const httpLogger = morgan(
  isDev ? 'dev' : ':method :url :status :res[content-length] - :response-time ms',
  { stream: morganStream }
)
`;
}

function generatePinoLogger(): string {
  return `import pino from 'pino'
import pinoHttp from 'pino-http'

const isDev = process.env.NODE_ENV === 'development'

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
  base: {
    service: process.env.npm_package_name,
    env: process.env.NODE_ENV,
  },
  redact: {
    paths: ['req.headers.authorization', 'req.body.password', 'req.body.token'],
    censor: '[REDACTED]',
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
})

export const httpLogger = pinoHttp({
  logger,
  customSuccessMessage: (req, res) =>
    \`\${req.method} \${req.url} \${res.statusCode}\`,
  customErrorMessage: (req, res, err) =>
    \`\${req.method} \${req.url} \${res.statusCode} - \${err.message}\`,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error'
    if (res.statusCode >= 400) return 'warn'
    return 'info'
  },
})
`;
}
