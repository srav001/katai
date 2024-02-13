async function getFromCache<T>(key: string) {
	const val = localStorage.getItem(key);
	return val ? (JSON.parse(val) as T) : undefined;
}

function setToCache<T>(key: string, value: T) {
	localStorage.setItem(key, JSON.stringify(value as unknown));
}

function deleteFromCache(key: string) {
	localStorage.removeItem(key);
}

export const localStorageConfig = {
	getFromCache,
	setToCache,
	deleteFromCache
};
