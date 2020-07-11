import { createRollupConfigs } from './scripts/base.config.js'
import path from 'path'
import postcss from 'rollup-plugin-postcss'

const production = !process.env.ROLLUP_WATCH;

const postcssOptions = () => ({
	extensions: ['.scss', '.sass'],
	extract: false,
	minimize: true,
	use: [
	  ['sass', {
		includePaths: [
		  './src/theme',
		  './node_modules',
		  // This is only needed because we're using a local module. :-/
		  // Normally, you would not need this line.
		  path.resolve(__dirname, '..', 'node_modules')
		]
	  }]
	]
  })

export const config = {
  staticDir: 'static',
  distDir: 'dist',
  buildDir: `dist/build`,
  serve: !production,
  production,
  rollupWrapper: cfg => {
	cfg.plugins = [...cfg.plugins, postcss(postcssOptions())]
	return cfg
  },
  svelteWrapper: cfg => cfg,
  swWrapper: cfg => cfg,
}

const configs = createRollupConfigs(config)

export default configs




/** wrapper example 1 */
// svelteWrapper: (cfg, ctx) => ({
//   ...cfg,
//   preprocess: mdsvex({ extension: '.md' }),
// })

/** wrapper example 2 */
// rollupWrapper: cfg => {
//   cfg.plugins = [...cfg.plugins, myPlugin()]
//   return cfg
// }