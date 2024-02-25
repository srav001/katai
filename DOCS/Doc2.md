# Store Management Documentation

This TypeScript module provides a comprehensive solution for managing application state, including features for state caching, subscription to state changes, and utilities for accessing and modifying state in a structured manner. It leverages TypeScript's advanced type system for enhanced type safety and developer experience.

## Overview

The module introduces several key concepts:

- **BasicStore**: A basic structure for a store, including a name and state.
- **TypesOfState**: Defines the allowed types for store states.
- **CacheOptions**: Configuration for caching store states.
- **StoreOptions**: Additional options for store creation, including caching options.
- **StoreInstance**: The main interface for interacting with a store, providing methods for state manipulation and subscription.

## Key Functions

### `createState`

Creates a store and optionally caches its state.

**Parameters:**

- `store: T extends BasicStore`: The store to create.
- `options?: StoreOptions`: Optional. Configuration options for the store, including caching.

**Returns:** The created store.

### `storeInstance`

Initializes a store instance for interacting with the store's state.

**Parameters:**

- `store?: BasicStore<InferedState>`: Optional. The store to initialize.
- `mainStore?: string`: Optional. The name of the main store.
- `options?: StoreOptions`: Optional. Configuration options for the store.

**Returns:** An object with methods for interacting with the store's state.

## StoreInstance Methods

### `get`

Retrieves a value from the store's state.

**Parameters:**

- `key?: string`: The key of the value to retrieve.

**Returns:** The value associated with the key.

### `set`

Sets a value in the store's state.

**Parameters:**

- `key: string`: The key of the value to set.
- `value: any`: The value to set.

### `update`

Updates a value in the store's state using a callback function.

**Parameters:**

- `key: string`: The key of the value to update.
- `callback: (data: any) => any`: A callback function that takes the current value and returns the updated value.

### `subscribe`

Subscribes to changes in the store's state.

**Parameters:**

- `key: string | ''`: The key to subscribe to. An empty string subscribes to the entire store.
- `subscriber: Subscriber`: A callback function that is called when the subscribed value changes.

### `unsubscribe`

Unsubscribes from changes in the store's state.

**Parameters:**

- `key: string | ''`: The key to unsubscribe from.
- `subscriber: Subscriber`: The subscriber callback function to remove.

### `clearCache`

Clears the cache for the store's state.

### `dropStore`

Drops the store, removing it from the cache and deleting its state.

## Usage

To use this module, import the `createStore` or `useStore` functions as needed. `createStore` is used to create a new store, while `useStore` is used to interact with an existing store.

```typescript
import { createStore, useStore } from './path/to/module';

// Creating a new store
const myStore = createStore({ name: 'myStore', state: { key: 'value' } });

// Using an existing store
const storeInstance = useStore('myStore');
```

This module provides a flexible and type-safe approach to state management in TypeScript applications, with support for caching and state change subscriptions.