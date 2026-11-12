import { defineConfig } from 'vite';

// base: './' – נתיבים יחסיים, כדי שהמשחק יעבוד גם בכתובת של GitHub Pages
export default defineConfig({
  base: './',
  server: { host: true, port: 5180 },
});
