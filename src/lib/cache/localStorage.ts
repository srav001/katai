async function getFromCache<T>(key: string, decoder: (val: string) => any = JSON.parse) {
	const val = localStorage.getItem(key);
	return val ? (decoder(val) as T) : undefined;
}

function setToCache<T>(key: string, value: T, encoder: (val: any) => string = JSON.stringify) {
	localStorage.setItem(key, encoder(value as unknown));
}

function deleteFromCache(key: string) {
	localStorage.removeItem(key);
}

export const localStorageAdapter = {
	getFromCache,
	setToCache,
	deleteFromCache
};
