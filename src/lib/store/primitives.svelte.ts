import type { PrimitiveStore } from '$lib/types/store.js';
import { onDestroy } from 'svelte';
import { _cachedStoresMap, getCacheKey, handleCacheOfStore } from './cache.js';

const effectToSubMap = new WeakMap<WeakKey, WeakSet<any>>();

type Getter<T> = () => T;
export function get<T, U extends any>(state: T, derivation: (state: T) => U): Getter<U> {
	return () => derivation(state);
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
export type Subcribers<T> = Subscriber<T, unknown>[];
export type MapSources<T, U> = {
	[K in keyof T]: T[K] extends Subscriber<U, infer V> ? V : T[K] extends object ? T[K] : never;
};

export function subscribe<T, U extends Subcribers<T>>(
	state: T,
	subscribers: [...U],
	effect: (states: MapSources<U, T>) => void
): () => void {
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

type Action = (state: any, payload: any) => void;
type Getterx = (state: any) => any;

interface StoreConfig {
	name: string;
	state: Record<string, any>;
	getters: Record<string, Getterx>;
	actions: Record<string, Action>;
}

type StoreReturnType<T extends StoreConfig> = {
	[K in keyof T['getters']]: T['getters'][K] extends (state: any) => infer R ? () => R : never;
} & {
	[K in keyof T['actions']]: T['actions'][K] extends (state: any, payload: infer P) => void
		? (payload: P) => void
		: never;
};

declare function createBasicStore<T extends StoreConfig>(config: T): StoreReturnType<T>;

// Usage
const newStore = createBasicStore({
	name: 'test',
	state: {
		counter: 0,
		count: 0
	},
	getters: {
		getCounter: (state) => state.counter,
		getCount: (state) => String(state.count)
	},
	actions: {
		updateCounter: (state, payload: number) => {
			state.counter += payload;
		},
		updateCount: (state, payload: number) => {
			state.count += payload;
		}
	}
});

newStore.getCount;
