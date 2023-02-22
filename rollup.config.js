import path from 'path';
import cleanupDir from 'rollup-plugin-cleanup-dir'
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'
import typescript from '@rollup/plugin-typescript'
import strip from '@rollup/plugin-strip'
import terser from '@rollup/plugin-terser'
import zip from 'rollup-plugin-zip'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'


const isProduction = process.env.NODE_ENV === 'production',
    manifestFile = 'src/manifest.json';

export default {
    input: manifestFile,
    output: {
        dir: 'build',
        format: 'es',
        chunkFileNames: path.join('chunks', '[name]-[hash].js'),
        sourcemap: !isProduction
    },
    plugins: [
        cleanupDir(),

        chromeExtension(),

        typescript(),

        isProduction && strip({
            include: [
                '**/*.js',
                '**/*.ts'
            ],
            functions: [
                'console.*',
            ],
        }),

        resolve(),
        commonjs(),

        isProduction && terser(),

        isProduction && zip({ dir: 'releases' }),

        simpleReloader(),
    ],
}       