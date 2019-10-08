import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'

const production = !process.env.ROLLUP_WATCH

function getOutput(name) {
	return {
		sourcemap: !production,
		format: 'iife',
		name: 'app',
		file: `public/assets/${name}.js`
	}
}

const plugins = [
		svelte({
			dev: !production,
			emitCss: true
		}),
		resolve({
			browser: true,
			mainField: true
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


export default [
{
	input: 'src/me.js',
	output: getOutput('me'),
	plugins,
	watch: {clearScreen: false}
},
{
	input: 'src/admin.js',
	output: getOutput('admin'),
	plugins,
	watch: {clearScreen: false}
},
{
	input: 'src/trocs.js',
	output: getOutput('trocs'),
	plugins,
	watch: {clearScreen: false}
},
{
	input: 'src/cashier.js',
	output: getOutput('cashier'),
	plugins,
	watch: {clearScreen: false}
},
]
