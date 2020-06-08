import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'

const production = !process.env.ROLLUP_WATCH

const names = ['head', 'activity', 'profile', 'admin', 'trocs', 'cashier', 'welcome']
//const names = ['head']

function getExport(name) {
	return {
		input: `src/${name}.js`,
		output: {
			sourcemap: !production,
			format: 'iife',
			name: 'app',
			file: `public/assets/${name}.js`
			},
		plugins,
		watch: {clearScreen: false}
	}
}

const plugins = [
		svelte({
			dev: !production,
			emitCss: true
		}),
		resolve({
			browser: true
		}),
		commonjs(),
		postcss({
			extract: true,
			minimize: true,
			use: [
			  ['sass', {
				includePaths: [
				  './src/theme',
				  './node_modules'
				]
			  }]
			]
		}),
		!production && livereload('public'),
		production && terser()
	]

export default names.map(getExport)
