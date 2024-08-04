/* eslint-disable @typescript-eslint/ban-types */
import type { CoreState, PrimitiveStore, StoreState } from '$lib/types/store.js';
import type { CacheOptons } from './cache.js';

const _storesMap = new Map<string, StoreState<CoreState>>();

let cacheModule: typeof import('./cache.js');

export type StoreSettings = {
	cache?: CacheOptons;
};

/**
 * The function `handleCacheOfNewStore` manages caching for a new store by checking if data is already
 * cached and setting it if not.
 * @param {string} storeName - The `storeName` parameter is a string that represents the name of the
 * store for which caching is being handled.
 * @param {T} storeState - `storeState` is the initial state of the store that will be cached. It
 * represents the data that will be stored in the cache for the specified `storeName`.
 * @param {StoreSettings} options - The `options` parameter is an object that contains configuration
 * options for the store, including a `cache` property that itself is an object with properties like
 * `key` and `adapter`.
 */
function handleCacheOfNewStore<T>(storeName: string, storeState: T, options: StoreSettings) {
	if (!options?.cache?.key) {
		options.cache!.key = storeName;
	}
	cacheModule.getCachedStoresMap().set(storeName, options.cache!);

	const cacheKey = cacheModule.getCacheKey(storeName)!;
	options.cache!.adapter.getFromCache(cacheKey).then((data) => {
		if (
			data &&
			typeof data === 'object' &&
			((!Array.isArray(data) && Object.keys(data).length > 0) || (Array.isArray(data) && data.length > 0))
		) {
			_storesMap.get(storeName)!.value = data;
		} else {
			options.cache?.adapter.setToCache(cacheKey, storeState);
		}
	});
}

export function storeSetter<T extends CoreState>(storeName: string, storeState: T) {
	const store = _storesMap.get(storeName);
	if (store) {
		_storesMap.get(storeName)!.value = storeState;
		if (store.hasCache === true) {
			if (cacheModule) {
				cacheModule.handleCacheOfStore(storeName, storeState);
			} else {
				import('./cache.js').then((module) => {
					cacheModule = module;
					cacheModule.handleCacheOfStore(storeName, storeState);
				});
			}
		}
	}
}

/**
 * The function `createState` creates a new store with the provided state and handles caching based on
 * the options provided.
 * @param {string} storeName - The `storeName` parameter is a string that represents the name of the
 * store being created.
 * @param {T} storeState - The `storeState` parameter in the `createState` function represents the
 * initial state of the store that you want to create. It is the data structure that will be stored and
 * managed by the store.
 * @param {StoreSettings} [options] - The `options` parameter in the `createState` function is an
 * optional object that can contain the following properties:
 */
function createState<T extends CoreState>(storeName: string, storeState: T, options?: StoreSettings): StoreState<T> {
	const state = $state({
		value: storeState,
		hasCache: false
	});
	_storesMap.set(storeName, state);
	if (options?.cache?.adapter) {
		state.hasCache = true;
		if (cacheModule) {
			handleCacheOfNewStore(storeName, storeState, options);
		} else {
			import('./cache.js').then((module) => {
				cacheModule = module;
				handleCacheOfNewStore(storeName, storeState, options);
			});
		}
	} else if (options?.cache?.key && !options?.cache?.adapter) {
		throw new Error(`Cache adapter is not provided for ${storeName} Store`);
	}
	return state;
}

3;

/**
 * The function `createStore` creates a primitive store with a specified name and initial state.
 * @param {string} storeName - The `storeName` parameter is a string that represents the name of the
 * store being created. It is a required parameter for creating a new store.
 * @param {InferedState} storeState - The `storeState` parameter in the `createStore` function
 * represents the initial state or value that will be stored in the created store. It is the data that
 * the store will manage and provide access to.
 * @param {StoreSettings} [options] - The `options` parameter in the `createStore` function is an
 * optional parameter that allows you to provide additional configuration options for creating the
 * store. It is of type `StoreOptions`, which likely contains properties or settings that can be used
 * to customize the behavior of the store creation process like adding cache adapters.
 * @returns A PrimitiveStore object with the store name and a getter function for the store value.
 */
export function createStorePrimitive<InferedState extends CoreState>(
	storeName: string,
	storeState: InferedState,
	options?: StoreSettings
): PrimitiveStore<InferedState> {
	if (!storeName) {
		throw new Error('Store name is required');
	} else if (_storesMap.has(storeName) === true) {
		throw new Error(`Store with name ${storeName} already exists, store names must be unique`);
	}

	let state: StoreState<InferedState>;
	if (!storeState) {
		throw new Error('Store value is required');
	} else {
		state = createState(storeName, storeState, options);
	}

	return {
		name: storeName,
		get $value() {
			return state.value;
		}
	};
}
