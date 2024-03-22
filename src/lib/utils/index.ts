/**
 * It clones a value using JSON - stringify & parse. es6 types not supported
 * @param value - The value to be cloned.
 */
export function deepClone<InferedType>(value: InferedType): InferedType {
	return JSON.parse(JSON.stringify(value)) as InferedType;
}

export type BasicObject = Record<string, any>;

function getOrSetNestedValueInObject(
	objectToUpdate: BasicObject,
	path: string,
	value: unknown = undefined,
	action: 'get' | 'set' = 'get'
): void | unknown {
	if (objectToUpdate === undefined) {
		return undefined;
	}
	if (path === '') {
		if (action === 'set') {
			objectToUpdate = value as BasicObject;
		}
		return objectToUpdate;
	}

	const pathList = path.split('.');
	const pathArrayLength = pathList.length;

	if (pathArrayLength === 1) {
		if (action === 'set') {
			objectToUpdate[path] = value;
		}
		return objectToUpdate[path];
	}

	let schema: BasicObject = objectToUpdate;
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

	if (action === 'set') {
		schema[pathList[pathArrayLength - 1]] = value;

		return objectToUpdate;
	}

	return schema[pathList[pathArrayLength - 1]];
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
	return getOrSetNestedValueInObject(objectToRead, path) as T extends null | undefined ? undefined : T;
}

export function debounce<T extends (...args: any[]) => void>(
	callBack: T,
	delay = 200
): (...args: Parameters<T>) => void {
	let timer: ReturnType<typeof setTimeout>;
	return function (...args: unknown[]) {
		clearTimeout(timer);
		timer = setTimeout(function () {
			callBack(...args);
		}, delay);
	};
}
