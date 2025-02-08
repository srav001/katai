/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DeepReadonly } from './utilities.js';

export type State = Record<string | number, any>;

type Action<T> = (state: T, ...args: any[]) => void;
export type Actions<T> = Record<string, Action<T>>;

type Getter<T> = (state: T, ...args: any[]) => any;

export type Getters<T> = Record<string, Getter<T>>;

type GetValue<T> = (state: T) => any;
export type Computeds<T> = Record<string, GetValue<T>>;

type Query<T, U = any> = (...args: U[]) => Promise<T>;

export type QueryOptions<T> = {
	loader?: {
		fn: Query<T>;
		onInit?: boolean;
	};
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
