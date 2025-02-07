import type { CacheAdapter } from '$lib/store/cache.svelte.js';
import { del as d, get as g, set as s } from 'idb-keyval/dist/index.js';

export const idbAdapter: CacheAdapter = {
	async get(key, decoder = JSON.parse) {
		return decoder((await g(key)) ?? '{}');
	},
	set(key, v, encoder = JSON.stringify) {
		return s(key, encoder(v));
	},
	delete(key: string) {
		d(key);
	}
};
