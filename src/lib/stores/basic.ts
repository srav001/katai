import type { StoreSettings } from '$lib/store/core.svelte.js';
import {
	clearCache,
	computed,
	get,
	update,
	watch,
	type MapSources,
	type Watchers
} from '$lib/store/primitives.svelte.js';
import type { DeepReadonly } from '$lib/types/utilities.js';
import { onDestroy } from 'svelte';
import { createStorePrimitive, storeSetter } from '../store/core.svelte.js';

export type State = Record<string | number, any>;

type Action<T> = (state: T, ...args: any[]) => void;
export type Actions<T> = Record<string, Action<T>>;

type Getter<T> = (state: T, ...args: any[]) => any;

export type Getters<T> = Record<string, Getter<T>>;

type GetValue<T> = (state: T) => any;
export type Computeds<T> = Record<string, GetValue<T>>;

type Query<T, U = any> = (...args: U[]) => Promise<T>;

type QueryOptions<T> = {
	fn?: Query<T>;
	loader?: Query<T>;
	onData?: <U>(val: U) => T;
};

export type StoreOptions<S extends State, G extends Getters<S>, A extends Actions<S>, C extends Computeds<S>> = {
	getters?: G;
	computeds?: C;
	actions?: A;
	query?: QueryOptions<S>;
};

export type StoreWithGettersAndActions<
	S extends State,
	G extends Getters<S>,
	A extends Actions<S>,
	C extends Computeds<S>
> = {
	[K in keyof G]: G[K] extends (state: any, ...args: infer Y) => infer R ? (...args: Y) => R : never;
} & {
	[K in keyof A]: A[K] extends (state: any, ...args: infer Y) => void ? (...args: Y) => void : never;
} & {
	[K in keyof C]: C[K] extends (state: any) => infer R
		? DeepReadonly<{
				$value: R;
			}>
		: never;
};

type BasicStore<
	S extends State,
	G extends Getters<S>,
	A extends Actions<S>,
	C extends Computeds<S>
> = StoreWithGettersAndActions<S, G, A, C> & {
	clearCache: () => void;
	$subscribe: <Sub extends Watchers<S>>(subscribers: Sub, effect: (states: MapSources<Sub, S>) => void) => () => void;
	$onData: <T>(data: T) => void;
};

/**
 * The function `createBasicStore` creates a basic store with state, getters, and actions based on the
 * provided options.
 * @param {string} storeName - The `storeName` parameter is a string that represents the name of the
 * store being created.
 * @param options - The `options` parameter in the `createBasicStore` function is an object that
 * contains the following properties:
 * @param {StoreSettings} [settings] - The `settings` parameter in the `createBasicStore` function is an
 * optional parameter of type `StoreOptions`. It allows you to provide additional settings or
 * configurations for the store creation process. These settings can include options such as the
 * store's persistence mechanism using cache adapters.
 * @returns The `createBasicStore` function returns an object of type `BasicStore<S, G, A>`, which
 * includes the state, getters, actions, and additional methods like `clearCache` and `subscribe`.
 */
export function createStore<
	S extends State,
	G extends Getters<S> = Getters<S>,
	A extends Actions<S> = Actions<S>,
	C extends Computeds<S> = Computeds<S>
>(storeName: string, state: S, options: StoreOptions<S, G, A, C>, settings?: StoreSettings): BasicStore<S, G, A, C> {
	const primitiveStore = createStorePrimitive(storeName, state, settings);

	const newStore = {} as any;

	if (options.getters !== undefined) {
		for (const key in options.getters) {
			newStore[key] = get(primitiveStore, options.getters![key]);
		}
	}
	if (options.computeds !== undefined) {
		for (const key in options.computeds) {
			newStore[key] = computed(primitiveStore, options.computeds![key]);
		}
	}
	if (options.actions !== undefined) {
		for (const key in options.actions) {
			newStore[key] = update(primitiveStore, options.actions[key]);
		}
	}

	newStore.clearCache = clearCache.bind(null, storeName);
	newStore.$subscribe = (subscribers: any, effect: (states: any) => () => void) =>
		watch(primitiveStore, subscribers, effect);

	newStore.$onData = () => {
		// noop
	};
	if (options.query) {
		if (Object.keys(options.query).length > 1) {
			throw new Error('Query options can only have one property');
		}
		if (options.query.loader) {
			options.query.loader().then((val) => {
				storeSetter(storeName, val);
			});
		} else if (options.query.onData) {
			newStore.$onData = <T = any>(data: T) => {
				const effectToDestroy = $effect.root(() => {
					$effect.pre(() => {
						if (data !== undefined) {
							storeSetter(storeName, options.query!.onData!(data));
						}
					});
				});

				try {
					onDestroy(effectToDestroy);
				} catch (err) {
					if (
						(err as any)?.message !==
						`lifecycle_outside_component
\`onDestroy(...)\` can only be used during component initialisation`
					) {
						throw err;
					}
				}

				return effectToDestroy;
			};
		}
	}

	return newStore;
}
