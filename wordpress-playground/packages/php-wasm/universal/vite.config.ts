/// <reference types="vitest" />
import { defineConfig } from 'vite';

import dts from 'vite-plugin-dts';
import { join } from 'path';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { viteTsConfigPaths } from '../../vite-ts-config-paths';

export default defineConfig({
	cacheDir: '../../../node_modules/.vite/php-wasm-universal',

	plugins: [
		dts({
			entryRoot: 'src',
			tsConfigFilePath: join(__dirname, 'tsconfig.lib.json'),
			skipDiagnostics: true,
		}),

		viteTsConfigPaths({
			root: '../../../',
		}),
	],

	// Configuration for building your library.
	// See: https://vitejs.dev/guide/build.html#library-mode
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points.
			entry: 'src/index.ts',
			name: 'php-wasm-universal',
			fileName: 'index',
			formats: ['es', 'cjs'],
		},
		rollupOptions: {
			// External packages that should not be bundled into your library.
			external: [],
		},
	},

	test: {
		globals: true,
		cache: {
			dir: '../../../node_modules/.vitest',
		},
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
	},
});
