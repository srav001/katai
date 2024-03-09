import type { PrimitiveStore } from '$lib/types/store.js';
import { onDestroy } from 'svelte';
import { _cachedStoresMap, getCacheKey, handleCacheOfStore } from './cache.js';

const effectToSubMap = new WeakMap<WeakKey, WeakSet<any>>();

type Getter<T> = () => T;
export function get<T, U extends any>(store: PrimitiveStore<T>, derivation: (state: T) => U): Getter<U> {
	return derivation.bind(null, store.value);
}

type Updater<T> = (payload: T) => void;
export function update<T, U extends any, C extends any = unknown>(
	store: PrimitiveStore<T>,
	mutator: (state: T, payload: C) => U
): Updater<C> {
	return (val: C) => {
		mutator(store.value, val);
		if (store.name) {
			handleCacheOfStore(store.name, store.value);
		}
	};
}

type Subscriber<T, U = unknown> = (state: T) => U;
export type Subscribers<T> = Subscriber<T, unknown>[];
export type MapSources<T, U> = {
	[K in keyof T]: T[K] extends Subscriber<U, infer V> ? V : T[K] extends object ? T[K] : never;
};

export function subscribe<T, U extends Subscribers<T>>(
	store: PrimitiveStore<T>,
	subscribers: [...U],
	effect: (states: MapSources<U, T>) => void
): () => void {
	effectToSubMap.set(subscribers, new WeakSet().add(effect));

	const toDestroyEffect = $effect.root(() => {
		$effect(() => {
			const states = [] as MapSources<U, T>;
			for (const stateFn of subscribers) {
				states.push(stateFn(store.value));
			}
			effect(states);
		});
	});

	function toDestroy() {
		console.log('Unsubscribing');
		toDestroyEffect();
	}

	try {
		onDestroy(toDestroy);
	} catch (err) {
		console.log(err);
		if ((err as any).message === 'onDestroy can only be used during component initialisation.') {
			// Handle silently
		} else {
			throw err;
		}
	}

	return toDestroy;
}
export function clearCache(storeName: string): void {
	if (_cachedStoresMap.has(storeName)) {
		_cachedStoresMap.get(storeName)?.adapter.deleteFromCache(getCacheKey(storeName)!);
	}
}
