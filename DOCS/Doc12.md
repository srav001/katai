## `createStore`

The `createStore` function is a generic function that creates and initializes a store instance for a given store. It takes a `BasicStore` object representing the store and an optional `StoreOptions` object as parameters. It returns a store instance that can be used to interact with the store's state.

### Function Signature

```typescript
function createStore<T>(store: BasicStore<T>, options?: StoreOptions): StoreInstance<T>;
```

-   `T`: Represents the type of data stored in the store.
-   `store`: A `BasicStore` object representing the store for which the store instance is created.
-   `options` (optional): An object containing options for configuring the store.

### Parameters

-   `store`: The store for which the store instance is created.
-   `options`: Optional configuration options for the store.

### Return Value

-   `StoreInstance<T>`: The created store instance for the specified store.

## `useStore`

The `useStore` function is a generic function that returns a store instance for a specified store name. It is typically used in scenarios such as Svelte stores where the store name is used to identify the specific store instance to use.

### Function Signature

```typescript
function useStore<T extends BasicStore<Record<string, unknown>>>(storeName: string): StoreInstance<T['state']>;
```

-   `T`: Represents the type of data stored in the store.
-   `storeName`: A string representing the name of the store to use.

### Parameters

-   `storeName`: The name of the store for which to retrieve the store instance.

### Return Value

-   `StoreInstance<T['state']>`: The store instance for the specified store name.

### Notes

-   Both functions delegate the actual creation of the store instance to the `storeInstance` function, which is assumed to be defined elsewhere in the codebase.
-   The `createStore` function is typically used for creating new store instances, while the `useStore` function is used to retrieve existing store instances based on their names.

### Example Usage

```typescript
// Creating a new store instance
const myStore = createStore(myBasicStore, options);

// Retrieving an existing store instance by name
const myExistingStore = useStore<MyStoreType>('myStoreName');
```

### Additional Information

-   This documentation assumes the existence of certain types (`BasicStore`, `StoreOptions`, `StoreInstance`) and functions (`storeInstance`) which should be defined elsewhere in the codebase.
