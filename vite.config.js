import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    noDiscovery: true,
    include: ['react', 'react-dom/client'],
    exclude: ['lucide-react'],
  },
  server: { host: '127.0.0.1', watch: { ignored: ['**/backend/**', '**/dist/**'] } },
});
