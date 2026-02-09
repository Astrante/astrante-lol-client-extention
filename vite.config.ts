import { resolve, join, basename } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile, cp, mkdir, rm } from 'node:fs/promises';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import fs from 'node:fs';

import pkg from './package.json';
const PENGU_PATH = pkg.config.penguPath;
const PLUGIN_NAME = pkg.name;

const getIndexCode = (port: number) => (
    `await import('https://localhost:${port}/@vite/client');
    export * from 'https://localhost:${port}/src/index.ts';`
);

let port: number;
const outDir = resolve(__dirname, 'dist');
const pluginsDir = resolve(__dirname, PENGU_PATH, 'plugins', PLUGIN_NAME);

async function emptyDir(path: string) {
    if (existsSync(path)) {
        await rm(path, { recursive: true });
    }
    await mkdir(path, { recursive: true });
}

export default defineConfig((config) => ({
    define: {
        'process.env.ENV': config.command == 'build' ? '"production"' : '"development"',
        'process.env.PROD': config.command == 'build' ? 'true' : 'false',
        'process.env.DEV': config.command == 'build' ? 'false' : 'true',
    },
    build: {
        target: 'esnext',
        minify: false,
        cssMinify: false,
        rollupOptions: {
            output: {
                format: 'esm',
                entryFileNames: 'index.js',
                manualChunks: undefined,  // Allow dynamic imports to create separate chunks
                assetFileNames(name) {
                    if (name.name === 'style.css')
                        return 'index.css';
                    return 'assets/[name]-[hash][extname]';
                }
            },
            preserveEntrySignatures: 'strict',
            treeshake: 'smallest',
        },
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            fileName: 'index',
            formats: ['es'],
        },
    },
    server: {
        https: true,
    },
    publicDir: false,
    plugins: [
        mkcert(),
        {
            name: 'pengu-serve',
            apply: 'serve',
            enforce: 'post',
            configureServer(server) {
                server.httpServer!.once('listening', async () => {
                    port = server.httpServer.address()['port'];
                    await emptyDir(pluginsDir);
                    await writeFile(join(pluginsDir, 'index.js'), getIndexCode(port));
                });
            },
            transform: (code, id) => {
                if (/\.(ts|tsx|js|jsx)$/i.test(id)) return;
                return code.replace(/\/src\//g, `https://localhost:${port}/src/`)
            },
        },
        {
            name: 'pengu-build',
            apply: 'build',
            enforce: 'post',
            async closeBundle() {
                const indexJs = join(outDir, 'index.js');
                let count = 0;

                // Read and patch index.js
                let jsCode = (await readFile(indexJs, 'utf-8'))
                    .replace(/"\/assets\//g, `"//plugins/${PLUGIN_NAME}/assets/`);

                // Patch index.css if exists
                if (existsSync(join(outDir, 'index.css'))) {
                    const indexCss = join(outDir, 'index.css');
                    const cssCode = (await readFile(indexCss, 'utf-8'))
                        .replace(/url\(\/assets\//g, `url(./assets/`);
                    await writeFile(indexCss, cssCode);

                    // Import CSS module in index.js
                    jsCode = `import "./index.css";\n${jsCode}`;
                }

                await writeFile(indexJs, jsCode);

                // Add author comment block
                const Author = `/**\n* @name Astrante Theme\n* @author Astrante\n* @description Astrante theme with AutoAccept for Pengu Loader\n*/`;
                async function prependCommentToFile(filePath: string, commentBlock: string, lineNumber: number) {
                    try {
                        if (!existsSync(filePath)) {
                            console.error(`File not found: ${filePath}`);
                            return;
                        }

                        const data = await readFile(filePath, 'utf-8');
                        const lines = data.split('\n');
                        lines.splice(lineNumber - 1, 0, commentBlock.trim());
                        const updatedContent = lines.join('\n');
                        await writeFile(filePath, updatedContent, 'utf-8');
                    } catch (err) {
                        console.error('Error while processing the file:', err);
                    }
                }

                await prependCommentToFile(indexJs, Author, 1);

                // Copy config folder
                try {
                    await cp(resolve(__dirname, 'src/config'), join(outDir, 'config'), { recursive: true });
                } catch (err) {
                    console.error('Error copying config folder:', err);
                }

                // Copy locales folder
                try {
                    await cp(resolve(__dirname, 'src/locales'), join(outDir, 'locales'), { recursive: true });
                } catch (err) {
                    console.error('Error copying locales folder:', err);
                }

                // Copy output to Pengu directory
                count = 0;
                const penguInterval = setInterval(() => count += 100, 100);
                try {
                    await emptyDir(pluginsDir);
                    await cp(outDir, pluginsDir, { recursive: true });
                } catch (err) {
                    console.error('Error while copying to Pengu directory:', err);
                } finally {
                    clearInterval(penguInterval);
                    count = 0;
                }
            }
        },
    ]
}));
