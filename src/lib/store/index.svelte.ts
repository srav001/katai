/* eslint-disable @typescript-eslint/ban-types */
import type { PrimitiveStore, StoreState } from '$lib/types/store.js';
import { _cachedStoresMap, getCacheKey, type CacheOptons } from './cache.js';

const _stores: StoreState = $state({});

/**
 * It creates a store for the store and caches the store's state if the store is marked as
 * cacheable
 * @param {string} storeName - The name of the store. It is also used as part of cache key.
 * @param {T} storeName - T - This is the state of the store.
 * @returns A function that takes a store and returns a store.
 */
function createState<T>(storeName: string, storeState: T, options?: StoreOptions) {
	_stores[storeName] = storeState;
	if (options?.cache?.adapter) {
		if (!options?.cache?.key) {
			options.cache.key = storeName;
		}
		_cachedStoresMap.set(storeName, options.cache);

		options.cache.adapter.getFromCache(getCacheKey(storeName)!).then((data) => {
			if (
				data &&
				typeof data === 'object' &&
				((!Array.isArray(data) && Object.keys(data).length > 0) || (Array.isArray(data) && data.length > 0))
			) {
				_stores[storeName] = data;
			} else {
				options.cache?.adapter.setToCache(getCacheKey(storeName)!, storeState);
			}
		});
	} else if (options?.cache?.key && !options?.cache?.adapter) {
		throw new Error(`Cache adapter is not provided for ${storeName} Store`);
	}
}

export type StoreOptions = {
	cache?: CacheOptons;
};

/**
 * The createStore function is used to create a primitve store.
 */
export function createStore<InferedState>(
	storeName: string,
	storeState: InferedState,
	options?: StoreOptions
): PrimitiveStore<InferedState> {
	if (!storeName) {
		throw new Error('Store name is required');
	} else if (storeName in _stores) {
		throw new Error(`Store with name ${storeName} already exists, store names must be unique`);
	}

	if (!storeState) {
		throw new Error('Store value is required');
	} else {
		createState(storeName, storeState, options);
	}

	return {
		name: storeName,
		get value() {
			return _stores[storeName];
		}
	};
}
