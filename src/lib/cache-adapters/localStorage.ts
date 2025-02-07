import type { CacheAdapter } from '$lib/store/cache.svelte.js';

export const localStorageAdapter: CacheAdapter = {
	async get(key, decoder = JSON.parse) {
		const val = localStorage.getItem(key);
		return val ? decoder(val) : undefined;
	},
	async set(key, v, encoder = JSON.stringify) {
		localStorage.setItem(key, encoder(v as unknown));
	},
	delete(key) {
		localStorage.removeItem(key);
	}
};
