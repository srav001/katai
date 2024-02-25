/* eslint-disable @typescript-eslint/ban-types */
import { onDestroy } from 'svelte';
import type {
	GenericArray,
	GenericObject,
	GetDeepValue,
	PathInto,
	PathIntoDeep,
	PrimitiveTypes
} from '../types/utilities.js';
import { deepClone, get as getNestedValue, set as setNestedValue } from '../utils/index.js';

export type TypesOfState = Record<string, PrimitiveTypes | GenericArray | GenericObject>;
export type BasicStore<T = TypesOfState> = {
	name: string;
	state: T;
};

function deepCloneDbValue<InferredType>(val: InferredType): InferredType {
	if (val === undefined) {
		return val;
	}

	return deepClone(val);
}

const CACHE_KEY = 'katai-';
type CacheOptons = {
	key?: string;
	adapter: {
		getFromCache: <U>(key: string) => Promise<U | undefined>;
		setToCache: (key: string, data: any) => void;
		deleteFromCache: (key: string) => void;
	};
};
// eslint-disable-next-line sonarjs/no-unused-collection
const _cachedStoresMap = new Map<string, CacheOptons>();
function getCacheKey(storeName: string) {
	if (_cachedStoresMap.has(storeName)) {
		return `${CACHE_KEY}-${storeName}-${_cachedStoresMap.get(storeName)!.key}`;
	}
	return undefined;
}

const _stores: Record<string, unknown> = $state({});

/**
 * It creates a store for the store and caches the store's state if the store is marked as
 * cacheable
 * @param {T} store - T extends BasicStore - This is the store that we're creating a store for.
 * @returns A function that takes a store and returns a store.
 */
function createState<T extends BasicStore>(store: T, options?: StoreOptions) {
	_stores[store.name] = store.state;
	if (options?.cache?.adapter) {
		if (!options?.cache?.key) {
			options.cache.key = store.name;
		}
		_cachedStoresMap.set(store.name, options.cache);

		options.cache.adapter.getFromCache(getCacheKey(store.name)!).then((data) => {
			if (
				data &&
				typeof data === 'object' &&
				((!Array.isArray(data) && Object.keys(data).length > 0) || (Array.isArray(data) && data.length > 0))
			) {
				_stores[store.name] = data;
			} else {
				options.cache?.adapter.setToCache(getCacheKey(store.name)!, store.state);
			}
		});
	} else if (options?.cache?.key && !options?.cache?.adapter) {
		throw new Error(`Cache adapter is not provided for ${store.name} Store`);
	}

	return store;
}

type Subscriber<T = unknown, U = unknown> = (value: T, oldValue: U) => Promise<void> | void;
type SubscribersMap<T = unknown> = Map<string, Set<Subscriber<T>>>;
const _subscribersMap: SubscribersMap = new Map();

/**
 * It takes a key and data, and if there are any subscribers for that key, it executes them with the
 * data
 * @param {string} key - The key that the subscriber is listening to.
 * @param {unknown} [data] - the data that is passed to the subscriber
 */
function runSubscribers(key: string, data: unknown, oldData: unknown) {
	const subDataList: [string, unknown, unknown][] = [];

	for (const existingkey of _subscribersMap.keys()) {
		// add key if it has subscribers
		if (existingkey === key) {
			subDataList.push([key, data, oldData]);
			continue;
		}
		// For deep keys
		const deepKey = existingkey.split('.*')[0];
		if (key.indexOf(deepKey) === 0) {
			subDataList.push([existingkey, getNestedValue(_stores, deepKey), oldData]);
		}
	}

	for (const subData of subDataList) {
		for (const subscriber of _subscribersMap.get(subData[0])!) {
			subscriber(subData[1], subData[2]);
		}
	}

	// Run common subscribers
	if (_subscribersMap.has('')) {
		for (const subscriber of _subscribersMap.get('')!) {
			subscriber(_stores, _stores);
		}
	}
}

/**
 * If the store is cached, then set the state to the cache
 * @param {string} key - The key of the store that was updated.
 */
function handleCacheOfStore(key: string) {
	const storeName = key.split('.')[0];

	if (_cachedStoresMap.has(storeName)) {
		const cacheAdapter = _cachedStoresMap.get(storeName)!.adapter;
		cacheAdapter.setToCache(getCacheKey(storeName)!, _stores[storeName]);
	}
}

type StoreOptions<T = unknown> = {
	cache?: CacheOptons;
};

type DbKeyForDbWithStoreInstance<T, U = string> = T extends undefined ? U : (PathInto<T> | keyof T) & U;

type DbKeyForSubs<T, U = string> = T extends undefined
	? U
	: // @ts-expect-error - ts does not need to worry here
		(PathIntoDeep<T> | keyof T | `${keyof T}.*`) & U;

type GetDbValueIfNotEmpty<State, Key, T> = State extends undefined
	? T
	: Key extends `${infer MainKey}.*`
		? GetDeepValue<State, MainKey>
		: GetDeepValue<State, Key>;

type StoreKey<State, K = string> = State extends undefined ? K : keyof State;

