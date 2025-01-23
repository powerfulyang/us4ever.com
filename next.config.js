import { codeInspectorPlugin } from 'code-inspector-plugin'
import AutoImport from 'unplugin-auto-import/webpack'
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
  webpack: (config) => {
    config.plugins.push(codeInspectorPlugin({ bundler: 'webpack' }))
    config.plugins.push(
      AutoImport({
        imports: [
          'react',
        ],
        resolvers: [],
        dts: 'src/auto-typings/auto-imports.d.ts',
        dirs: [
          'src/store/**',
          'src/utils/**',
          'src/hooks',
          'src/lib/**',
        ],
      }),
    )
    return config
  },
}

export default config
