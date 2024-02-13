import { del, get, set } from 'idb-keyval/dist/index.js';

async function getFromCache<T>(key: string) {
	return JSON.parse((await get(key)) ?? '{}') as T | undefined;
}

function setToCache<T>(key: string, value: T) {
	// We need to stringify the value because idb-keyval doesn't support proxies.
	set(key, JSON.stringify(value));
}

function deleteFromCache(key: string) {
	del(key);
}

export const idbAdapter = {
	getFromCache,
	setToCache,
	deleteFromCache
};
