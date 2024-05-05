import type { PrimitiveStore } from '$lib/types/store.js';
import { subscribe } from './primitives.svelte.js';

const CACHE_KEY = 'katai-';
export type CacheOptons = {
	adapter: {
		getFromCache: <U>(key: string, decoder?: (val: string) => any) => Promise<U | undefined>;
		setToCache: (key: string, data: any, encoder?: (val: any) => string) => void;
		deleteFromCache: (key: string) => void;
	};
	key?: string;
	deep?: boolean;
};

// eslint-disable-next-line sonarjs/no-unused-collection
const _cachedStoresMap = new Map<string, CacheOptons>();

/**
 * The function `getCachedStoresMap` returns the cached stores map in TypeScript.
 * @returns The function `getCachedStoresMap` is returning the `_cachedStoresMap` variable.
 */
export function getCachedStoresMap() {
	return _cachedStoresMap;
}

/**
 * The function `getCacheKey` returns a cache key based on the store name if it exists in a map.
 * @param {string} storeName - The `storeName` parameter is a string that represents the name of a
 * store for which we want to retrieve a cache key.
 * @returns The function `getCacheKey` returns a cache key string if the store name exists in the
 * `_cachedStoresMap`, otherwise it returns `undefined`.
 */
export function getCacheKey(storeName: string) {
	if (_cachedStoresMap.has(storeName)) {
		return `${CACHE_KEY}-${storeName}-${_cachedStoresMap.get(storeName)!.key}`;
	}
	return undefined;
}

/**
 * The function `handleCacheOfStore` checks if a store is cached and updates the cache with the
 * provided state if it exists.
 * @param {string} storeName - The `storeName` parameter is a string that represents the name of the
 * store for which caching needs to be handled.
 * @param {T} state - The `state` parameter in the `handleCacheOfStore` function represents the current
 * state of the store that you want to cache. It is of type `T`, which means it can be any data type as
 * specified when calling the function.
 */
export function handleCacheOfStore<T>(storeName: string, state: T) {
	if (_cachedStoresMap.has(storeName)) {
		const cacheOptions = _cachedStoresMap.get(storeName);
		if (!cacheOptions?.deep && cacheOptions?.adapter) {
			cacheOptions.adapter.setToCache(getCacheKey(storeName)!, state);
		}
	}
}

export function cacheDeeply<T>(store: PrimitiveStore<T>): (() => void) | undefined {
	if (_cachedStoresMap.has(store.name)) {
		const cacheOptions = _cachedStoresMap.get(store.name);
		if (cacheOptions?.deep === true) {
			return subscribe(store, [() => $state.snapshot(store.value)], ([state]) =>
				cacheOptions.adapter.setToCache(getCacheKey(store.name)!, state)
			);
		}
		return undefined;
	}
	return undefined;
}
