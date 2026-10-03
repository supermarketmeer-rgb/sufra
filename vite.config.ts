import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command }) => {
  const plugins: any[] = [react(), tailwindcss()];

  // Only mount API middleware during local dev server ('serve'), never during 'build'
  if (command === 'serve') {
    plugins.push({
      name: 'api-middleware',
      async configureServer(server: any) {
        const expressModule = (await import('express')).default;
        const app = expressModule();
        const { apiRouter } = await import('./api-routes.js');
        app.use(apiRouter);
        server.middlewares.use('/api', app);
      }
    });
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
