import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from "fs";

export default defineConfig(async ({ command }) => {
    const { needlePlugins, useGzip, loadConfig, getOutputDirectory } = await import("@needle-tools/engine/plugins/vite/index.js");
    const needleConfig = await loadConfig();

    return {
        base: "./",
        plugins: [
            basicSsl(),
            useGzip(needleConfig) ? viteCompression({ deleteOriginFile: true }) : null,
            needlePlugins(command, needleConfig, {}),
            VitePWA({
                registerType: 'autoUpdate',
                outDir: getOutputDirectory(),
                manifest: JSON.parse(readFileSync("manifest.webmanifest", "utf8")),
            }),
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