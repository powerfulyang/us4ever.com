import path from 'node:path'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import pkg from './package.json' with { type: 'json' };
import { withSentryConfig } from "@sentry/nextjs";
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js'

/** @type {import("next").NextConfig} */
const config = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    rules: {
      ...codeInspectorPlugin({
        bundler: 'turbopack',
      }),
      '*.ts': {
        loaders: [
          {
            loader: path.resolve('loaders/inject-path-loader.mjs'),
            options: {
              repository: pkg.repository.url,
            },
          },
        ],
      },
      '*.tsx': {
        loaders: [
          {
            loader: path.resolve('loaders/inject-path-loader.mjs'),
            options: {
              repository: pkg.repository.url,
            },
          },
        ],
      },
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          }
        ],
      },
    ]
  },
}

export default withSentryConfig(config, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "sentry",
  project: "home",
  sentryUrl: "https://sentry.us4ever.com/",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Bundle size optimizations
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },

  // Specify the release name manually because .git is missing in Docker
  release: {
    name: process.env.SENTRY_RELEASE,
  },
});
