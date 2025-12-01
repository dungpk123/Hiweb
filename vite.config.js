import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    base: '/id/',
    define: {
      global: 'globalThis',
    },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@features': path.resolve(__dirname, './src/feature-module'),
      '@assets': path.resolve(__dirname, './public/assets'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions'],
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    force: true, 
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['react-redux', '@reduxjs/toolkit'],
          'vendor-ui': ['antd', 'bootstrap', 'react-bootstrap'],
          'vendor-charts': ['chart.js', 'react-chartjs-2', 'apexcharts', 'react-apexcharts'],
          'vendor-icons': ['feather-icons-react', 'react-icons', 'react-feather'],
        },
      },
    },
  },
  optimizeDeps: {
    force: true, 
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-redux',
      '@reduxjs/toolkit',
      '@fullcalendar/core',
      '@fullcalendar/daygrid',
      '@fullcalendar/interaction',
      '@fullcalendar/react',
      '@fullcalendar/timegrid',
      'bootstrap-daterangepicker',
    ],
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  cacheDir: 'node_modules/.vite',
  };
});
