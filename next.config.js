import { codeInspectorPlugin } from 'code-inspector-plugin'
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
    // excalidraw
    config.resolve.fullySpecified = false

    return config
  },
}

export default config
