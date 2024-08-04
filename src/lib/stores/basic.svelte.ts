import type { StoreSettings } from '$lib/store/core.svelte.js';
import {
	clearCache,
	computed,
	exp_derived,
	get,
	update,
	watch,
	type MapSources,
	type Watchers
} from '$lib/store/primitives.svelte.js';
import type { CoreState } from '$lib/types/store.js';
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
	loader?: {
		fn: Query<T>;
		onInit?: boolean;
	};
	onData?: <U>(val: U) => T;
};

type Deriveds<T> = Record<string, GetValue<T>>;

export type StoreOptions<
	S extends State,
	G extends Getters<S>,
	A extends Actions<S>,
	C extends Computeds<S>,
	D extends Deriveds<S>
> = {
	getters?: G;
	computeds?: C;
	actions?: A;
	deriveds?: D;
	query?: QueryOptions<S>;
};

export type StoreWithGettersAndActions<
	S extends State,
	G extends Getters<S>,
	A extends Actions<S>,
	C extends Computeds<S>,
	D extends Deriveds<S>
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
} & {
	[K in keyof D]: D[K] extends (state: any) => infer R
		? DeepReadonly<{
				$value: R;
			}>
		: never;
};

type BasicStore<
	S extends State,
	G extends Getters<S>,
	A extends Actions<S>,
	C extends Computeds<S>,
	D extends Deriveds<S>
> = StoreWithGettersAndActions<S, G, A, C, D> & {
	$subscribe: <Sub extends Watchers<S>>(subscribers: Sub, effect: (states: MapSources<Sub, S>) => void) => () => void;
	$onData: <T>(data: T) => void;
	load?: <T>(...args: T[]) => Promise<void>;
	clearCache: () => void;
};

function handleIfQuery<T extends CoreState>(name: string, ns: any, qo: QueryOptions<T>) {
	if (Object.keys(qo).length > 1) {
		throw new Error('Query options can only have one property');
	}
	if (qo.loader) {
		if (qo.loader.onInit === true) {
			qo.loader.fn().then((val) => {
				storeSetter(name, val);
			});
		}
	} else if (qo.onData) {
		ns.$onData = <T = any>(data: T) => {
			const effectToDestroy = $effect.root(() => {
				$effect.pre(() => {
					if (data !== undefined) {
						storeSetter(name, qo!.onData!(data));
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
	G extends Getters<S>,
	A extends Actions<S>,
	C extends Computeds<S>,
	D extends Deriveds<S>
>(
	storeName: string,
	state: S,
	options: StoreOptions<S, G, A, C, D>,
	settings?: StoreSettings
): BasicStore<S, G, A, C, D> {
	const ps = createStorePrimitive(storeName, state, settings);

	const ns = {
		$onData() {
			// noop
		}
	} as any;

	if (options.getters !== undefined) {
		for (const key in options.getters) {
			ns[key] = get(ps, options.getters![key]);
		}
	}

	if (options.computeds !== undefined) {
		for (const key in options.computeds) {
			ns[key] = computed(ps, options.computeds![key]);
		}
	}
	if (options.actions !== undefined) {
		for (const key in options.actions) {
			ns[key] = update(ps, options.actions[key]);
		}
	}

	// This is experimental and will mostly be removed since it uses svelte internals and it is not recommended
	const deriveds = new WeakSet();
	if (options.deriveds !== undefined) {
		for (const key in options.deriveds) {
			const derived = exp_derived(ps, options.deriveds![key]);
			ns[key] = derived[0];
			deriveds.add(derived[1]);
		}
	}

	ns.clearCache = clearCache.bind(null, storeName);
	ns.$subscribe = (subscribers: any, effect: (states: any) => () => void) => watch(ps, subscribers, effect);

	if (options.query) {
		handleIfQuery(storeName, ns, options.query);
	}

	return ns;
}
