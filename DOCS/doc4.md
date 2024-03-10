# Documentation for `createBasicStore` Function

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

## Usage Example

```typescript
// Define the initial state, getters, and actions for a simple counter store.
const counterOptions = {
    state: { count: 0 },
    getters: {
        doubleCount: (state) => state.count * 2,
    },
    actions: {
        increment: (state) => ({ count: state.count + 1 }),
        decrement: (state) => ({ count: state.count - 1 }),
    },
};

// Create the counter store.
const counterStore = createBasicStore('counterStore', counterOptions);

// Use the store's methods.
console.log(counterStore.doubleCount()); // Output: 0 (double of initial count)
counterStore.increment();
console.log(counterStore.doubleCount()); // Output: 2 (double of updated count)
```

This example demonstrates how to create a basic store for managing a counter's state, including incrementing and decrementing actions, and a getter for computing the double of the current count.