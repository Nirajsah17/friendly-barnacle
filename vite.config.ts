import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Ensure the output directory is correct
    assetsDir: 'assets', // Default is 'assets', ensure it is not changed
    sourcemap: true, // Optional, for debugging purposes
  }
});
