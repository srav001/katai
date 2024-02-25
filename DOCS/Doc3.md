# Store Management System Documentation

This TypeScript module provides a comprehensive solution for managing application state, particularly focusing on caching and state synchronization across components. It leverages Svelte's reactivity and lifecycle methods, along with custom caching and subscription mechanisms, to offer a robust state management system.

## Overview

The module introduces a flexible way to create, update, and subscribe to data stores within a Svelte application. It supports caching strategies to optimize performance and resource usage by storing state in a cache when specified. This system is particularly useful for applications that require real-time data updates across multiple components without causing unnecessary re-renders or fetching data multiple times.

## Key Concepts

- **Store**: A container for application state. This module allows creating stores for different parts of the application state, each identified by a unique name.
- **Cache**: An optional feature that stores the state of cacheable stores to avoid redundant computations or network requests.
- **Subscribers**: Functions that listen to changes in the store's state. They get notified whenever the state they are interested in changes.

## Functions

### `createState(store, options)`

Creates a store for the specified table and caches the table's state if marked as cacheable.

- **Parameters**:
  - `store`: The table (or state container) for which the store is being created.
  - `options`: Configuration options, including caching strategies.
- **Returns**: The original store object, augmented with state management capabilities.

### `store(table, mainTable, options)`

The core function that initializes a store, sets up caching if applicable, and returns an object with methods to interact with the store.

- **Parameters**:
  - `table`: The initial state or table to create the store for.
  - `mainTable`: An optional parameter to specify the main table name if `table` is not provided.
  - `options`: Configuration options for the store, including caching.
- **Returns**: An object with methods to interact with the store's state.

### `createStore(table, options)`

A wrapper function to create a store with the specified table and options.

- **Parameters**:
  - `table`: The initial state or table to create the store for.
  - `options`: Configuration options for the store.
- **Returns**: A store object with methods to interact with the store's state.

### `useStore(storeName)`

A function to access an existing store by its name.

- **Parameters**:
  - `storeName`: The name of the store to access.
- **Returns**: A store object with methods to interact with the store's state.

## Store Object Methods

The store object returned by `createStore` and `useStore` functions provides several methods to interact with the store's state:

- `get(key)`: Retrieves the value associated with the specified key from the store.
- `set(key, value)`: Sets the value for the specified key in the store.
- `update(key, callback)`: Updates the value for the specified key using the provided callback function.
- `next(callback, key)`: Executes the callback with a deep clone of the store's value, optionally filtered by the specified key.
- `subscribe(key, subscriber)`: Subscribes the provided function to changes in the store's state, optionally filtered by the specified key.
- `unsubscribe(key, subscriber)`: Removes the subscription for the specified key and subscriber function.
- `removeSubscribers(key)`: Removes all subscribers for the specified key.
- `clearCache()`: Clears the cache for the store, if caching is enabled.
- `dropStore()`: Removes the store and its associated cache and subscribers.

## Caching

The module supports caching store states to optimize performance. Caching is configurable through the `options` parameter when creating a store. The cache mechanism relies on an adapter pattern, allowing for flexible cache storage implementations.

## Subscriptions

Subscriptions allow components or functions to react to changes in the store's state. Subscribers get notified whenever the part of the state they are interested in is updated, enabling efficient data flow and reactivity across the application.

## Conclusion

This module provides a powerful and flexible system for managing application state in Svelte applications. By leveraging caching and subscriptions, it enables efficient data handling and synchronization across components, improving performance and user experience.