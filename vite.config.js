import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(async ({ command }) => {
    const { needlePlugins, useGzip, loadConfig, getOutputDirectory } = await import("@needle-tools/engine/plugins/vite/index.js");
    const needleConfig = await loadConfig();


    /** @type {import("vite-plugin-pwa").VitePWAOptions} */
    const PWAOptions = {};

    return {
        base: "./",
        plugins: [
            basicSsl(),
            useGzip(needleConfig) ? viteCompression({ deleteOriginFile: true }) : null,
            needlePlugins(command, needleConfig, { pwaOptions: PWAOptions }),
            VitePWA(PWAOptions),
        ],
        server: {
            https: true,
            proxy: { // workaround: specifying a proxy skips HTTP2 which is currently problematic in Vite since it causes session memory timeouts.
                'https://localhost:3000': 'https://localhost:3000'
            },
            strictPort: true,
            port: 3000,
        },
        build: {
            outDir: "./dist",
            emptyOutDir: true,
            keepNames: true,
        }
    }
});