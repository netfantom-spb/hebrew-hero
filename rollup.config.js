import path from 'path';
import cleanupDir from 'rollup-plugin-cleanup-dir'
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension';
import typescript from '@rollup/plugin-typescript';

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
        simpleReloader(),
        // isProduction && zip({ dir: 'releases' })
    ],
}       