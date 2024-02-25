## createStore

The `createStore` function is used to read and write data to the store. It returns an object with several functions to interact with the store's state, including `get`, `update`, `write`, `writeUpdate`, `next`, and `has`. These functions can be used to read data from the store, update the store's data, write new data to the store, and subscribe to changes in the store's data.

### Parameters

- `table`: T extends BasicStore - This is the table that we're creating a store for.
- `options`: An optional parameter that allows configuring the store, including caching options.

### Example

```typescript
import { createStore } from 'path/to/store';

const table = {
  name: 'myTable',
  state: { /* initial state */ }
};

const options = {
  cache: {
    adapter: /* cache adapter */,
    key: /* cache key */
  }
};

const myStore = createStore(table, options);
```

## useStore

The `useStore` function is used to read and write data to the state of a store. It returns an object with several functions to interact with the store's state, including `get`, `update`, `write`, `writeUpdate`, `next`, and `has`. These functions can be used to read data from the store, update the store's data, write new data to the store, and subscribe to changes in the store's data.

### Parameters

- `storeName`: The name of the store to use.

### Example

```typescript
import { useStore } from 'path/to/store';

const myStore = useStore('myTable');
```

### Functions Available in Both `createStore` and `useStore`

- `get(key?: string): unknown`: Retrieves the value of the specified key in the store.
- `update(key: string, callback: (oldValue: unknown) => unknown): void`: Updates the value of the specified key in the store using a callback function.
- `set(key: string, value: unknown): void`: Sets the value of the specified key in the store.
- `next(callback: (data: unknown) => void, key?: string): void`: Allows subscribing to changes in the store's data.
- `has(key: string): boolean`: Checks if a key exists in the store.

### Additional Functions Available in `createStore`

- `write(key: string, value: unknown): void`: Writes a new value to the specified key in the store.
- `writeUpdate(key: string, callback: (oldValue: unknown) => unknown): void`: Writes a new value to the specified key in the store using a callback function.
- `subscribe(key: string, subscriber: (data: unknown, oldData?: unknown) => void): void`: Subscribes to changes in the store's data for the specified key.
- `unsubscribe(key: string, subscriber: (data: unknown, oldData?: unknown) => void): void`: Unsubscribes from changes in the store's data for the specified key.
- `removeSubscribers(key: string): void`: Removes all subscribers for the specified key.
- `clearCache(): void`: Clears the cache associated with the store.
- `dropStore(): void`: Drops the store, removing all associated data and cache.

### Note

- Ensure to handle errors appropriately, especially when dealing with asynchronous operations or cache operations.
- The cache functionality requires a cache adapter to be provided in the options object.