import "dotenv/config";
import { z } from "zod";

const optionalSecret = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === ""
      ? undefined
      : value,
  z.string().trim().min(20).optional(),
);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(3000),

  ALLOWED_ORIGINS: z.string().trim().min(1),

  SUPABASE_URL: z.url(),

  SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(20),

  SUPABASE_SECRET_KEY: optionalSecret,
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const details = result.error.issues
    .map((issue) => {
      const variable = issue.path.join(".") || "environnement";
      return `${variable}: ${issue.message}`;
    })
    .join("; ");

  throw new Error(`Configuration API invalide : ${details}`);
}

const allowedOrigins = [
  ...new Set(
    result.data.ALLOWED_ORIGINS
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ),
];

if (allowedOrigins.length === 0) {
  throw new Error(
    "Configuration API invalide : ALLOWED_ORIGINS est vide",
  );
}

export const env = Object.freeze({
  ...result.data,
  allowedOrigins: Object.freeze(allowedOrigins),
});