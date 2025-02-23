import { PrimitiveStore, type StoreSettings } from '../store/core.svelte.js';
import { setter, watch } from '../store/primitives.svelte.js';

type StoreOptions = StoreSettings & {
	name: string;
};

export function createWritable<T>(inital: T, storeOptions?: StoreOptions) {
	if (!storeOptions) {
		storeOptions = {
			name: crypto.randomUUID()
		};
	} else if (!storeOptions.name) {
		storeOptions.name = crypto.randomUUID();
	}

	const store = new PrimitiveStore(storeOptions.name, { v: inital }, storeOptions);
	const updater = setter(store, (state, val: T) => {
		state.v = val;
	});

	return {
		set: updater,
		update(callback: (val: T) => T) {
			updater(callback(store.$state.v));
		},
		subscribe: (subscriber: (val: T) => void) =>
			watch(store, [() => $state.snapshot(store.$state.v) as T], ([s]) => subscriber(s)),
		/**
		 * We add a get method to retrive the value even outside Svelte components
		 */
		get: () => store.$state
	};
}
