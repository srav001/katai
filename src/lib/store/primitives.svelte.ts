import type { PrimitiveStore } from '$lib/types/store.js';
import { onDestroy } from 'svelte';

const effectToSubMap = new WeakMap<WeakKey, WeakSet<any>>();
let cacheModule: typeof import('./cache.js');

type Getter<T> = () => T;
export function get<T, U extends any>(store: PrimitiveStore<T>, derivation: (state: T) => U): Getter<U> {
	return derivation.bind(null, store.value);
}

type Updater<T> = (payload: T) => void;
export function update<T, U extends any, C extends any = unknown>(
	store: PrimitiveStore<T>,
	mutator: (state: T, payload: C) => U
): Updater<C> {
	return (val: C) => {
		mutator(store.value, val);
		if (store.name) {
			if (cacheModule) {
				cacheModule.handleCacheOfStore(store.name, store.value);
			} else {
				import('./cache.js').then((module) => {
					cacheModule = module;
					cacheModule.handleCacheOfStore(store.name, store.value);
				});
			}
		}
	};
}

type Subscriber<T, U = unknown> = (state: T) => U;
export type Subscribers<T> = Subscriber<T, unknown>[];
export type MapSources<T, U> = {
	[K in keyof T]: T[K] extends Subscriber<U, infer V> ? V : T[K] extends object ? T[K] : never;
};

export function subscribe<T, U extends Subscribers<T>>(
	store: PrimitiveStore<T>,
	subscribers: [...U],
	effect: (states: MapSources<U, T>) => void
): () => void {
	effectToSubMap.set(subscribers, new WeakSet().add(effect));

	const toDestroyEffect = $effect.root(() => {
		$effect(() => {
			const states = [] as MapSources<U, T>;
			for (const stateFn of subscribers) {
				states.push(stateFn(store.value));
			}
			effect(states);
		});
	});

	function toDestroy() {
		toDestroyEffect();
		effectToSubMap.get(subscribers)?.delete(effect);
	}

	try {
		onDestroy(toDestroy);
	} catch (err) {
		if ((err as any).message === 'onDestroy can only be used during component initialisation.') {
			// Handle silently
		} else {
			throw err;
		}
	}

	return toDestroy;
}
export function clearCache(storeName: string): void {
	if (cacheModule) {
		if (cacheModule.getCachedStoresMap().has(storeName)) {
			cacheModule
				.getCachedStoresMap()
				.get(storeName)
				?.adapter.deleteFromCache(cacheModule.getCacheKey(storeName)!);
		}
	} else {
		import('./cache.js').then((module) => {
			cacheModule = module;
			if (cacheModule.getCachedStoresMap().has(storeName)) {
				cacheModule
					.getCachedStoresMap()
					.get(storeName)
					?.adapter.deleteFromCache(cacheModule.getCacheKey(storeName)!);
			}
		});
	}
}
