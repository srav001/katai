# TypeScript Documentation

This documentation provides a comprehensive overview of a TypeScript module designed for state management with caching capabilities. The module introduces several key functions: `get`, `update`, `subscribe`, and `clearCache`, each serving a unique purpose in managing and interacting with state stores.

## Table of Contents

- [PrimitiveStore Type](#primitivestore-type)
- [Getter Function](#getter-function)
- [Updater Function](#updater-function)
- [Subscriber Type](#subscriber-type)
- [Subscribe Function](#subscribe-function)
- [ClearCache Function](#clearcache-function)

### PrimitiveStore Type

Before diving into the functions, it's essential to understand the `PrimitiveStore<T>` type, which is a generic type representing a store that holds a value of type `T`. This type is crucial for the operation of the provided functions.

### Getter Function

```typescript
function get<T, U>(store: PrimitiveStore<T>, derivation: (state: T) => U): Getter<U>
```

The `get` function is designed to create a getter function from a store and a derivation function. It applies the derivation function to the store's value, returning a new value of type `U`.

- **Parameters:**
  - `store`: An instance of `PrimitiveStore<T>`.
  - `derivation`: A function that takes the current state of type `T` and returns a value of type `U`.

- **Returns:** A `Getter<U>` function that, when called, returns a value of type `U`.

### Updater Function

```typescript
function update<T, U, C = unknown>(store: PrimitiveStore<T>, mutator: (state: T, payload: C) => U): Updater<C>
```

The `update` function updates the store's value using a mutator function and a payload. It also handles caching if applicable.

- **Parameters:**
  - `store`: A `PrimitiveStore<T>` object.
  - `mutator`: A function that updates the state of the store based on the provided payload.

- **Returns:** An `Updater<C>` function that takes a payload of type `C`.

### Subscriber Type

```typescript
type Subscriber<T, U = unknown> = (state: T) => U;
type Subscribers<T> = Subscriber<T, unknown>[];
```

Subscribers are functions that subscribe to changes in the store's state, reacting to updates.

### Subscribe Function

```typescript
function subscribe<T, U extends Subscribers<T>>(store: PrimitiveStore<T>, subscribers: [...U], effect: (states: MapSources<U, T>) => void): () => void
```

The `subscribe` function allows subscribing to a primitive store with specified subscribers and an effect to be executed.

- **Parameters:**
  - `store`: A `PrimitiveStore<T>`.
  - `subscribers`: An array of subscriber functions.
  - `effect`: A function that performs an action based on the states provided.

- **Returns:** A cleanup function to unsubscribe the effect.

### ClearCache Function

```typescript
function clearCache(storeName: string): void
```

The `clearCache` function clears the cache for a specific store if it exists.

- **Parameters:**
  - `storeName`: The name of the store to clear from the cache.

This module provides a robust solution for managing state in TypeScript applications, with features like caching and subscription to state changes, enhancing performance and reactivity.
