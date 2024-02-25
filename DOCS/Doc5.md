# Store Management in Svelte with TypeScript

This documentation provides a comprehensive guide to managing state in Svelte applications using TypeScript. It covers the creation, manipulation, and caching of stores, along with subscription management for reactive updates.

## Overview

The provided TypeScript code defines a flexible system for state management within Svelte applications. It includes functionality for deep cloning objects, caching store states, subscribing to store changes, and more. This system is designed to work with both primitive and complex data types, ensuring broad applicability.

## Key Concepts

- **Store**: A container for application state.
- **Cache**: Temporary storage for store states to enhance performance.
- **Subscription**: A mechanism to react to store changes.

## Types and Interfaces

### `TypesOfState`

Defines the allowed types for store states, including primitives, arrays, and objects.

```typescript
export type TypesOfState = Record<string, PrimitiveTypes | GenericArray | GenericObject>;
```

### `BasicStore<T>`

Represents a basic store structure with a name and state.

```typescript
export type BasicStore<T = TypesOfState> = {
    name: string;
    state: T;
};
```

### `StoreOptions<T>`

Optional configuration for stores, including caching options.

```typescript
type StoreOptions<T = unknown> = {
    cache?: CacheOptions;
};
```

## Functions

### `createState<T extends BasicStore>(store: T, options?: StoreOptions)`

Creates a store and optionally caches its state.

#### Parameters

- `store`: The store to create.
- `options`: Optional. Configuration options for the store.

#### Returns

- The created store.

#### Example

```typescript
const userStore = createState({
    name: 'user',
    state: { id: 1, name: 'John Doe' }
});
```

### `storeInstance<InferredState = undefined>(store?: BasicStore<InferredState>, mainStore?: string, options?: StoreOptions)`

Creates or retrieves a store instance with various methods for state manipulation and subscription management.

#### Parameters

- `store`: Optional. The store to create or manage.
- `mainStore`: Optional. The name of the main store.
- `options`: Optional. Configuration options for the store.

#### Returns

- An object with methods to interact with the store.

#### Example

```typescript
const userStore = storeInstance({
    name: 'user',
    state: { id: 1, name: 'John Doe' }
});
```

### `createStore<T>(store: BasicStore<T>, options?: StoreOptions)`

A convenience function to create a store.

#### Parameters

- `store`: The store to create.
- `options`: Optional. Configuration options for the store.

#### Returns

- A store instance.

#### Example

```typescript
const userStore = createStore({
    name: 'user',
    state: { id: 1, name: 'John Doe' }
});
```

### `useStore<T extends BasicStore<Record<string, unknown>>>(storeName: string)`

Retrieves an existing store by name for reading and writing data.

#### Parameters

- `storeName`: The name of the store to retrieve.

#### Returns

- A store instance.

#### Example

```typescript
const userStore = useStore('user');
```

## Caching

The system supports caching store states using a provided adapter. This can significantly improve performance by reducing the need to fetch or compute state repeatedly.

### Cache Adapter

A cache adapter must implement the following methods:

- `getFromCache(key: string)`: Retrieves data from the cache.
- `setToCache(key: string, data: any)`: Stores data in the cache.
- `deleteFromCache(key: string)`: Removes data from the cache.

## Subscription Management

Stores support subscribing to changes, allowing components to reactively update when the store state changes.

### Subscribing to a Store

```typescript
store.subscribe('key', (newValue, oldValue) => {
    console.log(`Value changed from ${oldValue} to ${newValue}`);
});
```

### Unsubscribing from a Store

```typescript
store.unsubscribe('key', subscriberFunction);
```

## Conclusion

This state management system provides a robust and flexible solution for managing application state in Svelte applications. It supports a wide range of data types, caching for performance optimization, and subscription management for reactive updates.