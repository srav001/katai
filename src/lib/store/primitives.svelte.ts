import type { PrimitiveStore } from '$lib/types/store.js';
import { onDestroy } from 'svelte';

let cacheModule: typeof import('./cache.js');

type Getter<T> = () => T;
/**
 * The `get` function takes a store and a derivation function, and returns a getter
 * function that applies the derivation function to the store's value.
 * @param store - `PrimitiveStore<T>` is a generic type representing a store that holds a value of type
 * `T`. It seems like the `store` parameter is expected to be an instance of this `PrimitiveStore`
 * type.
 * @param derivation - The `derivation` parameter is a function that takes the current state of type
 * `T` as input and returns a value of type `U`. It is used to derive a new value based on the current
 * state stored in the `PrimitiveStore`.
 * @returns A `Getter<U>` function is being returned. This function takes no arguments and returns a
 * value of type `U`. The value returned is the result of applying the `derivation` function to the
 * `store.value`.
 */
export function get<T, U extends any>(store: PrimitiveStore<T>, derivation: (state: T) => U): Getter<U> {
	// 	let value: U;
	// 	const effectToDestroy = $effect.root(() => {
	// 		$effect.pre(() => {
	// 			value = derivation(store.value);
	// 		});
	// 	});
	// 	try {
	// 		onDestroy(effectToDestroy);
	// 	} catch (err) {
	// 		if (
	// 			err.message !==
	// 			`lifecycle_outside_component
	// \`onDestroy(...)\` can only be used during component initialisation`
	// 		)
	// 			console.log(err.message);
	// 	}
	// 	return () => value;
	return derivation.bind(null, store.value);
}

type Updater<T = undefined> = (payload: T) => void;
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
export function update<T, U extends any, C extends any = unknown>(
	store: PrimitiveStore<T>,
	mutator: (state: T, payload: C) => U
): Updater<C> {
	return (val: C) => {
		mutator(store.value, val);
		if (store.name) {
			if (cacheModule) {
				cacheModule.handleCacheOfStore(store.name, store.value);
			} else {
				import('./cache.js').then((module) => {
					cacheModule = module;
					cacheModule.handleCacheOfStore(store.name, store.value);
				});
			}
		}
	};
}

type Subscriber<T, U = unknown> = (state: T) => U;
export type Subscribers<T> = Subscriber<T, unknown>[];
export type MapSources<T, U> = {
	[K in keyof T]: T[K] extends Subscriber<U, infer V> ? V : T[K] extends object ? T[K] : never;
};
/**
 * The `subscribe` function allows for subscribing to a primitive store with specified
 * subscribers and an effect to be executed.
 * @param store - The `store` parameter is a PrimitiveStore that holds the state of type T.
 * @param subscribers - Subscribers are functions that subscribe to changes in the store's state. They
 * are typically used to extract specific pieces of state from the store and react to changes in those
 * pieces of state.
 * @param effect - The `effect` parameter in the `subscribe` function is a function that takes a
 * `MapSources` object as its argument and performs some action based on the states provided in the
 * `MapSources` object.
 * @returns The `subscribe` function returns a cleanup function that can be used to unsubscribe the
 * effect and remove it from the list of subscribers.
 */
export function subscribe<T, U extends Subscribers<T>>(
	store: PrimitiveStore<T>,
	subscribers: [...U],
	effect: (states: MapSources<U, T>) => void
): () => void {
	const effectToDestroy = $effect.root(() => {
		$effect(() => {
			const states = [] as MapSources<U, T>;
			for (const stateFn of subscribers) {
				states.push(stateFn(store.value));
			}
			effect(states);
		});
	});

	try {
		onDestroy(effectToDestroy);
	} catch (err) {
		if (
			(err as any).message &&
			(err as any).message !==
				`lifecycle_outside_component
\`onDestroy(...)\` can only be used during component initialisation`
		) {
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
	if (cacheModule) {
		if (cacheModule.getCachedStoresMap().has(storeName)) {
			cacheModule
				.getCachedStoresMap()
				.get(storeName)
				?.adapter.deleteFromCache(cacheModule.getCacheKey(storeName)!);
		}
	} else {
		import('./cache.js').then((module) => {
			cacheModule = module;
			if (cacheModule.getCachedStoresMap().has(storeName)) {
				cacheModule
					.getCachedStoresMap()
					.get(storeName)
					?.adapter.deleteFromCache(cacheModule.getCacheKey(storeName)!);
			}
		});
	}
}
