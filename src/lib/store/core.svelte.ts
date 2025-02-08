import type { CoreState, StoreState } from '$lib/types/store.js';
import { getCachedStoresMap, getCacheKey, handleCacheOfStore, type CacheOptons } from './cache.svelte.js';

const _storesMap = new Map<string, StoreState<CoreState>>();

export type StoreSettings = {
	cache?: CacheOptons;
};

export class PrimitiveStore<InferedState extends CoreState> {
	private state: StoreState<InferedState>;
	name: string;

	constructor(storeName: string, storeState: InferedState, options?: StoreSettings) {
		if (!storeName) {
			throw new Error('Store name is required');
		} else if (_storesMap.has(storeName) === true) {
			throw new Error(`Store with name ${storeName} already exists, store names must be unique`);
		} else if (!storeState) {
			throw new Error('Store value is required');
		}

		this.name = storeName;
		this.state = this.createState(storeName, storeState, options);
	}

	private createState(
		storeName: string,
		storeState: InferedState,
		options?: StoreSettings
	): StoreState<InferedState> {
		const state = {
			value: $state(storeState),
			hasCache: false
		};
		_storesMap.set(storeName, state);
		if (options?.cache?.adapter) {
			state.hasCache = true;
			this.handleCacheOfNewStore(storeName, storeState, options);
		} else if (options?.cache?.key && !options?.cache?.adapter) {
			throw new Error(`Cache adapter is not provided for ${storeName} Store`);
		}
		return state;
	}

	private handleCacheOfNewStore(storeName: string, storeState: InferedState, options: StoreSettings) {
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
				_storesMap.get(storeName)!.value = data;
			} else {
				options.cache?.adapter.set(cacheKey, storeState);
			}
		});
	}

	get $state(): InferedState {
		return this.state.value;
	}

	set $state(_v) {
		throw new Error('You cannot set the value of a store directly');
	}
}

export function storeSetter<T extends CoreState>(storeName: string, storeState: T) {
	const store = _storesMap.get(storeName);
	if (store !== undefined) {
		_storesMap.get(storeName)!.value = storeState;
		if (store.hasCache === true) {
			handleCacheOfStore(storeName, storeState);
		}
	}
}
