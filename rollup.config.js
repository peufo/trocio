const { TROCIO_API_HOST, TROCIO_DEV } = require('./config.js') 
import { createRollupConfigs } from './scripts/base.config.js'
import autoPreprocess from 'svelte-preprocess'
import postcssImport from 'postcss-import'
import postcss from 'rollup-plugin-postcss'
import alias from 'rollup-plugin-alias'
import replace from '@rollup/plugin-replace'
import fs from 'fs'
import path from 'path'

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

//Rend le dossier components plus accèssible
const componentsFolder = `${__dirname}/src/components/`
const arrComponents = fs.readdirSync(componentsFolder)
let allEntries = arrComponents.map(component => ({find: component, replacement: `${componentsFolder}${component}`}))
const aliases = alias({ resolve: ['.svelte', '.js'], entries: allEntries})

export const config = {
	staticDir: 'static',
	distDir: 'dist',
	buildDir: `dist/build`,
	serve: false,
	production,
	rollupWrapper: rollup => {
		rollup.plugins = [
			aliases,
			replace({__API__: '/api'}),
			...rollup.plugins,
			postcss(postcssOptions())
		]
		return rollup
	},
	svelteWrapper: svelte => {
		svelte.preprocess = [
		autoPreprocess({
			postcss: { plugins: [postcssImport()] },
			defaults: { style: 'postcss' }
		})]
	},
	swWrapper: worker => worker,
}

const configs = createRollupConfigs(config)

export default configs

/**
  Wrappers can either mutate or return a config

  wrapper example 1
  svelteWrapper: (cfg, ctx) => {
    cfg.preprocess: mdsvex({ extension: '.md' }),
  }

  wrapper example 2
  rollupWrapper: cfg => {
    cfg.plugins = [...cfg.plugins, myPlugin()]
    return cfg
  }
*/

