import { PrimitiveStore } from '$lib/store/core.svelte.js';
import { computed, get, setter as s } from '$lib/store/primitives.svelte.js';
import type { CoreState } from '$lib/types/store.js';

export class SimpleStore<T extends CoreState> {
	$state: T;
	name: string;

	constructor(state: T, storeOptions?: { name: string }) {
		if (storeOptions?.name) {
			this.name = storeOptions.name;
		} else {
			this.name = crypto.randomUUID();
		}

		const store = new PrimitiveStore(this.name, state);
		this.$state = store.$state;
	}
}

export function getState<T extends CoreState, U, A>(store: SimpleStore<T>, getFn: (state: T, ...args: A[]) => U) {
	return get(store as unknown as PrimitiveStore<T>, getFn);
}

export function setState<T extends CoreState, Args = unknown>(
	store: SimpleStore<T>,
	setFn: (state: T, ...args: Args[]) => T
) {
	return s(store as unknown as PrimitiveStore<T>, setFn);
}

export function createDerived<T extends CoreState, U>(store: SimpleStore<T>, derivation: (state: T) => U) {
	return computed(store as unknown as PrimitiveStore<T>, derivation);
}
