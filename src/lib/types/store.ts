/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GenericArray, GenericObject, PrimitiveTypes } from './utilities.js';

export type CoreState = Record<string, any>;
export type StoreState<T extends CoreState> = {
	v: T;
	hasCache: boolean;
};

export type TypesOfState = Record<string, PrimitiveTypes | GenericArray | GenericObject>;
export type BasicStore<T = TypesOfState> = {
	name: string;
	state: T;
};

// export type StorePrimitve<T> = {
// 	name: string;
// 	$state: Readonly<T>;
// };
