import type { PrimitiveStore } from '$lib/store/core.svelte.js';
import type { CoreState } from '$lib/types/store.js';
import type { DeepReadonly } from '$lib/types/utilities.js';
import { onDestroy, untrack } from 'svelte';
import { getCachedStoresMap, getCacheKey, handleCacheOfStore } from './cache.svelte.js';

type Getter<T> = () => T;
/**
 * The `get` function takes a store and a derivation function, and returns a getter
 * function that applies the derivation function to the store's value.
 * @param store - `PrimitiveStore<T>` is a generic type representing a store that holds a value of type
 * `T`. It seems like the `store` parameter is expected to be an instance of this `PrimitiveStore`
 * type.
 * @param getFn - The `derivation` parameter is a function that takes the current state of type
 * `T` as input and returns a value of type `U`. It is used to derive a new value based on the current
 * state stored in the `PrimitiveStore`.
 * @returns A `Getter<U>` function is being returned. This function takes no arguments and returns a
 * value of type `U`. The value returned is the result of applying the `derivation` function to the
 * `store.value`.
 */
export function get<T extends CoreState, U, A>(
	store: PrimitiveStore<T>,
	getFn: (state: T, ...args: A[]) => U
): Getter<U> {
	return (...args: A[]) =>
		untrack(() => {
			const v = getFn(store.$state, ...args) as U;
			if (typeof v === 'object' && v !== null) {
				return $state.snapshot(v) as U;
			}
			return v;
		});
}

type Computed<T> = DeepReadonly<{
	$value: T;
}>;
/**
 * The `computed` function takes a store and a computation function, and returns a computed
 * value that is derived from the store's value.
 * @param store - `PrimitiveStore<T>` is a generic type representing a store that holds a value of type
 * `T`. It seems like the `store` parameter is expected to be an instance of this `PrimitiveStore`
 * type.
 * @param computation - The `computation` parameter is a function that takes the current state of type
 * `T` as input and returns a value of type `U`. It is used to derive a new value based on the current
 * state stored in the `PrimitiveStore`.
 * @returns A `Computed<U>` object is being returned. This object has a `get $value()` method that
 * returns the computed value. The `get $value()` method is a getter function that applies the
 * computation function to the store's value.
 */
export function computed<T extends CoreState, U>(store: PrimitiveStore<T>, computation: (state: T) => U): Computed<U> {
	// eslint-disable-next-line prefer-const
	let derive = $derived.by(() => computation(store.$state));

	return {
		get $value() {
			return derive as DeepReadonly<U>;
		}
	};
}

type Setter<T = undefined> = (...args: T[]) => void;
/**
 * The function `update` takes a store, a mutator function, and a payload, and updates the store's
 * value using the mutator function while handling caching if applicable.
 * @param store - The `store` parameter is a PrimitiveStore object that holds a value of type T.
 * @param mutator - The `mutator` parameter is a function that takes the current state of the store
 * (`T`) and a payload of type `C`, and returns a new state of type `U`. It is used to update the state
 * of the store based on the provided payload.
 * @returns The `update` function returns an `Updater` function that takes a value of type `C` as an
 * argument.
 */
export function setter<T extends CoreState, U, C = unknown>(
	store: PrimitiveStore<T>,
	mutator: (state: T, ...args: C[]) => U
): Setter<C> {
	return (...args: C[]) => {
		mutator(store.$state, ...args);
		if (store.name) {
			handleCacheOfStore(store.name, store.$state);
		}
	};
}

type Watcher<T, U = unknown> = (state: T) => U;
export type Watchers<T> = Watcher<T, unknown>[];
export type MapSources<T, U> = {
	[K in keyof T]: T[K] extends Watcher<U, infer V> ? V : T[K] extends object ? T[K] : never;
};
/**
 * The `watch` function allows for watching to a primitive store with specified
 * watchers and an effect to be executed.
 * @param store - The `store` parameter is a PrimitiveStore that holds the state of type T.
 * @param watchers - Watchers are functions that watche to changes in the store's state. They
 * are typically used to extract specific pieces of state from the store and react to changes in those
 * pieces of state.
 * @param effect - The `effect` parameter in the `watche` function is a function that takes a
 * `MapSources` object as its argument and performs some action based on the states provided in the
 * `MapSources` object.
 * @returns The `watch` function returns a cleanup function that can be used to unwatch the
 * effect and remove it from the list of watchers.
 */
export function watch<T extends CoreState, U extends Watchers<T>>(
	store: PrimitiveStore<T>,
	subscribers: [...U],
	effect: (states: MapSources<U, T>) => void | (() => void)
): () => void {
	const effectToDestroy = $effect.root(() => {
		let cleanUp: void | (() => void);
		$effect(() => {
			const states = [] as MapSources<U, T>;
			for (const stateFn of subscribers) {
				states.push(stateFn(store.$state));
			}
			cleanUp = effect(states);
		});

		return () => {
			if (cleanUp) {
				cleanUp();
			}
		};
	});

	try {
		onDestroy(effectToDestroy);
	} catch (err) {
		if ((err as Error)?.message.startsWith('lifecycle_outside_component') === false) {
			throw err;
		}
	}

	return effectToDestroy;
}

/**
 * The function `clearCache` clears a specific store from the cache if it exists.
 * @param {string} storeName - The `storeName` parameter in the `clearCache` function is a string that
 * represents the name of the store for which you want to clear the cache.
 */
export function clearCache(storeName: string): void {
	if (getCachedStoresMap().has(storeName)) {
		getCachedStoresMap().get(storeName)?.adapter.delete(getCacheKey(storeName)!);
	}
}
