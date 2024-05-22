import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import react from '@vitejs/plugin-react-swc';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/esm/index.js',
            format: 'es',
            sourcemap: true
        },
        {
            file: 'dist/cjs/index.js',
            format: 'cjs',
            sourcemap: true
        }
    ],
    plugins: [
        react(),
        resolve(),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.package.json'
        })
    ],
    external: ['react', 'react-dom', 'tslib']
};
