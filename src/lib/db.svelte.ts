/* eslint-disable @typescript-eslint/ban-types */
import { getFromCache, setToCache } from './cache-adapter.js';
import { deepClone, get, set, dynamicallyExecuteFunction } from './utilites.js';
import type {
	GenericArray,
	GenericObject,
	GetDeepValue,
	PathInto,
	PathIntoDeep,
	Prettier,
	PrimitiveTypes
} from '../types/utilities.ts';

export type TypesOfState = Record<string, PrimitiveTypes | GenericArray | GenericObject>;
export type BasicTable<T = TypesOfState> = {
	name: string;
	state: T;
	useCache?: boolean;
};

function deepCloneDbValue<InferredType>(val: InferredType): InferredType {
	if (val === undefined) {
		return val;
	}

	return deepClone(val);
}

const CACHE_KEY = 'cache-db';

// eslint-disable-next-line sonarjs/no-unused-collection
const _cachedTables = new Map([['all', false]]);

const _stores: Record<string, unknown> = $state({});

/**
 * It creates a Pinia store for the table and caches the table's state if the table is marked as
 * cacheable
 * @param {T} table - T extends BasicTable - This is the table that we're creating a store for.
 * @returns A function that takes a table and returns a table.
 */
function createState<T extends BasicTable>(table: T) {
	if (table.useCache) {
		_cachedTables.set(table.name, true);
		const cachedData = getFromCache(table.name);
		if (cachedData) {
			_stores[table.name] = cachedData;

			return table;
		}
		setToCache(table.name, table.state);
	}
	_stores[table.name] = table.state;

	return table;
}

type Subscriber<T = unknown, U = unknown> = (value: T, oldValue: U) => Promise<void> | void;
type SubscribersMap<T = unknown> = Map<string, Set<Subscriber<T>>>;
const _subscribersMap: SubscribersMap = new Map();

function runCommonSubscribers() {
	_subscribersMap.get('')?.forEach((subscriber) => {
		dynamicallyExecuteFunction(subscriber, _stores);
	});
}

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
			subDataList.push([existingkey, get(_stores, deepKey), oldData]);
		}
	}

	for (const subData of subDataList) {
		_subscribersMap.get(subData[0])?.forEach((subscriber) => {
			dynamicallyExecuteFunction(subscriber, subData[1], subData[2]);
		});
	}

	runCommonSubscribers();
}

/**
 * If the table is cached, then set the state to the cache
 * @param {string} key - The key of the store that was updated.
 */
function handleCacheOfStore(key: string) {
	const tableName = key.split('.')[0];

	if (_cachedTables.get('all') || _cachedTables.get(tableName)) {
		const storeName = tableName;
		const state = _stores[storeName];
		setToCache(storeName, state);
	}
}

type NewTable<T> = Prettier<BasicTable<T>>;

type StoreOptions<T = unknown> = {
	useCache?: boolean;
	table?: NewTable<T>;
	host?: boolean;
} & {};

type DbKeyForDbWithTableInstance<T, U = string> = T extends undefined
	? U
	: (PathInto<T> | keyof T) & U;

type DbKeyForSubs<T, U = string> = T extends undefined
	? U
	: (PathIntoDeep<T> | keyof T | `${keyof T}.*`) & U;

type GetDbValueIfNotEmpty<State, Key, T> = State extends undefined
	? T
	: Key extends `${infer MainKey}.*`
		? GetDeepValue<State, MainKey>
		: GetDeepValue<State, Key>;

type TableKey<State, K = string> = State extends undefined ? K : keyof State;

function getClonedValue(data: unknown) {
	const val = deepCloneDbValue(data);
	this.flush();
	return val;
}

function writeClonedValue(key: string, data: any, oldData: any, callback?: (data: any) => void) {
	set(_stores, key, data);
	if (callback) {
		callback(deepCloneDbValue(data));
	}
	handleCacheOfStore(key);
	runSubscribers(key, data, oldData);
	this.flush();
}

class Store<InferedState = undefined> {
	#host = false;
	#key = '' as string;
	#oldData = undefined as InferedState | undefined;
	#data = undefined as InferedState | undefined;

