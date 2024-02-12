import { get, set } from 'idb-keyval/dist/index.js';

async function getFromCache<T>(key: string) {
	return JSON.parse((await get(key)) ?? '{}') as T | undefined;
}
function setToCache<T>(key: string, value: T) {
	set(key, JSON.stringify(value));
}

export const idbConfig = {
	getFromCache,
	setToCache
};
