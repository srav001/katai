import { createStore, type StoreOptions } from '../store/core.svelte.js';
import { clearCache, get, subscribe, update } from '../store/primitives.svelte.js';

// BASED BY SVELTE WRITABLE STORE

/**
 * The `createWritable` function creates a writable store with initial value and provides
 * methods for getting, setting, updating, subscribing to changes, and clearing cache.
 * @param {T} initalValue - The `initalValue` parameter is the initial value that will be stored in the
 * writable store. It should be an object of type `T`, which extends `Record<string, any>`. This
 * initial value will be used as the starting value for the store.
 * @param storeName - The `storeName` parameter is a string that represents the name of the store where
 * the data will be stored. If no `storeName` is provided, a random string will be generated for the
 * store name.
 * @param {StoreOptions} [storeOptions] - The `storeOptions` parameter in the `createWritable` function
 * is an optional parameter that allows you to specify additional options for the store creation. These
 * options can include configuration settings or options specific to the underlying store
 * implementation. If provided, these options will be used when creating the store using the `create
 * @returns An object is being returned with the following properties:
 * - get: a function that retrieves the current value from the store
 * - set: a function that updates the value in the store
 * - update: a function that takes a callback to update the value in the store
 * - subscribe: a function that subscribes to changes in the store and calls a subscriber function
 * - clearCache: a function that
 */
export function createWritable<T extends Record<string, any>>(
	initalValue: T,
	storeName = Math.random().toString(36).substring(2, 15),
	storeOptions?: StoreOptions
) {
	const store = createStore(storeName, initalValue, storeOptions);

	const updater = update(store, (state, val: T) => {
		state = val;
	});
	return {
		get: get(store, () => store.value),
		set: updater,
		update: (callback: (val: T) => T) => {
			updater(callback(store.value));
		},
		subscribe: (subscriber: (val: T) => void) =>
			subscribe(store, [() => store.value], ([state]) => subscriber(state)),
		clearCache: () => clearCache(storeName)
	};
}
