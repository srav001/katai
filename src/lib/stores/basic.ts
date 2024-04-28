import type { StoreOptions } from '$lib/store/core.svelte.js';
import { clearCache, get, subscribe, update, type MapSources, type Subscribers } from '$lib/store/primitives.svelte.js';
import { createStore } from '../store/core.svelte.js';

export type State = Record<string | number, any>;

type Getter<T> = (state: T) => any;
export type Getters<T> = Record<string, Getter<T>>;

type Action<T> = (state: T, payload: any) => void;
export type Actions<T> = Record<string, Action<T>>;

export type Store<S extends State, G extends Getters<S>, A extends Actions<S>> = {
	state: S;
	getters?: G;
	actions?: A;
};

export type StoreWithGettersAndActions<S extends State, G extends Getters<S>, A extends Actions<S>> = {
	[K in keyof G]: G[K] extends (state: any) => infer R ? () => R : never;
} & {
	[K in keyof A]: A[K] extends (state: any, payload: infer P) => void ? (payload: P) => void : never;
};

type BasicStore<S extends State, G extends Getters<S>, A extends Actions<S>> = StoreWithGettersAndActions<S, G, A> & {
	clearCache: () => void;
	subscribe: <Sub extends Subscribers<S>>(
		subscribers: Sub,
		effect: (states: MapSources<Sub, S>) => void
	) => () => void;
};

/**
 * The function `createBasicStore` creates a basic store with state, getters, and actions based on the
 * provided options.
 * @param {string} storeName - The `storeName` parameter is a string that represents the name of the
 * store being created.
 * @param options - The `options` parameter in the `createBasicStore` function is an object that
 * contains the following properties:
 * @param {StoreOptions} [settings] - The `settings` parameter in the `createBasicStore` function is an
 * optional parameter of type `StoreOptions`. It allows you to provide additional settings or
 * configurations for the store creation process. These settings can include options such as the
 * store's persistence mechanism using cache adapters.
 * @returns The `createBasicStore` function returns an object of type `BasicStore<S, G, A>`, which
 * includes the state, getters, actions, and additional methods like `clearCache` and `subscribe`.
 */
export function createBasicStore<S extends State, G extends Getters<S>, A extends Actions<S>>(
	storeName: string,
	options: Store<S, G, A>,
	settings?: StoreOptions
): BasicStore<S, G, A> {
	const primitiveStore = createStore(storeName, options.state, settings);
	const newStore = {} as any;
	if (options.getters !== undefined) {
		for (const key in options.getters) {
			newStore[key] = get(primitiveStore, () => options.getters![key](primitiveStore.value));
		}
	}
	for (const key in options.actions) {
		newStore[key] = update(primitiveStore, options.actions[key]);
	}

	newStore.clearCache = () => clearCache(storeName);
	newStore.subscribe = (subscribers: any, effect: (states: any) => () => void) =>
		subscribe(primitiveStore, subscribers, effect);

	return newStore;
}
