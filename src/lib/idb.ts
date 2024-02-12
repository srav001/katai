import { get } from 'idb-keyval/dist/index.js';

async function getFromCache<T>(key: string) {
	return await get<T>(key);
}
function setToCache<T>(key: string, value: T) {
	setToCache(key, value);
}

export const idbConfig = {
	getFromCache,
	setToCache
};
