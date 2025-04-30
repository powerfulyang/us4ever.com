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
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, context) => {
    if (context.dev) {
      config.plugins.push(codeInspectorPlugin({ bundler: 'webpack' }))
    }

    config.module.rules.push({
      // 1. 只处理 page.ts / page.tsx
      test: /\.tsx?$/,
      // 2. 编译前执行
      enforce: 'pre',
      // 3. 把 loader + options 放在同一个对象里
      use: [
        {
          loader: path.resolve('loaders/inject-path-loader.mjs'),
          options: {
            repository: pkg.repository.url,
          },
        },
      ],
    });

    // excalidraw
    config.resolve.fullySpecified = false

    return config
  },
}

export default config
