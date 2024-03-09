import { createStore } from '../store/index.svelte.js';
import { subscribe, update } from '../store/primitives.svelte.js';

export function createWritable<T extends Record<string, any>>(initalValue: T) {
	const store = createStore('res', initalValue);

	const updater = update(store, (state, val: T) => {
		state = val;
	});
	return {
		set: (val: T) => updater(val),
		update: updater,
		subscribe: (subscriber: (val: T) => void) =>
			subscribe(store, [() => store.value], ([state]) => subscriber(state))
	};
}
