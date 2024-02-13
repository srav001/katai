import { get, set, del } from 'idb-keyval/dist/index.js';

async function getFromCache<T>(key: string) {
	return JSON.parse((await get(key)) ?? '{}') as T | undefined;
}

function setToCache<T>(key: string, value: T) {
	set(key, JSON.stringify(value));
}

function deleteFromCache(key: string) {
	del(key);
}

export const idbConfig = {
	getFromCache,
	setToCache,
	deleteFromCache
};
