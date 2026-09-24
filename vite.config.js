import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // build output and deploy archives change outside of development and can be locked by other programs
      ignored: ['**/dist/**', '**/*.zip', '**/design-system/**'],
    },
  },
})
