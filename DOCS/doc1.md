# Documentation for Store Creation and Caching Functions

This documentation provides a comprehensive overview of the TypeScript functions designed for creating stores and handling their caching. These functions are part of a larger system that manages state across an application. Below, you will find detailed descriptions, usage examples, and explanations of the parameters and return types for each function.

## Functions Overview

- **createStore**: Creates a primitive store with a specified name and initial state, with optional caching.
- **createState**: A helper function that initializes the store state and handles caching based on provided options.
- **handleCacheOfNewStore**: Manages the caching logic for a new store, including setting and retrieving cache data.

### createStore

Creates a primitive store with a specified name and initial state. It optionally configures caching for the store if specified in the options.

#### Parameters

- `storeName` (string): The name of the store being created. This name must be unique across the application.
- `storeState` (InferedState): The initial state or value that will be stored in the created store. This is the data that the store will manage and provide access to.
- `options` (StoreOptions, optional): Additional configuration options for creating the store. This may include settings for caching.

#### Returns

- `PrimitiveStore<InferedState>`: An object representing the created store. It includes the store name and a getter function for the store value.

#### Usage Example

```typescript
const userStore = createStore('user', { name: 'John Doe', age: 30 });
console.log(userStore.name); // Output: 'user'
console.log(userStore.value); // Output: { name: 'John Doe', age: 30 }
```

### createState

A helper function that initializes the store state and optionally handles caching based on the provided options. It is used internally by `createStore`.

#### Parameters

- `storeName` (string): The name of the store being created.
- `storeState` (T): The initial state of the store.
- `options` (StoreOptions, optional): Configuration options for the store, potentially including caching settings.

#### Usage Example

This function is used internally by `createStore` and is not intended to be called directly in most cases.

### handleCacheOfNewStore

Manages the caching logic for a new store, including setting and retrieving cache data based on the provided options.

#### Parameters

- `storeName` (string): The name of the store for which caching is being handled.
- `storeState` (T): The initial state of the store.
- `options` (StoreOptions): Configuration options for the store, including caching settings.

#### Usage Example

This function is used internally by `createState` when caching options are provided and is not intended to be called directly in most cases.

## Additional Notes

- The `StoreOptions` type should be defined elsewhere in your codebase, detailing the structure for caching options and any other store configuration settings.
- The `_stores` object and `cacheModule` are assumed to be part of the larger application context, managing the state and caching logic respectively.
- Error handling is implemented to ensure unique store names and the presence of required parameters.

By utilizing these functions, developers can efficiently manage application state with the added benefit of caching, enhancing performance and user experience.
