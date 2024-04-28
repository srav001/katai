/* eslint-disable @typescript-eslint/ban-types */
import { handleCacheOfStore } from '$lib/store/cache.js';
import type { StoreOptions } from '$lib/store/core.svelte.js';
import { createStore } from '$lib/store/core.svelte.js';
import { onDestroy } from 'svelte';
import type {
	DeepReadonly,
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

type Subscriber<T = unknown, U = unknown> = (value: T, oldValue: U) => Promise<void> | void;
type SubscribersMap<T = unknown> = Map<string, Set<Subscriber<T>>>;
const _subscribersMap: SubscribersMap = new Map();

/**
 * It takes a key and data, and if there are any subscribers for that key, it executes them with the
 * data
 * @param {string} key - The key that the subscriber is listening to.
 * @param {unknown} [data] - the data that is passed to the subscriber
 */
function runSubscribers(key: string, data: unknown, oldData: unknown, state: Record<string, any>) {
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
			subDataList.push([existingkey, getNestedValue(state, deepKey), oldData]);
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
			subscriber(state, unstate(state));
		}
	}
}

type StoreKeyForStoreInstance<T, U = string> = T extends undefined ? U : (PathInto<T> | keyof T) & U;

type StoreKeyForSubs<T, U = string> = T extends undefined
	? U
	: // @ts-expect-error - ts does not need to worry here
		(PathIntoDeep<T> | keyof T | `${keyof T}.*`) & U;

type GetStoreValueIfNotEmpty<State, Key, T> = State extends undefined
	? T
	: Key extends ''
		? State
		: Key extends `${infer MainKey}.*`
			? GetDeepValue<State, MainKey>
			: GetDeepValue<State, Key>;

function storeInstance<InferedState extends Record<string, any>>(
	state: InferedState,
	storeName: string,
	options?: StoreOptions
) {
	const primitiveStore = createStore(storeName, state, options);

	const storeObj = {
		get $value() {
			return primitiveStore.value;
		},
		get,
		set,
		update,
		next,
		subscribe,
		unsubscribe,
		removeSubscribers,
		clearCache
	};

	function getKey(key?: string) {
		if (!key) {
			return '';
		}

		return key;
	}

	function get<T extends StoreKeyForStoreInstance<InferedState> | undefined = undefined, U = unknown>(
		key?: T
	): T extends undefined ? DeepReadonly<InferedState> : DeepReadonly<GetStoreValueIfNotEmpty<InferedState, T, U>> {
		if (key === '' || key === undefined) {
			return primitiveStore.value as any;
		}

		return getNestedValue(primitiveStore.value, getKey(key)) as any;
	}

	function update<
		U extends StoreKeyForStoreInstance<InferedState> | '',
		K = unknown,
		// @ts-expect-error better to keep optional second in this case
		T extends GetStoreValueIfNotEmpty<InferedState, U, K>
	>(key: U, mutator: (state: T) => T) {
		key = getKey(key) as U;
		let newState = getNestedValue(primitiveStore.value, key);
		const _oldData = $state.snapshot(newState);
		newState = mutator(newState as T);

		setNestedValue(primitiveStore.value, key, newState);
		runSubscribers(key, newState, _oldData, primitiveStore.value);
		handleCacheOfStore(storeName, state);

		return storeObj;
	}

	function has<U extends StoreKeyForStoreInstance<InferedState>>(key: U) {
		key = getKey(key) as U;

		return getNestedValue(primitiveStore.value, key) !== undefined;
	}

	// @ts-expect-error better to keep optional second in this case
	function next<T = unknown, U extends StoreKeyForStoreInstance<InferedState>>(
		callback: (state: T) => void,
		key?: U
	) {
		let data = primitiveStore.value;
		if (key) {
			data = getNestedValue(primitiveStore.value, key) as InferedState;
		}
		callback(deepCloneDbValue(data) as any);

		return storeObj;
	}

	function subscribe<U extends StoreKeyForSubs<InferedState>, T = undefined>(
		key: U | '',
		subscriber: Subscriber<
			GetStoreValueIfNotEmpty<InferedState, U, T>,
			GetStoreValueIfNotEmpty<InferedState, U, T>
		>,
		immediate = false
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

		if (immediate) {
			subscriber(get(key as StoreKeyForStoreInstance<InferedState>) as any, undefined as any);
		}

		try {
			onDestroy(unsubscribe.bind(null, key, subscriber as any));
		} catch (err) {
			console.log(err);
		}

		return storeObj;
	}

	function unsubscribe<U extends StoreKeyForSubs<InferedState>, T = undefined>(
		key: U | '',
		subscriber: Subscriber<GetStoreValueIfNotEmpty<InferedState, U, T>, GetStoreValueIfNotEmpty<InferedState, U, T>>
	): typeof storeObj {
		key = getKey(key) as U;
		if (_subscribersMap.has(key as string)) {
			// @ts-expect-error - we know that the _key exists
			_subscribersMap.get(key).delete(subscriber);
		}

		return storeObj;
	}

	function removeSubscribers<T extends StoreKeyForSubs<InferedState>>(key?: T): typeof storeObj {
		key = getKey(key) as T;
		_subscribersMap.delete(key);

		return storeObj;
	}

	function set<
		U extends StoreKeyForStoreInstance<InferedState>,
		K = unknown,
		// @ts-expect-error optional can be second
		T extends GetStoreValueIfNotEmpty<InferedState, U, K>
	>(key: U, value: T): typeof storeObj {
		if (has(key)) {
			update(key, () => value as GetStoreValueIfNotEmpty<InferedState, U, TypesOfState>);
		} else {
			throw new Error(`Key ${key} does not exist`);
		}

		return storeObj;
	}

	function clearCache() {
		clearCache;
	}

	return storeObj;
}

/**
 * The createStore function is used to create a store.
 * It returns an object with several functions to interact with the store's state,
 * including get, update, set, next, and has.
 */
export function createVirtualStore<T extends Record<string, any>>(
	store: T,
	storeName = Math.random().toString(36).substring(2, 15),
	options?: StoreOptions
) {
	return storeInstance(store, storeName, options);
}
