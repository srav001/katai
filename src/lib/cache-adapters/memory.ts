import type { CacheAdapter } from '$lib/store/cache.svelte.js';

export function createMemoryAdapter(): CacheAdapter {
	let s = '{}';
	return {
		async get(_, decorder = JSON.parse) {
			return decorder(s);
		},
		async set(_, v, encoder = JSON.stringify) {
			s = encoder(v);
		},
		delete(_) {
			s = '{}';
		}
	};
}
