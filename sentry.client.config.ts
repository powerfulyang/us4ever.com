// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  // Dev 环境不上报
  dsn: process.env.NODE_ENV === 'development' ? undefined : 'https://c39fd2b200c5c2912672763b25a5104b@sentry.us4ever.com/2',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the attribute below to sample sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      // Mask all text content by default and block all images
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
