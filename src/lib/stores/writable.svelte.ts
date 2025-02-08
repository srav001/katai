import { PrimitiveStore, type StoreSettings } from '../store/core.svelte.js';
import { update, watch } from '../store/primitives.svelte.js';

/**
 * Based on the writable store from Svelte.
 * @param initalValue - The initial value that will be stored in the store.
 * @param storeName - Optional. If no `storeName` is provided, a random string will be generated for the
 * store name.
 * @param storeOptions - An optional parameter that allows you to specify additional options for the store creation.
 * These options can include configuration settings for cache and more.
 * @returns An object is being returned with the following properties:
 * - `get`: a function that retrieves the current value from the store
 * - `set`: a function that updates the value in the store
 * - `update`: a function that takes a callback to update the value in the store
 * - `subscribe`: a function that subscribes to changes in the store and calls a subscriber function
 */
export function createWritable<T>(initalValue: T, storeName = crypto.randomUUID(), storeOptions?: StoreSettings) {
	const store = new PrimitiveStore(storeName, { v: initalValue }, storeOptions);

	const updater = update(store, (state, val: T) => {
		state.v = val;
	});

	return {
		get: () => store.$state,
		set: updater,
		update(callback: (val: T) => T) {
			updater(callback(store.$state.v));
		},
		subscribe: (subscriber: (val: T) => void) =>
			watch(store, [() => $state.snapshot(store.$state.v) as T], ([s]) => subscriber(s))
	};
}
