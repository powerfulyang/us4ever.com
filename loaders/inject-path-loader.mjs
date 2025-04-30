// loaders/inject-path-loader.js
// @ts-check
import path from 'node:path'

/** @typedef {{ repository: string }} Options */

/** @type {import('webpack').LoaderDefinitionFunction<Options>} */
function injectPathLoader(source) {
  const opts = /** @type {Options} */ (this.getOptions?.() || {})
  const repository = opts.repository
  const abs = this.resourcePath
  const rel = path
    .relative(this.rootContext, abs)
    .replace(/\\/g, '/')

  const repositoryPath = `${repository}/tree/main/${rel}`
  return source.replace(
    /__REPOSITORY_FILE_PATH__/g,
    JSON.stringify(repositoryPath),
  )
}

export default injectPathLoader
