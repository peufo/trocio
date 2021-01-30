import path from 'path'
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { copySync, removeSync } from 'fs-extra'
import autoPreprocess from 'svelte-preprocess'
import postcssImport from 'postcss-import'
import postcss from 'rollup-plugin-postcss'
import alias from '@rollup/plugin-alias'
const { TROCIO_API_HOST } = require('./config.js') 
//import { injectManifest } from 'rollup-plugin-workbox'

const buildDir = 'build'
const production = !process.env.ROLLUP_WATCH;

// is for Svelte material UI
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

// clear previous builds
removeSync(buildDir)

export default {
    preserveEntrySignatures: false,
    input: [`src/index.js`],
    output: {
        sourcemap: true,
        format: 'esm',
        dir: `${buildDir}/dist`,
        // for performance, disabling filename hashing in development
        chunkFileNames:`[name]${production && '-[hash]' || ''}.js`
    },
    plugins: [
        alias({
            entries: [{find: /^\$\/(.*)/, replacement: `${__dirname}/src/components/$1`}]
        }),
        svelte({
            dev: !production, // run-time checks      
            // Extract component CSS — better performance
            css: css => css.write(`bundle.css`),
            preprocess: [
                autoPreprocess({
                    postcss: { plugins: [postcssImport()] },
                    defaults: { style: 'postcss' }
                })
            ]
        }),

        // resolve matching modules from current working directory
        resolve({
            browser: true,
            dedupe: importee => !!importee.match(/svelte(\/|$)/)
        }),
        commonjs(),

        production && terser(),
        {
            // provide node environment on the client
            transform: code => ({
                code: code.replace('__API__', TROCIO_API_HOST)
            })
        },
        postcss(postcssOptions()),
        
    //    injectManifest({
    //        globDirectory: assetsDir,
    //        globPatterns: ['**/*.{js,css,svg}', '__app.html'],
    //        swSrc: `src/sw.js`,
    //        swDest: `dist/serviceworker.js`,
    //        maximumFileSizeToCacheInBytes: 10000000, // 10 MB,
    //        mode: 'production'
    //    }),
        
        production && copySync('static', 'build'),
    ],
    watch: {
        clearScreen: false,
        buildDelay: 100,
    }
}
