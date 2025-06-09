import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ferro-clock/', // <-- this is the critical line
  plugins: [react()],
});