import { createStore } from '$lib/index.js';
import { get, update } from '$lib/store/primitives.svelte.js';

type State = Record<string | number, any>;

type Getter<T> = (state: T) => any;
type Getters<T> = Record<string, Getter<T>>;

type Action<T> = (state: T, payload: any) => void;
type Actions<T> = Record<string, Action<T>>;

export type Store<S extends State, G extends Getters<S>, A extends Actions<S>> = {
	state: S;
	getters: G;
	actions: A;
};

type StoreReturnType<S extends State, G extends Getters<S>, A extends Actions<S>> = {
	[K in keyof G]: G[K] extends (state: any) => infer R ? () => R : never;
} & {
	[K in keyof A]: A[K] extends (state: any, payload: infer P) => void ? (payload: P) => void : never;
};

export function createBasicStore<S extends State, G extends Getters<S>, A extends Actions<S>>(
	storeName: string,
	options: Store<S, G, A>
): StoreReturnType<S, G, A> {
	const primitiveStore = createStore(storeName, options.state);
	const newStore = {} as any;
	for (const key in options.getters) {
		newStore[key] = get(primitiveStore.value, options.getters[key].bind(null, primitiveStore.value));
	}
	for (const key in options.actions) {
		newStore[key] = update(primitiveStore.value as any, options.actions[key]);
	}

	return newStore;
}
