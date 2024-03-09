import { del, get, set } from 'idb-keyval/dist/index.js';

async function getFromCache<T>(key: string, decoder: (val: string) => any = JSON.parse) {
	return decoder((await get(key)) ?? '{}') as T | undefined;
}

function setToCache<T>(key: string, value: T, encoder: (val: any) => string = JSON.stringify) {
	// We need to stringify the value because idb-keyval doesn't support proxies.
	set(key, encoder(value));
}

function deleteFromCache(key: string) {
	del(key);
}

export const idbAdapter = {
	getFromCache,
	setToCache,
	deleteFromCache
};