function storeInstance<InferedState = undefined>(
	store?: BasicStore<InferedState>,
	mainStore?: string,
	options?: StoreOptions
) {
	let _host = false;
	let _key = '' as string;
	let _oldData = undefined as InferedState | undefined;

	if (store) {
		createState(store as BasicStore, options);
		if (store.name) {
			mainStore = store.name;
		}
	}
	if (mainStore) {
		if (!_stores[mainStore] && !store) {
			throw new Error(`Store ${mainStore} does not exist`);
		}
		_host = true;
		_key = mainStore;
	}

	const storeObj = {
		get $value() {
			if (_key) {
				return _stores[_key] as InferedState;
			}

			return _stores as InferedState;
		},
		get,
		set,
		update,
		next,
		subscribe,
		unsubscribe,
		removeSubscribers,
		clearCache,
		dropStore
	};

	function flush() {
		if (!_host) {
			_key = '';
		}
		_oldData = undefined;
	}

	function getKey(key?: string) {
		if (!key) {
			return _key;
		}
		if (_host && key.indexOf(_key) !== 0) {
			return `${_key}.${key}`;
		}

		return key;
	}

	function get<T extends DbKeyForDbWithStoreInstance<InferedState>, U = unknown>(key?: T) {
		return getNestedValue(_stores, getKey(key)) as GetDbValueIfNotEmpty<InferedState, T, U>;
	}

	function update<
		U extends DbKeyForDbWithStoreInstance<InferedState>,
		K = unknown,
		// @ts-expect-error better to keep optional second in this case
		T extends GetDbValueIfNotEmpty<InferedState, U, K>
	>(key: U, callback: (data: T) => T) {
		key = getKey(key) as U;
		_oldData = getNestedValue(_stores, key);
		const data = callback(_oldData as T);

		setNestedValue(_stores, key, data);
		handleCacheOfStore(key);
		runSubscribers(key, data, _oldData);
		flush();

		return storeObj;
	}

	function has<U extends DbKeyForDbWithStoreInstance<InferedState>>(key: U) {
		key = getKey(key) as U;

		return getNestedValue(_stores, key) !== undefined;
	}

	// @ts-expect-error better to keep optional second in this case
	function next<T = unknown, U extends DbKeyForDbWithStoreInstance<InferedState>>(
		callback: (data: T) => void,
		key?: U
	) {
		let data = _stores;
		if (key) {
			data = getNestedValue(_stores, key);
		}
		callback(deepCloneDbValue(data) as T);

		return storeObj;
	}

	function subscribe<U extends DbKeyForSubs<InferedState>, T = undefined>(
		key: U | '',
		subscriber: Subscriber<GetDbValueIfNotEmpty<InferedState, U, T>, GetDbValueIfNotEmpty<InferedState, U, T>>
	): typeof storeObj {
		key = getKey(key) as U;
		if (!_subscribersMap.has(key as string)) {
			(_subscribersMap as SubscribersMap<typeof subscriber>).set(
				key as string,
				new Set() as Set<Subscriber<typeof subscriber>>
			);
		}

		(_subscribersMap as SubscribersMap<typeof subscriber>)
			.get(key as string)!
			.add(subscriber as Subscriber<typeof subscriber>);

		// @ts-expect-error - we know that the _key exists
		subscriber(getValue(key), undefined);

		try {
			// @ts-expect-error - TODO: find how to type this
			onDestroy(removeSubscriber.bind(this, key, subscriber as any));
		} catch (err) {
			console.log(err);
		}

		return storeObj;
	}

	function unsubscribe<U extends DbKeyForSubs<InferedState>, T = undefined>(
		key: U | '',
		subscriber: Subscriber<GetDbValueIfNotEmpty<InferedState, U, T>, GetDbValueIfNotEmpty<InferedState, U, T>>
	): typeof storeObj {
		key = getKey(key) as U;
		if (_subscribersMap.has(key as string)) {
			// @ts-expect-error - we know that the _key exists
			_subscribersMap.get(key).delete(subscriber);
		}

		return storeObj;
	}

	function removeSubscribers<T extends DbKeyForSubs<InferedState>>(key?: T): typeof storeObj {
		key = getKey(key) as T;
		_subscribersMap.delete(key);

		return storeObj;
	}

	function set<
		U extends DbKeyForDbWithStoreInstance<InferedState>,
		K = unknown,
		// @ts-expect-error optional can be second
		T extends GetDbValueIfNotEmpty<InferedState, U, K>
	>(key: U, value: T): typeof storeObj {
		if (has(key)) {
			update(key, () => value as GetDbValueIfNotEmpty<InferedState, U, TypesOfState>);
		} else {
			throw new Error(`Key ${key} does not exist`);
		}

		return storeObj;
	}

	function clearCache() {
		const storeKey = getKey();
		if (_cachedStoresMap.has(storeKey)) {
			_cachedStoresMap.get(storeKey)?.adapter.deleteFromCache(getCacheKey(storeKey)!);
		}
	}

	function dropStore() {
		const storeKey = getKey();
		for (const [key] of _subscribersMap) {
			if (key.indexOf(storeKey) === 0) {
				_subscribersMap.delete(key);
			}
		}
		_cachedStoresMap.get(storeKey)?.adapter.deleteFromCache(getCacheKey(storeKey)!);
		_cachedStoresMap.delete(storeKey as string);

		delete _stores[storeKey as string];
	}

	return storeObj;
}

export type StoreInstance<T = undefined> = ReturnType<typeof storeInstance<T>>;

/**
 * The createStore function is used to create a store.
 * It returns an object with several functions to interact with the store's state,
 * including get, update, write, writeUpdate, next, and has.
 */
export function createStore<T>(store: BasicStore<T>, options?: StoreOptions) {
	return storeInstance(store, undefined, options);
}

/**
 * The useStore function is used to read and write data to the state of a store.
 * It returns an object with several functions to interact with the store's state,
 * including get, update, write, writeUpdate, next, and has.
 */
export function useStore<T extends BasicStore<Record<string, unknown>>>(storeName: string) {
	return storeInstance<T['state']>(undefined, storeName);
}