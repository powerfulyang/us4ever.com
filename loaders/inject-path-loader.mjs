// loaders/inject-path-loader.js
// @ts-check
import path from 'node:path'

/** @typedef {{ repository: string }} Options */

const BACKSLASH_GLOB_REGEXP = /\\/g
const REPOSITORY_FILE_PATH_GLOB_REGEXP = /__REPOSITORY_FILE_PATH__/g

/** @type {import('webpack').LoaderDefinitionFunction<Options>} */
function injectPathLoader(source) {
  const opts = /** @type {Options} */ (this.getOptions?.() || {})
  const repository = opts.repository
  const abs = this.resourcePath
  const rel = path
    .relative(this.rootContext, abs)
    .replace(BACKSLASH_GLOB_REGEXP, '/')

  const repositoryPath = `${repository}/tree/main/${rel}`
  return source.replace(
    REPOSITORY_FILE_PATH_GLOB_REGEXP,
    JSON.stringify(repositoryPath),
  )
}

export default injectPathLoader
