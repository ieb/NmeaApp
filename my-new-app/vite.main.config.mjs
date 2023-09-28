import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs'


// https://vitejs.dev/config
export default defineConfig({
  build: {
    sourcemap: 'inline',
    minify: false,
    rollupOptions: {
      external: [
        'serialport'
      ]
    }
  },
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    browserField: false,
    conditions: ['node'],
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
  plugins: [
   /* commonjs(), */
  ]
});


