# Local Storage Adapter Documentation

The `localStorageAdapter` module provides a simple interface for interacting with the browser's local storage, allowing for the storage, retrieval, and deletion of data. This module is particularly useful for caching data on the client side to improve the performance and user experience of web applications.

## Functions

### `getFromCache<T>(key: string): Promise<T | undefined>`

Retrieves an item from the local storage.

#### Parameters

- `key`: A `string` representing the key of the item to retrieve from local storage.

#### Returns

- A `Promise` that resolves to the item associated with the specified key, parsed as type `T`. If the item does not exist, `undefined` is returned.

#### Example

```typescript
const userSettings = await localStorageAdapter.getFromCache<UserSettings>('userSettings');
```

### `setToCache<T>(key: string, value: T): void`

Stores an item in the local storage.

#### Parameters

- `key`: A `string` representing the key under which to store the item.
- `value`: The item of type `T` to store in local storage. The item will be stringified before storage.

#### Example

```typescript
localStorageAdapter.setToCache('userSettings', { theme: 'dark', language: 'en' });
```

### `deleteFromCache(key: string): void`

Deletes an item from the local storage.

#### Parameters

- `key`: A `string` representing the key of the item to delete from local storage.

#### Example

```typescript
localStorageAdapter.deleteFromCache('userSettings');
```

## Usage

To use the `localStorageAdapter`, import it into your TypeScript file:

```typescript
import { localStorageAdapter } from './path/to/localStorageAdapter';
```

Then, you can call its methods to interact with the local storage, as shown in the examples above.

## Notes

- This module is designed to work with TypeScript, utilizing generic types (`<T>`) for flexibility and type safety.
- The `getFromCache` function uses asynchronous syntax (`async/await`) for consistency and potential future enhancements, even though `localStorage` operations are synchronous.
- Ensure that the objects stored and retrieved are serializable to JSON, as `JSON.stringify` and `JSON.parse` are used for storage and retrieval.

This documentation covers the basic usage and functionality of the `localStorageAdapter` module.


# IndexedDB Adapter Documentation

This document provides an overview and usage guide for the `idbAdapter` module, which offers a simplified interface for interacting with the IndexedDB storage through the `idb-keyval` library. The module provides three main functions: `getFromCache`, `setToCache`, and `deleteFromCache`, designed to facilitate the storing, retrieving, and deleting of data in a key-value format.

## Functions

### `getFromCache<T>(key: string): Promise<T | undefined>`

Retrieves a value from the cache based on the provided key.

#### Parameters

- `key`: A `string` representing the key under which the value is stored in the cache.

#### Returns

- A `Promise` that resolves to the value associated with the provided key, parsed as JSON. If the key does not exist, it returns `undefined`.

#### Example Usage

```typescript
const userSettings = await idbAdapter.getFromCache<UserSettings>('user-settings');
```

### `setToCache<T>(key: string, value: T): void`

Stores a value in the cache under the specified key.

#### Parameters

- `key`: A `string` representing the key under which the value will be stored.
- `value`: The value to be stored. This can be of any type, but it will be stringified before storage.

#### Example Usage

```typescript
idbAdapter.setToCache('user-settings', { theme: 'dark', notifications: true });
```

### `deleteFromCache(key: string): void`

Deletes a value from the cache based on the provided key.

#### Parameters

- `key`: A `string` representing the key under which the value is stored in the cache.

#### Example Usage

```typescript
idbAdapter.deleteFromCache('user-settings');
```

## Module Export

The `idbAdapter` object is exported from the module, providing access to the `getFromCache`, `setToCache`, and `deleteFromCache` functions.

## Implementation Notes

- The `idb-keyval` library is utilized for IndexedDB interactions, offering a simple key-value interface.
- Values stored in the cache are stringified using `JSON.stringify` to ensure compatibility with the `idb-keyval` storage mechanism.
- When retrieving values, the module attempts to parse the stored string back into its original format using `JSON.parse`. If the key does not exist, it defaults to returning `undefined`.

## Usage Considerations

- Ensure that any object stored in the cache can be safely serialized and deserialized through JSON.
- This module abstracts away some of the complexities of directly interacting with IndexedDB, but understanding basic concepts of asynchronous storage operations can be beneficial.
- The module does not handle exceptions internally. It is recommended to implement error handling in the application logic when using these functions.