import { env } from "./env.ts"
import pino from "pino";
import { pinoHttp } from "pino-http";

export const httpLogger = pinoHttp({
    logger: pino({
        level: env.level,
        timestamp: pino.stdTimeFunctions.isoTime,
    }),

    autoLogging: {
        ignore: (req) => req.url === "/health" // Ignorar la ruta /health para no saturar los logs
    }
})

export const logger = httpLogger.logger;