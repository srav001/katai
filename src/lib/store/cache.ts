const CACHE_KEY = 'katai-';
export type CacheOptons = {
	adapter: {
		getFromCache: <U>(key: string, decoder?: (val: string) => any) => Promise<U | undefined>;
		setToCache: (key: string, data: any, encoder?: (val: any) => string) => void;
		deleteFromCache: (key: string) => void;
	};
	key?: string;
};

// eslint-disable-next-line sonarjs/no-unused-collection
const _cachedStoresMap = new Map<string, CacheOptons>();

export function getCachedStoresMap() {
	return _cachedStoresMap;
}

export function getCacheKey(storeName: string) {
	if (_cachedStoresMap.has(storeName)) {
		return `${CACHE_KEY}-${storeName}-${_cachedStoresMap.get(storeName)!.key}`;
	}
	return undefined;
}

export function handleCacheOfStore<T>(storeName: string, state: T) {
	if (_cachedStoresMap.has(storeName)) {
		const cacheAdapter = _cachedStoresMap.get(storeName)!.adapter;
		cacheAdapter.setToCache(getCacheKey(storeName)!, state);
	}
}
