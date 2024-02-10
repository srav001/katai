export type Prettier<T> = {
    [K in keyof T]: T[K];
} & {};
export type NotEmptyType<T, U> = T extends undefined ? U : T extends null ? U : T;
export type PrimitiveTypes = string | boolean | number | unknown | null;
export type GenericObject<T = PrimitiveTypes> = Record<string, T>;
export type GenericArray<T = PrimitiveTypes> = Array<T>;
/**
 * Get all keys of an object
 */
export type PathInto<Obj> = {
    [K in keyof Obj]: Obj[K] extends Record<string, unknown> ? `${K}` extends keyof Obj[K] ? K : `${K}.${PathInto<Obj[K]>}` | K : K;
}[keyof Obj];
type DefinitePrimitiveTypes = string | boolean | number | null;
export type PathIntoDeep<Obj> = {
    [K in keyof Obj]: Obj[K] extends Record<string, unknown> ? `${K}` extends keyof Obj[K] ? `${K}.*` | K : `${K}.${PathIntoDeep<Obj[K]>}` | `${K}.*` | K : Obj[K] extends DefinitePrimitiveTypes ? K : K | `${K}.*`;
}[keyof Obj];
export type GetDeepValue<T, Key extends PathInto<T> | unknown> = Key extends `${infer K}.${infer Rest}` ? K extends keyof T ? GetDeepValue<T[K], Rest> : never : Key extends keyof T ? T[Key] : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
export {};
