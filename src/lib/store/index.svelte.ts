/* eslint-disable @typescript-eslint/ban-types */
import { debounce } from '$lib/utils/index.js';
import { onDestroy } from 'svelte';
import type { GenericArray, GenericObject, PrimitiveTypes } from '../types/utilities.js';

export type TypesOfState = Record<string, PrimitiveTypes | GenericArray | GenericObject>;
export type BasicStore<T = TypesOfState> = {
	name: string;
	state: T;
};

const CACHE_KEY = 'katai-';
type CacheOptons = {
	adapter: {
		getFromCache: <U>(key: string, decoder?: (val: string) => any) => Promise<U | undefined>;
		setToCache: (key: string, data: any, encoder?: (val: any) => string) => void;
		deleteFromCache: (key: string) => void;
	};
	key?: string;
};
// eslint-disable-next-line sonarjs/no-unused-collection
const _cachedStoresMap = new Map<string, CacheOptons>();
function getCacheKey(storeName: string) {
	if (_cachedStoresMap.has(storeName)) {
		return `${CACHE_KEY}-${storeName}-${_cachedStoresMap.get(storeName)!.key}`;
	}
	return undefined;
}

const _stores: Record<string, any> = $state({});

/**
 * It creates a store for the store and caches the store's state if the store is marked as
 * cacheable
 * @param {T} store - T extends BasicStore - This is the store that we're creating a store for.
 * @returns A function that takes a store and returns a store.
 */
function createState<T extends BasicStore>(store: T, options?: StoreOptions) {
	_stores[store.name] = store.state;
	if (options?.cache?.adapter) {
		if (!options?.cache?.key) {
			options.cache.key = store.name;
		}
		_cachedStoresMap.set(store.name, options.cache);

		options.cache.adapter.getFromCache(getCacheKey(store.name)!).then((data) => {
			if (
				data &&
				typeof data === 'object' &&
				((!Array.isArray(data) && Object.keys(data).length > 0) || (Array.isArray(data) && data.length > 0))
			) {
				_stores[store.name] = data;
			} else {
				options.cache?.adapter.setToCache(getCacheKey(store.name)!, store.state);
			}
		});
	} else if (options?.cache?.key && !options?.cache?.adapter) {
		throw new Error(`Cache adapter is not provided for ${store.name} Store`);
	}

	return store;
}

/**
 * If the store is cached, then set the state to the cache
 * @param {string} storeName - The key of the store that was updated.
 */
const handleCacheOfStore = debounce((storeName: string) => {
	if (_cachedStoresMap.has(storeName)) {
		setTimeout(() => {
			const cacheAdapter = _cachedStoresMap.get(storeName)!.adapter;
			cacheAdapter.setToCache(getCacheKey(storeName)!, _stores[storeName]);
		}, 0);
	}
}, 50);

type StoreOptions = {
	cache?: CacheOptons;
};

const effectToSubMap = new WeakMap<WeakKey, WeakSet<any>>();

function storeInstance<InferedState>(store: BasicStore<InferedState>, storeName: string, options?: StoreOptions) {
	if (!store && !storeName) {
		throw new Error('Store value is required');
	}
	if (store) {
		createState(store as any, options);
	}

	function subscribe(states: Array<(val: InferedState) => any>, effect: (states: any) => void) {
		effectToSubMap.set(states, new WeakSet().add(effect));

		const toDestroyEffect = $effect.root(() => {
			$effect(() => {
				const state = [];
				for (const stateFn of states) {
					state.push(stateFn(_stores[storeName]));
				}
				effect(state);
				if (options?.cache?.adapter) {
					handleCacheOfStore(storeName);
				}
			});
		});

		function toDestroy() {
			console.log('Unsubscribing');
			toDestroyEffect();
		}

		try {
			onDestroy(toDestroy);
		} catch (err) {
			console.log(err);
		}

		return toDestroy;
	}

	type Getter<T> = () => T;
	type Mutator<T> = (val: T) => void;

	return {
		get<T extends any>(derivation: (state: InferedState) => T): Getter<T> {
			return () => derivation(_stores[storeName]);
		},
		update<T>(updater: (state: InferedState) => T) {
			updater(_stores[storeName]);
		},
		subscribe,
		get $value() {
			return _stores[storeName];
		},
		clearCache() {
			if (_cachedStoresMap.has(storeName)) {
				_cachedStoresMap.get(storeName)?.adapter.deleteFromCache(getCacheKey(storeName)!);
			}
		}
	};
}

/**
 * The createStore function is used to create a store.
 * It returns an object with several functions to interact with the store's state,
 * including get, update, set, next, and has.
 */
export function createStore<T>(store: BasicStore<T>, options?: StoreOptions) {
	return storeInstance(store, store.name, options);
}
