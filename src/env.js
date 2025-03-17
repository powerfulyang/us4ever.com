import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().default(process.env.hostname || 'localhost'),
    AMAP_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    TENCENT_CLOUD_SECRET_ID: z.string().optional(),
    TENCENT_CLOUD_SECRET_KEY: z.string().optional(),
    TELEGRAM_API_ENDPOINT: z.string().default('http://api.telegram'),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    AMAP_KEY: process.env.AMAP_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    TENCENT_CLOUD_SECRET_ID: process.env.TENCENT_CLOUD_SECRET_ID,
    TENCENT_CLOUD_SECRET_KEY: process.env.TENCENT_CLOUD_SECRET_KEY,
    TELEGRAM_API_ENDPOINT: process.env.TELEGRAM_API_ENDPOINT,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
})
