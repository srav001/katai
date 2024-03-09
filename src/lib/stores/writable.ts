import { createStore, type StoreOptions } from '../store/core.svelte.js';
import { clearCache, subscribe, update } from '../store/primitives.svelte.js';

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
		get: () => store.value,
		set: updater,
		update: updater,
		subscribe: (subscriber: (val: T) => void) =>
			subscribe(store, [() => store.value], ([state]) => subscriber(state)),
		clearCache: () => clearCache(storeName)
	};
}
