import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // To add support for `global`
      globals: {
        global: true,
      },
    }),
  
  ],
    base:process.env.VITE_BASE_PATH || "/BNBopenDotSci",
})
