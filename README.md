# svelte-virtual-store

GitHub Copilot: # Documentation

## createStore Function

The `createStore` function is used to create a new store. It takes two parameters: `table` and `mainTableKey`.

### Parameters

- `table` (NewTable<T>): The table object to create the store from.
- `mainTableKey` (K): The key of the main table.

### Return Value

Returns a `Store` object with several methods to interact with the store's state, including `get`, `update`, `write`, `writeUpdate`, `next`, and `has`.

### Example

```typescript
// Create a new store
const userStore = createStore<User>({ name: 'users' });

// Use the store's methods
userStore.get('username');
userStore.update('username', 'newUsername');
```

## createStores Function

The `createStores` function is used to create a store for each table and a state to store map for each table.

### Parameters

- `tables` (Tables<S>): An array of tables that you want to create.
- `options` (UseStoreOptions): Options for creating the stores. If `useCache` is true, the cache will be used to store the data.

### Return Value

Returns a `StoreInstance` object.

### Example

```typescript
// Create multiple stores
const stores = createStores<User>([{ name: 'users' }, { name: 'products' }], { useCache: true });

// Use the stores' methods
stores.users.get('username');
stores.products.get('productId');
```

## useStore Function

The `useStore` function is used to read and write data to the state of a store.

### Parameters

- `storeName` (string): The name of the store.

### Return Value

Returns a `StoreInstance` object with several methods to interact with the store's state, including `get`, `update`, `write`, `writeUpdate`, `next`, and `has`.

### Example

```typescript
// Use an existing store
const userStore = useStore<User>('users');

// Use the store's methods
userStore.get('username');
userStore.update('username', 'newUsername');
```

Please note that these examples assume that the necessary helper functions (`createState`, `handleCache`, `Store`) and types (`NewTable`, `BasicTable`, `StoreOptions`, `StoreInstance`) are defined in the same scope as the `createStore`, `createStores`, and `useStore` functions.

## Return Value

Returns a `storeObj` object with the following methods:

- `get(key, defaultValue)`: Returns a getter object for the specified key. If the key does not exist, the `defaultValue` will be used.
- `getValue(key)`: Returns the value of the specified key in the store.
- `update(key, callback)`: Updates the value of the specified key using the provided callback function.
- `writeUpdate(key, callback)`: Similar to `update`, but writes the updated value back to the store.
- `next(callback, key)`: Calls the provided callback function with the value of the specified key.
- `addSubscriber(key, subscriber)`: Adds a subscriber function to the specified key.
- `removeSubscriber(key, subscriber)`: Removes a subscriber function from the specified key.
- `unSubscribe(key)`: Removes all subscribers from the specified key.
- `set(key, value)`: Sets the value of the specified key. If the key does not exist, an error will be thrown.
- `dropStore(tableKey)`: Deletes the specified table from the store.

## Example

```javascript
// Create a new store
const myStore = Store({ name: 'myTable' });

// Add a subscriber to a key
myStore.addSubscriber('myKey', (value, oldValue) => {
	console.log(`Value of myKey changed from ${oldValue} to ${value}`);
});

// Set the value of a key
myStore.set('myKey', 'newValue');

// Output: "Value of myKey changed from undefined to newValue"
```

```javascript
// Create a new store
const userStore = Store({ name: 'users' });

// Add a subscriber to a key
userStore.addSubscriber('username', (value, oldValue) => {
	console.log(`Username changed from ${oldValue} to ${value}`);
});

// Set the value of a key
userStore.set('username', 'newUsername');

// Output: "Username changed from undefined to newUsername"

// Update the value of a key
userStore.update('username', (oldValue) => oldValue + '_updated').write(() => {});

// Output: "Username changed from newUsername to newUsername_updated"

// Check if a key exists in the store
console.log(userStore.has('username')); // Output: true

// Get the value of a key
console.log(userStore.get('username').value()); // Output: newUsername_updated

// Remove a subscriber from a key
userStore.removeSubscriber('username', subscriberFunction);

// Unsubscribe all subscribers from a key
userStore.unSubscribe('username');

// Drop a table from the store
userStore.dropStore('users');
```
