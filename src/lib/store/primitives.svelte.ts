import type { PrimitiveStore } from '$lib/types/store.js';
import { onDestroy } from 'svelte';
import { _cachedStoresMap, getCacheKey, handleCacheOfStore } from './cache.js';

const effectToSubMap = new WeakMap<WeakKey, WeakSet<any>>();

type Getter<T> = () => T;
export function get<T, U extends any>(state: T, derivation: (state: T) => U): Getter<U> {
	return () => derivation(state);
}

type Updater<T> = (val: T) => void;
export function update<T, U extends any, C extends any = unknown>(
	store: PrimitiveStore<T>,
	mutator: (state: T, val: C) => U
): Updater<C> {
	return (val: C) => {
		mutator(store.value, val);
		if (store.name) {
			handleCacheOfStore(store.name, store.value);
		}
	};
}

type Subscriber<T, U = unknown> = (state: T) => U;
export type Subcribers<T> = Subscriber<T, unknown>[];
export type MapSources<T, U> = {
	[K in keyof T]: T[K] extends Subscriber<U, infer V> ? V : T[K] extends object ? T[K] : never;
};

export function subscribe<T, U extends Subcribers<T>>(
	state: T,
	subscribers: [...U],
	effect: (states: MapSources<U, T>) => void
) {
	effectToSubMap.set(subscribers, new WeakSet().add(effect));

	const toDestroyEffect = $effect.root(() => {
		$effect(() => {
			const states = [] as MapSources<U, T>;
			for (const stateFn of subscribers) {
				states.push(stateFn(state));
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
	}

	return toDestroy;
}
export function clearCache(storeName: string) {
	if (_cachedStoresMap.has(storeName)) {
		_cachedStoresMap.get(storeName)?.adapter.deleteFromCache(getCacheKey(storeName)!);
	}
}
