import { defineConfig } from 'vite';

export default defineConfig({
  // Served at the root of a domain (Vercel / Netlify / Cloudflare Pages).
  // If you ever move to GitHub Pages on a project repo, change this to
  // '/<repo-name>/' so asset URLs resolve under the subpath.
  base: '/',

  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },

  server: {
    port: 5173,
    open: false,
  },
});
