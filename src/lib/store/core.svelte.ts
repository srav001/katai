import type { CoreState, StoreState } from '$lib/types/store.js';
import { getCachedStoresMap, getCacheKey, handleCacheOfStore, type CacheOptons } from './cache.svelte.js';

const _storesMap = new Map<string, StoreState<CoreState>>();

export type StoreSettings = {
	cache?: CacheOptons;
};

export class PrimitiveStore<T extends CoreState> {
	private state = $state({
		v: {} as T,
		hasCache: false
	});
	$state: T;
	name: string;

	private handleCacheOfNewStore(storeName: string, storeState: T, options: StoreSettings) {
		if (!options?.cache?.key) {
			options.cache!.key = storeName;
		}
		getCachedStoresMap().set(storeName, options.cache!);

		const cacheKey = getCacheKey(storeName)!;
		options.cache!.adapter.get(cacheKey).then((data) => {
			if (
				data &&
				typeof data === 'object' &&
				((!Array.isArray(data) && Object.keys(data).length > 0) || (Array.isArray(data) && data.length > 0))
			) {
				_storesMap.get(storeName)!.v = data;
			} else {
				options.cache?.adapter.set(cacheKey, storeState);
			}
		});
	}

	private assignState(storeName: string, options?: StoreSettings) {
		_storesMap.set(storeName, this.state);
		if (options?.cache?.adapter) {
			this.state.hasCache = true;
			this.handleCacheOfNewStore(storeName, this.state.v, options);
		} else if (options?.cache?.key && !options?.cache?.adapter) {
			throw new Error(`Cache adapter is not provided for ${storeName} Store`);
		}
	}

	constructor(storeName: string, storeState: T, options?: StoreSettings) {
		if (!storeName) {
			throw new Error('Store name is required');
		} else if (_storesMap.has(storeName) === true) {
			throw new Error(`Store with name ${storeName} already exists, store names must be unique`);
		} else if (!storeState) {
			throw new Error('Store value is required');
		}

		this.name = storeName;
		this.state.v = storeState;
		this.$state = this.state.v;
		this.assignState(storeName, options);
	}
}

export function storeSetter<T extends CoreState>(storeName: string, storeState: T) {
	const store = _storesMap.get(storeName);
	if (store !== undefined) {
		_storesMap.get(storeName)!.v = storeState;
		if (store.hasCache === true) {
			handleCacheOfStore(storeName, storeState);
		}
	}
}
