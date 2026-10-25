import { scopePerRequest } from "awilix-express";
import express from "express"
import { container } from "./config/container.ts";
import v1Router from "./routes/v1/index.ts"
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { httpLogger } from "./config/logger.ts";

export const createServer = () => {
  const app = express();

  // 3. Middlewares globales del servidor
  app.use(helmet());    // Seguridad en cabeceras HTTP
  app.use(cors());      // Permite peticiones de otros dominios/puertos
  app.use(httpLogger);  // Registro de logs ultra rápido en JSON
  app.use(express.json()); // Permite leer JSON en el cuerpo (body) de las peticiones

  // 4. Limitador de peticiones (Protección básica Anti-DoS / Fuerza bruta)
  const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  limit: 100, // Máximo 100 peticiones por IP en esos 15 minutos
  message: { 
    status: 429,
    message: "Demasiadas peticiones desde esta IP, por favor intenta más tarde." 
  },
  standardHeaders: true, // Devuelve información del límite en las cabeceras RateLimit-*
  legacyHeaders: false,  // Desactiva las cabeceras antiguas X-RateLimit-*
});


  app.use(scopePerRequest(container));

  app.use("/v1", apiLimiter, v1Router);
  
  app.get("/health", (_req, res) => {
    res.status(200).json({
      message: "Server Running..."
    })
  })

  return app;
}
