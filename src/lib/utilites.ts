// A set of utility functions to use to remove repetitive and widley used code
export type UtilityFunction = (...args: any) => any;
export type NonUndefined<T> = T extends undefined ? never : T;

/**
 * Try to run the function passed in, and if it fails, log the error.
 * @param {UtilityFunction} func - UtilityFunction
 * @returns The function execution is being returned.
 */
export function wrapInTryCatch<FunctionType>(func: UtilityFunction): FunctionType {
	try {
		return func() as FunctionType;
	} catch (error) {
		console.error(error);
		let emptyResponse: FunctionType;

		// @ts-ignore
		return emptyResponse;
	}
}

/**
 * It clones a value using JSON - stringify & parse. es6 types not supported
 * @param value - The value to be cloned.
 */
export function deepClone<InferedType>(value: InferedType): InferedType {
	return wrapInTryCatch(function () {
		return JSON.parse(JSON.stringify(value));
	});
}

export type BasicObject = Record<string, any>;

function getOrSetNestedValueInObject(
	objectToUpdate: BasicObject,
	path: string,
	value: unknown = undefined,
	action: 'get' | 'set' = 'get'
): void | unknown {
	return wrapInTryCatch(function () {
		let schema: BasicObject = objectToUpdate;
		const pathList = path.split('.');
		const pathArrayLength = pathList.length;
		let exit = false;
		for (let i = 0; i < pathArrayLength - 1; i++) {
			const elem: string = pathList[i];
			if (!schema[elem]) {
				if (action === 'get') {
					exit = true;
					break;
				}
				schema[elem] = {};
			}
			schema = schema[elem];
		}

		if (exit === true) {
			return undefined;
		}

		if (value) {
			schema[pathList[pathArrayLength - 1]] = value;

			return objectToUpdate;
		}

		return schema[pathList[pathArrayLength - 1]];
	});
}

/**
 * A function that takes an object, a path, and a value, and sets the value at the path in the object.
 * @param {BasicObject} objectToUpdate - The object to modify.
 * @param {string} path - The path of the value in the object to update.
 * @param {any} value - The value to update.
 * @returns The updated object.
 */
export function set(objectToUpdate: BasicObject, path: string, value: unknown) {
	return getOrSetNestedValueInObject(objectToUpdate, path, value, 'set') as void;
}

/**
 * It takes an object and a path, and returns the value at that path
 * @param {BasicObject} objectToRead - The object that you want to update.
 * @param {string} path - The path to the property you want to get.
 * @returns The value of the property at the end of the path.
 */
export function get<T>(objectToRead: BasicObject, path: string) {
	return getOrSetNestedValueInObject(objectToRead, path) as T extends null | undefined
		? undefined
		: T;
}

/**
 * It takes a function and an argument, and if the function is an async function, it executes it with
 * the argument, otherwise it returns a resolved promise with the result of the function
 * @param {Function} func - The function to execute.
 * @param {T} arg - The argument to pass to the function.
 * @returns A promise that resolves to the result of the function.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export async function dynamicallyExecuteFunction<T = unknown>(
	func: Function,
	arg1: unknown,
	arg2: unknown
) {
	try {
		const result = func(arg1, arg2);
		if (result instanceof Promise) {
			return (await result) as T;
		} else {
			return result as T;
		}
	} catch (err) {
		throw new Error('Function failed to run', { cause: err });
	}
}
