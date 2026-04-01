import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: [
      // eslint ignore globs here
      'prisma/**',
      'public/**',
      'next.config.js',
      'README.md',
      '**/*.md',
      '*.md',
    ],
    react: true,
    nextjs: true,
    formatters: {
      /**
       * Format CSS, LESS, SCSS files, also the `<style>` blocks in Vue
       * By default uses Prettier
       */
      css: true,
      /**
       * Format HTML files
       * By default uses Prettier
       */
      html: true,
      /**
       * Format Markdown files
       * Supports Prettier and dprint
       * By default uses Prettier
       */
      markdown: 'prettier',
    },
  },
  {
    rules: {
      // overrides
      'no-console': 'off',
      'node/prefer-global/process': 'off',
      // useEffect 中同步外部状态是合理的模式
      'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
    },
  },
)
