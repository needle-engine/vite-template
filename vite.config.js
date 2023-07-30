import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(async ({ command }) => {
    const { needlePlugins, useGzip, loadConfig } = await import("@needle-tools/engine/plugins/vite/index.js");
    const needleConfig = await loadConfig();
    return {
        base: "./",
        plugins: [
            useGzip(needleConfig) ? viteCompression({ deleteOriginFile: true }) : null,
            needlePlugins(command, needleConfig, { noPoster: true }),
        ],
        server: {
            https: false,
            proxy: { // workaround: specifying a proxy skips HTTP2 which is currently problematic in Vite since it causes session memory timeouts.
                'https://localhost:1107': 'https://localhost:1107'
            },
            strictPort: true,
            port: 1107,
        },
        build: {
            outDir: "./dist",
            emptyOutDir: true,
            keepNames: true,
        }
    }
});