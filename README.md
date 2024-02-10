# katai

## ❗️ In Development ❗️

The project is still in heavy development. Hoping to release it right before Svelte 5 release. You can find usable examples in src/routes/+page.svelte.

Katai (meaning store in Tamil) is a simple state manager for Svelte 5. It builds on top of the familiar APIs of Svelte 3 & 4 stores while offering more functionality.

## createStore

The `createStore` function is used to create a new store. It takes two parameters: `table` and `mainTableKey`.

### Parameters

-   `table` (NewTable<T>): The table object to create the store from.
-   `mainTableKey` (K): The key of the main table.

### Return Value

Returns a `Store` object with several methods to interact with the store's state, including `get`, `set`, `update`, `next`, and `has`.

### Example

```typescript
// Type system examples
const store = createStore({
	name: 'res',
	state: {
		check: {
			one: {
				two: {
					three: 'hello'
				}
			}
		}
	}
});
```

```typescript
const test = store.get('check.one.two');

store.subscribe('check.one.two', (test) => {
	console.log('test - ', test);
});
```

Here typeof `test` will be `{ three: string; }`

```typescript
store.set('check.one.two.three', 0);
```

This will error as `Argument of type 'number' is not assignable to parameter of type 'string'.`

You can subscribe to store changes for `a particular key` or for `deep changes`. When used inside `Svelte` component they will be `unSubscribed(auto-cleaned up)`.

```typescript
store.subscribe('check.one.two', (test) => {
	console.log('test - ', test);
});
// This will only run when two property of one object of check object changes
```

If the value of a key is an POJO then will be able to subscribe deeply with `*` in the key.

```typescript
store.subscribe('check.one.*', (val) => {
	console.log('check.one.* - ', val);
});
// This will run when any change is made to one object and it's children.
```

This is not possible as the value of `three` is `string`

```typescript
// You will get the below error
store.subscribe('check.one.two.three.*', (val) => {
	console.log('check.one.* - ', val);
});
// Argument of type '"check.one.two.three.*"' is not assignable to parameter of type '"" | "check" | "check.*" | "check.one" | "check.one.*" | "check.one.two" | "check.one.two.*" | "check.one.two.three"'
```

## createStores

The `createStores` function is used to create multiple stores at once.

### Parameters

-   `tables` (Tables): An array of tables that you want to create.
-   `options` (UseStoreOptions): Options for creating the stores. If `useCache` is true, the cache will be used to store the data.

### Return Value

Returns a `StoreInstance` object.

### Example

```typescript
type one = {
	name: 'test';
	state: {
		foo: {
			bar: {
				baz: string;
			};
		};
	};
};

type two = {
	name: 'tes2';
	state: {
		fo: {
			bar: {
				ba: number;
			};
		};
	};
};

type Stores = {
	test: one['state'];
	tes2: two['state'];
};

createStores<Stores>([
	{
		name: 'test',
		state: {
			foo: {
				bar: {
					baz: 'heo'
				}
			}
		}
	} satisfies one,
	{
		name: 'tes2',
		state: {
			fo: {
				bar: {
					ba: 0
				}
			}
		}
	} satisfies two
]);
```

## useStore Function

The `useStore` function is used to read and write data to the state of a store.

### Parameters

-   `storeName` (string): The name of the store.

### Return Value

Returns a `StoreInstance` object with several methods to interact with the store's state, including `get`, `update`, `write`, `writeUpdate`, `next`, and `has`.

### Example

```typescript
// Use an existing store
const userStore = useStore<User>('users');

// Use the store's methods
userStore.get('username');
userStore.set('username', 'newUsername');
```

## The `Store` object

Returns a `storeObj` object with the following methods:

-   `get(key, defaultValue)`: Returns the value of the specified key in the store.
-   `set(key, value)`: Sets the value of the specified key. If the key does not exist, an error will be thrown.
-   `update(key, callback)`: Updates the value of the specified key using the provided callback function.
-   `next(callback, key)`: Calls the provided callback function with the value of the specified key.
-   `subscribe(key, subscriber)`: Adds a subscriber function to the specified key.
-   `unsubscribe(key, subscriber)`: Removes a subscriber function from the specified key.
-   `removeSubscribers(key)`: Removes all subscribers from the specified key.
-   `dropStore(tableKey)`: Deletes the specified table from the store.

## Examples

```javascript
// Create a new store
const myStore = createStore({ name: 'myTable', state: { myKey: 'value' } });

// Add a subscriber to a key
myStore.subscribe('myKey', (value, oldValue) => {
	console.log(`Value of myKey changed from ${oldValue} to ${value}`);
});

// Set the value of a key
myStore.set('myKey', 'newValue');

// Output: "Value of myKey changed from undefined to newValue"

// Create a new store
const userStore = createStore({ name: 'users', state: { username: 'value' } });

// Add a subscriber to a key
userStore.subscribe('username', (value, oldValue) => {
	console.log(`Username changed from ${oldValue} to ${value}`);
});

// Set the value of a key
userStore.set('username', 'newUsername');

// Output: "Username changed from undefined to newUsername"

// Update the value of a key
userStore.update('username', (oldValue) => oldValue + '_updated');

// Output: "Username changed from newUsername to newUsername_updated"

// Check if a key exists in the store
console.log(userStore.has('username')); // Output: true

// Get the value of a key
console.log(userStore.get('username').value()); // Output: newUsername_updated

// Remove a subscriber from a key
userStore.unsubscribe('username', subscriberFunction);

// Unsubscribe all subscribers from a key
userStore.removeSubscribers('username');

// Drop a table from the store
userStore.dropStore('users');
```