	constructor(table?: NewTable<InferedState>, mainTable?: string) {
		if (table) {
			createState(table as BasicTable);
		}
		if (mainTable) {
			if (!_stores[mainTable]) {
				throw new Error(`Store ${mainTable} does not exist`);
			}
			this.#host = true;
			this.#key = mainTable;
		}
	}

	flush() {
		if (!this.#host) {
			this.#key = '';
		}
		this.#data = undefined;
		this.#oldData = undefined;
	}

	get $value() {
		if (this.#key) {
			return _stores[this.#key] as InferedState;
		}

		return _stores as InferedState;
	}

	getKey(key?: string) {
		if (!key) {
			return this.#key;
		}
		if (this.#host) {
			return `${this.#key}.${key}`;
		}

		return key;
	}

	get<T extends DbKeyForDbWithTableInstance<InferedState>>(key: T, defaultValue?: unknown) {
		this.#data = (get(_stores, this.getKey(key)) ?? defaultValue ?? undefined) as InferedState;

		return {
			value: getClonedValue.bind(this, this.#data) as <K = unknown>() => GetDbValueIfNotEmpty<
				InferedState,
				T,
				K
			>
		};
	}

	getValue<T extends DbKeyForDbWithTableInstance<InferedState>, U = unknown>(key?: T) {
		return get(_stores, this.getKey(key)) as GetDbValueIfNotEmpty<InferedState, T, U>;
	}
	update<
		U extends DbKeyForDbWithTableInstance<InferedState>,
		K = unknown,
		// @ts-expect-error better to keep optional second in this case
		T extends GetDbValueIfNotEmpty<InferedState, U, K>
	>(key: U, callback: (data: T) => T) {
		key = this.getKey(key) as U;
		const oldData = get(_stores, key);
		const data = callback(deepCloneDbValue(this.#oldData) as T) as undefined;
		const self = this;

		return {
			write: function (callback?: (data: T) => void) {
				writeClonedValue.call(self, key, data, oldData, callback);
			}
		};
	}

	writeUpdate<
		U extends DbKeyForDbWithTableInstance<InferedState>,
		K = unknown,
		// @ts-expect-error better to keep optional second in this case
		T extends GetDbValueIfNotEmpty<InferedState, U, K>
	>(key: U, callback: (data: T) => T) {
		key = this.getKey(key) as U;
		this.#oldData = get(_stores, key);
		const data = callback(this.#oldData as T);

		set(_stores, key, data);
		handleCacheOfStore(key);
		runSubscribers(key, data, this.#oldData);
		this.flush();

		return this;
	}

	has<U extends DbKeyForDbWithTableInstance<InferedState>>(key: U) {
		key = this.getKey(key) as U;

		return get(_stores, key) !== undefined;
	}
	// @ts-expect-error better to keep optional second in this case
	next<T = unknown, U extends DbKeyForDbWithTableInstance<InferedState>>(
		callback: (data: T) => void,
		key?: U
	) {
		let data = _stores;
		if (key) {
			data = get(_stores, key);
		}
		callback(deepCloneDbValue(data) as T);

		return this;
	}

	addSubscriber<U extends DbKeyForSubs<InferedState>, T = undefined>(
		key: U | '',
		subscriber: Subscriber<
			GetDbValueIfNotEmpty<InferedState, U, T>,
			GetDbValueIfNotEmpty<InferedState, U, T>
		>
	): this {
		key = this.getKey(key) as U;
		if (!_subscribersMap.has(key as string)) {
			(_subscribersMap as SubscribersMap<typeof subscriber>).set(
				key as string,
				new Set() as Set<Subscriber<typeof subscriber>>
			);
		}

		(_subscribersMap as SubscribersMap<typeof subscriber>)
			.get(key as string)!
			.add(subscriber as Subscriber<typeof subscriber>);

		return this;
	}
	removeSubscriber<U extends DbKeyForSubs<InferedState>, T = undefined>(
		key: U | '',
		subscriber: Subscriber<
			GetDbValueIfNotEmpty<InferedState, U, T>,
			GetDbValueIfNotEmpty<InferedState, U, T>
		>
	): this {
		key = this.getKey(key) as U;
		if (_subscribersMap.has(key as string)) {
			// @ts-expect-error - we know that the #key exists
			_subscribersMap.get(key).delete(subscriber);
		}

		return this;
	}
	unSubscribe<T extends DbKeyForSubs<InferedState>>(key?: T): this {
		key = this.getKey(key) as T;
		_subscribersMap.delete(key);

		return this;
	}
	clearSubscribers(): this {
		_subscribersMap.clear();

		return this;
	}
	set<
		U extends DbKeyForDbWithTableInstance<InferedState>,
		K = unknown,
		// @ts-expect-error optional can be second
		T extends GetDbValueIfNotEmpty<InferedState, U, K>
	>(key: U, value: T) {
		key = this.getKey(key) as U;
		if (this.has(key)) {
			if (_stores[key]) {
				// _stores
				// 	.get(key)?.()
				// 	.$patch(value as {});

				runSubscribers(key, value, this.#oldData);
			} else {
				this.writeUpdate(key, () => value as GetDbValueIfNotEmpty<InferedState, U, TypesOfState>);
			}

			return this;
		}

		const keys = key.split('.');
		let name = key;
		if (keys.length > 1) {
			name = keys[0] as U;
		}
		if (_stores[key]) {
			// _stores
			// 	.get(key)?.()
			// 	.$patch(value as {});
		} else {
			this.writeUpdate(key, () => value as GetDbValueIfNotEmpty<InferedState, U, TypesOfState>);
		}

		return this;
	}
	dropTable<K extends TableKey<InferedState, string>>(tableKey?: K) {
		if (!_stores[tableKey as string]) {
			return;
		}
		//@ts-expect-error not an error
		tableKey = this.getKey(tableKey);
		for (const [key] of _subscribersMap) {
			if (key.indexOf(tableKey) === 0) {
				_subscribersMap.delete(key);
			}
		}
		_subscribersMap.delete(`${tableKey as string}.*`);

		delete _stores[tableKey as string];
	}
}

type DbInstanceType<T> = InstanceType<typeof Store<T>>;
export type StoreInstance<T = undefined> = DbInstanceType<T>;

/**
 * It checks if there's a cache, if there is, it updates the state of the stores with the cached data,
 * if there isn't, it caches the current state of the stores
 */
function handleCache() {
	_cachedTables.set('all', true);
	const stores = getFromCache<TypesOfState>(CACHE_KEY);
	if (stores) {
		const dbInstance = new Store();
		Object.keys(stores).forEach(function (storeName: string) {
			dbInstance.writeUpdate(storeName, function (data: unknown) {
				data = stores[storeName];

				return data;
			});
		});
	} else {
		// _stores.forEach(function (store, storeName) {
		// 	const storeInstance = store();
		// 	setToCache(storeInstance.$state, storeName);
		// });
	}
}

/**
 * The useDb function is used to read and write data to the state of a Pinia store.
 * It returns an object with several functions to interact with the store's state,
 * including get, update, write, writeUpdate, next, and has.
 * These functions can be used to read data fromthe store,
 *  update the store's data, write new data to the store, and subscribe to changes in the store's data.
 */
export function createStore<T, K extends string | undefined = undefined>(
	table: NewTable<T>,
	mainTableKey?: K
) {
	return new Store(table, mainTableKey);
}

type Tables<T> = T & Array<BasicTable>;

type UseStoreOptions = Omit<StoreOptions, 'table' | 'host'>;
/**
 * It creates a store for each table and a state to store map for each table
 * @param tables - An array of tables that you want to create.
 * @param [useCache=false] - If true, the cache will be used to store the data.
 */
export function createStores<T, S = unknown>(
	tables: Tables<S>,
	options?: UseStoreOptions
): StoreInstance<T>;
export function createStores<T>(tables?: Tables<T>, options?: UseStoreOptions): StoreInstance<T> {
	if (tables && tables.length > 0) {
		for (const table of tables) {
			createState(table as BasicTable);
		}
		if (options?.useCache) {
			handleCache();
		}
	}
	return new Store<T>();
}

/**
 * The useDb function is used to read and write data to the state of a Pinia store.
 * It returns an object with several functions to interact with the store's state,
 * including get, update, write, writeUpdate, next, and has.
 * These functions can be used to read data fromthe store,
 *  update the store's data, write new data to the store, and subscribe to changes in the store's data.
 */
export function useStore<T>(stroreName: string): StoreInstance<T> {
	return new Store(undefined, stroreName);
}
