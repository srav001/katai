## `store`

The `store` function is responsible for managing the state of stores within an application. It provides methods for accessing and manipulating the data within these stores, as well as functionalities for caching and subscribing to changes in the data.

### Functions

#### `get $value()`

-   Returns the value of the current store or the entire store if no specific store is selected.

#### `get(key: string)`

-   Retrieves the value associated with the specified key within the store.

#### `set(key: string, value: any)`

-   Sets the value of the specified key within the store. If the key does not exist, it throws an error.

#### `update(key: string, callback: Function)`

-   Updates the value associated with the specified key using a callback function. The callback function receives the current value of the key as an argument and should return the updated value.

#### `next(callback: Function, key?: string)`

-   Executes a callback function with the current value of the specified key or the entire store if no key is provided.

#### `subscribe(key: string, subscriber: Function)`

-   Subscribes a function to changes in the value associated with the specified key. The subscriber function will be called whenever the value of the key changes.

#### `unsubscribe(key: string, subscriber: Function)`

-   Unsubscribes a function from changes in the value associated with the specified key.

#### `removeSubscribers(key: string)`

-   Removes all subscribers for the specified key.

#### `clearCache()`

-   Clears the cache associated with the current store.

#### `dropStore()`

-   Removes the current store and all associated subscribers and cache.

### Properties

-   `_host`: A boolean flag indicating whether the current instance of the store is hosting a main store.
-   `_key`: The key of the main store hosted by the store.
-   `_oldData`: The previous value of the data associated with the current key.

### Internal Functions

-   `flush()`: Resets the `_key` and `_oldData` properties if the store is not hosting a main store.
-   `getKey(key: string)`: Returns the key within the store hierarchy based on the provided key.
-   `has(key: string)`: Checks if the store contains the specified key.

### Usage

```typescript
// Example usage of the store function
const myStore = store(myStore, options);

// Accessing store values
const value = myStore.get('key');

// Updating store values
myStore.update('key', (oldValue) => newValue);

// Subscribing to store changes
myStore.subscribe('key', (newValue, oldValue) => {
	// Handle store change
});

// Unsubscribing from store changes
myStore.unsubscribe('key', subscriberFunction);

// Dropping the store
myStore.dropStore();
```

### Note

-   This documentation assumes the existence of certain external functions and variables (`createState`, `_stores`, `_subscribersMap`, `getNestedValue`, `setNestedValue`, `handleCacheOfStore`, `_cachedStoresMap`, `getCacheKey`, `deepCloneDbValue`, `getValue`, `onDestroy`, `removeSubscriber`). These should be defined elsewhere in the codebase.
-   The implementation of some functions, such as `has` and `getKey`, relies on these external functions and variables.
