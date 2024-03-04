import type { GenericArray, GenericObject, PrimitiveTypes } from './utilities.js';

export type StoreState = Record<string, any>;

export type TypesOfState = Record<string, PrimitiveTypes | GenericArray | GenericObject>;
export type BasicStore<T = TypesOfState> = {
	name: string;
	state: T;
};

export type PrimitiveStore<T> = {
	name: string;
	value: T;
};
