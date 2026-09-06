import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { env } from "./src/config/env.js";
import { supabasePublic } from "./src/lib/supabase.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error("Origine non autorisée");
      error.code = "CORS_NOT_ALLOWED";
      return callback(error);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 86400,
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      ok: false,
      error: "Trop de requêtes. Réessayez plus tard.",
    },
  }),
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

app.get("/", (_request, response) => {
  response.status(200).json({
    ok: true,
    name: "TSB Tech Group API",
    version: "1.0.0",
    status: "online",
  });
});

app.get("/health", (_request, response) => {
  response.set("Cache-Control", "no-store");

  response.status(200).json({
    ok: true,
    service: "tsb-api",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/database", async (_request, response) => {
  response.set("Cache-Control", "no-store");

  const startedAt = Date.now();

  try {
    const { error } = await supabasePublic
      .from("store_products")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Échec du test Supabase :", {
        code: error.code,
        message: error.message,
      });

      return response.status(503).json({
        ok: false,
        service: "supabase",
        status: "unavailable",
      });
    }

    return response.status(200).json({
      ok: true,
      service: "supabase",
      status: "connected",
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    console.error(
      "Erreur réseau Supabase :",
      error instanceof Error ? error.message : error,
    );

    return response.status(503).json({
      ok: false,
      service: "supabase",
      status: "unavailable",
    });
  }
});

app.use((_request, response) => {
  response.status(404).json({
    ok: false,
    error: "Route introuvable",
  });
});

app.use((error, _request, response, _next) => {
  if (error?.code === "CORS_NOT_ALLOWED") {
    return response.status(403).json({
      ok: false,
      error: "Origine non autorisée",
    });
  }

  console.error("Erreur API :", error);

  return response.status(500).json({
    ok: false,
    error: "Erreur interne du serveur",
  });
});

const server = app.listen(env.PORT, () => {
  console.log(`TSB API démarrée sur le port ${env.PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} reçu : arrêt de l'API`);

  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));