import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
// Optimized for Oracle Cloud Infrastructure (OCI) Object Storage deployment
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          
          // Chart libraries (heavy)
          if (id.includes('node_modules/recharts')) {
            return 'chart-vendor';
          }
          
          // Excel processing (heavy)
          if (id.includes('node_modules/xlsx')) {
            return 'excel-vendor';
          }
          
          // PDF generation (heavy)
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
            return 'pdf-vendor';
          }
          
          // Icons
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
          
          // Form libraries
          if (id.includes('node_modules/react-hook-form')) {
            return 'form-vendor';
          }
          
          // Utilities
          if (id.includes('node_modules/date-fns')) {
            return 'utils-vendor';
          }
          
          // Split components by feature
          if (id.includes('/components/Dashboard')) {
            return 'dashboard-chunk';
          }
          if (id.includes('/components/Analysis')) {
            return 'analysis-chunk';
          }
          if (id.includes('/components/Procurement')) {
            return 'procurement-chunk';
          }
          if (id.includes('/components/ProjectsAndTasks')) {
            return 'projects-tasks-chunk';
          }
        },
      },
    },
  },
  // Base URL configuration for OCI Object Storage
  // Update this after getting your OCI bucket URL
  base: './',
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
})