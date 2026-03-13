import path from 'node:path'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import pkg from './package.json' with { type: 'json' };
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

export default config
