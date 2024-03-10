## ❗️ In Development ❗️

The project is still in development. Hoping to release it right before Svelte 5 release. You can find usable examples in `src/routes/+page.svelte`.

<input type="checkbox" checked>
<label>[Virtual Store with Runes](https://github.com/srav001/katai/blob/a9ea77e81d8155bd39d25fc3bffe1412e88f75e1/src/routes/stores.ts#L9) ( Removed to re-implement using new primitives )</label><br>
<input type="checkbox" checked>
<label>Re-factor for Primitves</label><br>
<input type="checkbox" checked>
<label>Add caching support</label><br>
<input type="checkbox" checked>
<label>Add cache adapters</label><br>
<input type="checkbox" checked>
<label>Add Basic Store</label><br>
<input type="checkbox" checked>
<label>Add Writable Store</label><br>
<input type="checkbox">
<label>Add Virtual Store</label><br>
<input type="checkbox">
<label>Sync between tabs</label><br>


# katai

Kaṭai (meaning store in Tamil) is a simple and lightweight store implementation for Svelte 5.

## Contents

- [About](#about)
- [Primitives](#primitives)
- [Stores](#stores)

## About

The basics of Katai is a few primitives that can be used to build any type of store. You can also build the store type you need with the help of these primitives.

We also provide a few pre-built variations to choose from the Stores options. Whichever feels the most suitable can be used.

We do not wish to restrict you to a particular pattern for all your stores. You can copy the one of the current stores implementation as a base and build from on top it.

By using our primitives the stores you create will also get all the features our primitives support like caching with the help of adapters. By default we provide 2 adapters for localStorage and Index DB. 

## Primitives

- [Core Store](#createStore)
- [Getter Function](#getter-function)
- [Updater Function](#updater-function)
- [Subscriber Type](#subscriber-type)
- [Subscribe Function](#subscribe-function)
- [ClearCache Function](#clearcache-function)

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

// Returns
PrimitiveStore<{
  name: string;
  age: number;
}>;
```

### Getter Function

```typescript
function get<T, U>(store: PrimitiveStore<T>, derivation: (state: T) => U): Getter<U>;
```

The `get` function is designed to create a getter function from a store and a derivation function. It applies the derivation function to the store's value, returning a new value of type `U`.

- **Parameters:**

  - `store`: An instance of `PrimitiveStore<T>`.
  - `derivation`: A function that takes the current state of type `T` and returns a value of type `U`.

- **Returns:** A `Getter<U>` function that, when called, returns a value of type `U`.

### Updater Function

```typescript
function update<T, U, C = unknown>(store: PrimitiveStore<T>, mutator: (state: T, payload: C) => U): Updater<C>;
```

The `update` function updates the store's value using a mutator function and a payload. It also handles caching if applicable.

- **Parameters:**

  - `store`: A `PrimitiveStore<T>` object.
  - `mutator`: A function that updates the state of the store based on the provided payload.

- **Returns:** An `Updater<C>` function that takes a payload of type `C`.

### Subscribe Function

```typescript
function subscribe<T, U extends Subscribers<T>>(
  store: PrimitiveStore<T>,
  subscribers: [...U],
  effect: (states: MapSources<U, T>) => void
): () => void;
```

The `subscribe` function allows subscribing to a primitive store with specified subscribers and an effect to be executed.

- **Parameters:**

  - `store`: A `PrimitiveStore<T>`.
  - `subscribers`: An array of subscriber functions.
  - `effect`: A function that performs an action based on the states provided.

- **Returns:** A cleanup function to unsubscribe the effect.

### ClearCache Function

```typescript
function clearCache(storeName: string): void;
```

The `clearCache` function clears the cache for a specific store if it exists.

- **Parameters:**
  - `storeName`: The name of the store to clear from the cache.

This module provides a robust solution for managing state in TypeScript applications, with features like caching and subscription to state changes, enhancing performance and reactivity.

#### EXAMPLE

```typescript
export const test = createStore('test', {
  counter: 0
});

type StoreType = (typeof test)['value'];

export const testStore = {
  get $value() {
    return test.value;
  },
  get: <U extends unknown>(derivation: (val: StoreType) => U) => get(test, () => derivation(test.value)),
  subscribe: <T extends Subscribers<StoreType>>(states: [...T], effect: (states: MapSources<T, StoreType>) => void) =>
    subscribe(test, states, effect)
};

testStore.subscribe([(state) => state.counter], ([value]) => {
  console.log('counter', value);
});

const interval = setInterval(() => {
  testStore.$value.counter = testStore.$value.counter + 1;
}, 2000);

// cleanup
onDestroy(() => {
  clearInterval(interval);
});
```

## Stores

### Basic Store

The `createBasicStore` function is designed to create a basic store structure in TypeScript, facilitating state management in applications. This function is part of a larger library that provides utilities for creating, managing, and interacting with stores. Below is a detailed documentation of the `createBasicStore` function, including its parameters, return type, and usage examples.

## Function Signature

```typescript
function createBasicStore<S extends State, G extends Getters<S>, A extends Actions<S>>(
  storeName: string,
  options: Store<S, G, A>,
  settings?: StoreOptions
): BasicStore<S, G, A>;
```

### Parameters

- `storeName: string`: A string that represents the name of the store being created. This name is used internally for identification and possibly for caching purposes.

- `options: Store<S, G, A>`: An object that specifies the initial state, getters, and actions for the store. The `options` object must conform to the `Store` type, which is a generic type parameterized by the state `S`, getters `G`, and actions `A`.

  - `state: S`: The initial state of the store. It is a record type with keys as `string` or `number` and values of any type.
  - `getters: G`: An object containing getter functions. Each getter function takes the current state as an argument and returns a computed value based on that state.
  - `actions: A`: An object containing action functions. Each action function is responsible for updating the state based on the given payload.

- `settings?: StoreOptions` (Optional): An optional parameter that allows providing additional settings or configurations for the store creation process. These settings can include options such as the store's persistence mechanism using cache adapters.

### Return Type

- `BasicStore<S, G, A>`: The function returns an object of type `BasicStore<S, G, A>`, which includes the state, getters, actions, and additional methods like `clearCache` and `subscribe`. This object provides a simplified interface for interacting with the store, including performing state updates and subscribing to state changes.

### Additional Methods

- `clearCache`: A method that clears the cache associated with the store. Useful for resetting the store's state in scenarios involving caching.

- `subscribe`: A method that allows subscribing to state changes. It takes a set of subscribers and an effect function, which is called whenever the subscribed state changes.

#### Usage Example

```typescript
// Define the initial state, getters, and actions for a simple counter store.
const counterOptions = {
  state: { count: 0 },
  getters: {
    doubleCount: (state) => state.count * 2
  },
  actions: {
    increment: (state) => ({ count: state.count + 1 }),
    decrement: (state) => ({ count: state.count - 1 })
  }
};

// Create the counter store.
const counterStore = createBasicStore('counterStore', counterOptions);

// Use the store's methods.
console.log(counterStore.doubleCount()); // Output: 0 (double of initial count)
counterStore.increment();
console.log(counterStore.doubleCount()); // Output: 2 (double of updated count)
```

This example demonstrates how to create a basic store for managing a counter's state, including incrementing and decrementing actions, and a getter for computing the double of the current count.

### Writable Store

The `createWritable` function is designed to create a writable store that allows for managing and tracking state changes in a structured way. It's based on the writable from Svelte.

### Function Signature

```typescript
function createWritable<T extends Record<string, any>>(
  initalValue: T,
  storeName?: string,
  storeOptions?: StoreOptions
): {
  get: () => T;
  set: (val: T) => void;
  update: (callback: (val: T) => T) => void;
  subscribe: (subscriber: (val: T) => void) => void;
  clearCache: () => void;
};
```

### Parameters

- `initalValue: T` - The initial value to be stored. It must be an object that extends `Record<string, any>`. This value serves as the starting point for the store's state.

- `storeName: string` (optional) - A string representing the name of the store. If not provided, a random string will be generated and used as the store name. This name is used for identifying the store uniquely.

- `storeOptions: StoreOptions` (optional) - Additional options for store creation. These options can include configuration settings or options specific to the underlying store implementation. Providing this parameter allows for further customization of the store's behavior.

### Return Value

The function returns an object containing the following properties:

- `get: () => T` - A function that retrieves the current value from the store.

- `set: (val: T) => void` - A function that updates the value in the store with the provided value.

- `update: (callback: (val: T) => T) => void` - A function that takes a callback function as an argument. The callback function is used to update the value in the store based on the current state.

- `subscribe: (subscriber: (val: T) => void) => void` - A function that allows subscribing to changes in the store. The subscriber function is called with the new state whenever the store's value changes.

- `clearCache: () => void` - A function that clears the cache associated with the store name. This is useful for resetting the store's state or when the store is no longer needed.

#### Usage Example

```typescript
interface User {
  id: string;
  name: string;
}

// Creating a writable store for user data
const userStore = createWritable<User>({ id: '123', name: 'John Doe' });

// Subscribing to changes in the user store
userStore.subscribe((currentUser) => {
  console.log('Current user:', currentUser);
});

// Updating the user's name
userStore.update((currentUser) => ({ ...currentUser, name: 'Jane Doe' }));

// Setting a new user
userStore.set({ id: '456', name: 'Alice' });

// Getting the current user
console.log('Current user:', userStore.get());

// Clearing the cache
userStore.clearCache();
```

This documentation provides a comprehensive overview of the `createWritable` function, its parameters, return value, and usage.
