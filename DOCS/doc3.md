## ❗️ In Development ❗️

The project is still in development. Hoping to release it right before Svelte 5 release. You can find usable examples in `src/routes/+page.svelte`.

# katai

Kaṭai (meaning store in Tamil) is a simple and lightweight store implementation for Svelte 5.

The basics of Katai is a few primitives that can be used to build any type of store. You can also build the store type you need with the help of these primitives. We also provide a few pre-built variations to choose from the Stores options. Whichever feels the most suitable can be used.

We do not wish to restrict you to a particular pattern for all your stores. You can copy the one of the current stores implementation as a base and build from on top it.

## Primitives

### createStore

The function `createStore` creates a primitive store with a specified name and initial state.

- @param {string} storeName - The `storeName` parameter is a string that represents the name of the store being created. It is a required parameter for creating a new store.
- @param {InferedState} storeState - The `storeState` parameter in the `createStore` function represents the initial state or value that will be stored in the created store. It is the data that the store will manage and provide access to.
- @param {StoreOptions} [options] - The `options` parameter in the `createStore` function is an optional parameter that allows you to provide additional configuration options for creating the store. It is of type `StoreOptions`, which likely contains properties or settings that can be used to customize the behavior of the store creation process like adding cache adapters.
- @returns A PrimitiveStore object with the store name and a getter function for the store value.

#### EXAMPLE

```ts
export const counterCoreStore = createStore('test', {
  counter: 0
});

// Returns
PrimitiveStore<{
  counter: number;
}>;
```

### get

The `get` function takes a store and a derivation function, and returns a getter function that applies the derivation function to the store's value.

- @param store - `PrimitiveStore<T>` is a generic type representing a store that holds a value of type `T`. It seems like the `store` parameter is expected to be an instance of this `PrimitiveStore` type.
- @param derivation - The `derivation` parameter is a function that takes the current state of type `T` as input and returns a value of type `U`. It is used to derive a new value based on the current state stored in the `PrimitiveStore`.
- @returns A `Getter<U>` function is being returned. This function takes no arguments and returns a value of type `U`. The value returned is the result of applying the `derivation` function to the `store.value`.

### update

The function `update` takes a store, a mutator function, and a payload, and updates the store's value using the mutator function while handling caching if applicable.

- @param store - The `store` parameter is a PrimitiveStore object that holds a value of type T.
- @param mutator - The `mutator` parameter is a function that takes the current state of the store (`T`) and a payload of type `C`, and returns a new state of type `U`. It is used to update the state of the store based on the provided payload.
- @returns The `update` function returns an `Updater` function that takes a value of type `C` as an argument.

### subscribe

The `subscribe` function allows for subscribing to a primitive store with specified subscribers and an effect to be executed.

- @param store - The `store` parameter is a PrimitiveStore that holds the state of type T.
- @param subscribers - Subscribers are functions that subscribe to changes in the store's state. They are typically used to extract specific pieces of state from the store and react to changes in those pieces of state.
- @param effect - The `effect` parameter in the `subscribe` function is a function that takes a `MapSources` object as its argument and performs some action based on the states provided in the `MapSources` object.
- @returns The `subscribe` function returns a cleanup function that can be used to unsubscribe the effect and remove it from the list of subscribers.

#### EXAMPLE

```ts
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

The function `createBasicStore` creates a basic store with state, getters, and actions based on the provided options.

- @param {string} storeName - The `storeName` parameter is a string that represents the name of the store being created.
- @param options - The `options` parameter in the `createBasicStore` function is an object that contains the following properties:
- @param {StoreOptions} [settings] - The `settings` parameter in the `createBasicStore` function is an optional parameter of type `StoreOptions`. It allows you to provide additional settings or configurations for the store creation process. These settings can include options such as the store's persistence mechanism using cache adapters.
- @returns The `createBasicStore` function returns an object of type `BasicStore<S, G, A>`, which includes the state, getters, actions, and additional methods like `clearCache` and `subscribe`.

#### EXAMPLE

```ts
const newStore = createBasicStore('tester', {
  state: {
    counter: 0,
    count: 0
  },
  getters: {
    getCounter: (state) => state.counter,
    getCount: (state) => String(state.count)
  },
  actions: {
    updateCounter: (state, payload: number) => {
      state.counter += payload;
    },
    updateCount: (state, payload: number) => {
      state.count += payload;
    }
  }
});

const interval = setInterval(() => {
  newStore.updateCounter(1);
}, 2000);

// cleanup
onDestroy(() => {
  clearInterval(interval);
});

newStore.subscribe([(state) => state.counter], (states) => {
  console.log('newStore', states[0]);
});
```

### Writable Store

The `createWritable` function creates a writable store with initial value and provides methods for getting, setting, updating, subscribing to changes, and clearing cache.

- @param {T} initalValue - The `initalValue` parameter is the initial value that will be stored in the writable store. It should be an object of type `T`, which extends `Record<string, any>`. This initial value will be used as the starting value for the store.
- @param storeName - The `storeName` parameter is a string that represents the name of the store where the data will be stored. If no `storeName` is provided, a random string will be generated for the store name.
- @param {StoreOptions} [storeOptions] - The `storeOptions` parameter in the `createWritable` function is an optional parameter that allows you to specify additional options for the store creation. These options can include configuration settings or options specific to the underlying store implementation. If provided, these options will be used when creating the store using the `create
- @returns An object is being returned with the following properties:
- - get: a function that retrieves the current value from the store
- - set: a function that updates the value in the store
- - update: a function that takes a callback to update the value in the store
- - subscribe: a function that subscribes to changes in the store and calls a subscriber function
- - clearCache: a function that
