import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor-query',
              test: /[\\/]node_modules[\\/](@tanstack|axios)[\\/]/,
              priority: 15,
            },
            {
              name: 'vendor-motion',
              test: /[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/,
              priority: 15,
            },
            {
              name: 'vendor-icons',
              test: /[\\/]node_modules[\\/](react-icons|lucide-react)[\\/]/,
              priority: 15,
            },
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://api-modi.altensor.com',
        changeOrigin: true,
        secure: true,
      },
      '/q': {
        target: 'https://api-modi.altensor.com',
        changeOrigin: true,
        secure: true,
      },
      '/uploads': {
        target: 'https://api-modi.altensor.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
