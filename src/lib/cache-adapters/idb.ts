import type { CacheAdapter } from '$lib/store/cache.svelte.js';
import { del as d, get as g, set as s } from 'idb-keyval/dist/index.js';

export const idbAdapter: CacheAdapter = {
	async get(key, _) {
		return await g(key);
	},
	set(key, v, _) {
		return s(key, v);
	},
	delete(key: string) {
		d(key);
	}
};
