import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 291 console.log calls were shipping in the production bundle, several of
  // them printing request payloads and user records to the browser console.
  // esbuild treats these as side-effect-free and strips them when minifying,
  // so development logging is untouched. console.warn and console.error are
  // kept - they are real diagnostics.
  esbuild: {
    pure: ['console.log', 'console.info', 'console.debug'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000 KB
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
          api: ['axios'],
        },
      },
    },
  },
});
