import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Plugin to copy data directory to dist
function copyDataPlugin() {
  return {
    name: 'copy-data',
    writeBundle() {
      const dataDir = 'data';
      const distDataDir = join('dist', 'data');
      
      function copyRecursive(src, dest) {
        mkdirSync(dest, { recursive: true });
        const entries = readdirSync(src);
        
        for (const entry of entries) {
          const srcPath = join(src, entry);
          const destPath = join(dest, entry);
          const stat = statSync(srcPath);
          
          if (stat.isDirectory()) {
            copyRecursive(srcPath, destPath);
          } else {
            copyFileSync(srcPath, destPath);
          }
        }
      }
      
      try {
        copyRecursive(dataDir, distDataDir);
      } catch (error) {
        console.error('Error copying data directory:', error);
      }
    }
  };
}

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  plugins: [copyDataPlugin()]
});

