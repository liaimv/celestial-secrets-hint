import { build } from 'vite';
import viteConfig from './vite.config.js';

try {
  await build(viteConfig);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

