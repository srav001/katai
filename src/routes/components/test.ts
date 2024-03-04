import { createStore } from '$lib/store/index.svelte.js';
import { get, subscribe, type MapSources, type Subcribers } from '$lib/store/primitives.svelte.js';

export const test = createStore('test', {
	counter: 0,
	count: 0
});

type StoreType = (typeof test)['value'];

export const testStore = {
	get $value() {
		return test.value;
	},
	get: <U extends unknown>(derivation: (val: StoreType) => U) => get(test.value, () => derivation(test.value)),
	subscribe: <T extends Subcribers<StoreType>>(states: [...T], effect: (states: MapSources<T, StoreType>) => void) =>
		subscribe(test.value, states, effect)
};
