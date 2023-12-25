import { get, set, wrapInTryCatch } from './utilites.js';

const baseCacheKey = 'cache';
type CachedData = {
	token: string;
	lastUpdated: number;
	value: Record<string, unknown> | unknown[];
};

/**
 * This function initializes a cache and checks if the cached data is valid, resetting it if necessary.
 * @returns The `initCache` function returns a function wrapped in a try-catch block.
 */
export function initCache() {}

/**
 * This function retrieves data from local storage cache based on a given key.
 * @param {string} [key] - The `key` parameter is an optional string that represents the specific key
 * of the cached data that needs to be retrieved. If it is not provided, the entire cached data object
 * will be returned.
 * @returns either `undefined` or the cached data as `expectedType`. If a `key` is provided, it returns
 * the value associated with that key from the cached data. If the key is not found, it returns
 * `undefined`.
 */
export function getFromCache<expectedType = undefined>(
	key = '',
	defaultValue?: expectedType
): expectedType | undefined {
	return wrapInTryCatch(function () {
		const cachedData = localStorage.getItem(baseCacheKey);
		if (!cachedData) {
			if (defaultValue) {
				return defaultValue;
			}
			return undefined;
		}
		if (key === '') {
			return (JSON.parse(cachedData) as { value: expectedType }).value;
		}
		const value = get<CachedData>(JSON.parse(cachedData) as CachedData, `value.${key}`);
		if (!value) {
			if (defaultValue) {
				return defaultValue;
			}
			return undefined;
		}

		return value as expectedType;
	});
}

/**
 * The function sets a value to the browser's local storage cache with an optional key.
 * @param {unknown} value - The data that needs to be cached. It can be of any type, including objects
 * and arrays.
 * @param {string} [key] - The `key` parameter is an optional string that represents the key under
 * which the `value` parameter will be stored in the cache. If `key` is not provided, the `value` will
 * be stored under the base cache key.
 * @returns a boolean value of `void`.
 */
export function setToCache(key = '', value: unknown): void {
	return wrapInTryCatch(function () {
		const data = JSON.parse(localStorage.getItem(baseCacheKey) ?? '{}') as {
			value: unknown | Record<string, unknown> | unknown[];
			lastUpdated: number;
		};
		if (key === '') {
			data.value = value;
		} else if (Array.isArray(data.value)) {
			data.value[key as unknown as number] = value;
		} else {
			set(data as CachedData, `value.${key}`, value);
		}

		data.lastUpdated = Date.now();
		localStorage.setItem(baseCacheKey, JSON.stringify(data));
	});
}
