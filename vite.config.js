import { defineConfig } from 'vite';

export default defineConfig(async ({ command }) => {
    const { needlePlugins, useGzip, loadConfig } = await import("@needle-tools/engine/vite");
    const needleConfig = await loadConfig();
    return {
        base: "./",
        plugins: [
            needlePlugins(command, needleConfig, { noPoster: true, allowHotReload: false }),
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