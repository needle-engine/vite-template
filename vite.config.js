import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(async ({ command }) => {
    const { needlePlugins, useGzip, loadConfig } = await import("@needle-tools/engine/plugins/vite/index.js");
    const needleConfig = await loadConfig();
    return {
        base: "./",
        plugins: [
            useGzip(needleConfig) ? viteCompression({ deleteOriginFile: true }) : null,
            needlePlugins(command, needleConfig, { noPoster: true, }),
        ],
        server: {
            https: false,
            proxy: {
              'https://localhost:3000': 'https://localhost:3000',
            },
            strictPort: true,
            port: 3000,
            hmr: false,
        },
        build: {
            outDir: "./dist",
            emptyOutDir: true,
        }
    }
});