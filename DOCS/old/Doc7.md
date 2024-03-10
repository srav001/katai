### Module `store.ts`

This module provides functionality for managing stores and interacting with their states.

#### Types

- `GenericArray`: Represents an array containing elements of any type.
- `GenericObject`: Represents an object with string keys and values of any type.
- `GetDeepValue`: A utility type for retrieving nested values from objects.
- `PathInto`: A utility type for accessing nested properties in an object.
- `PathIntoDeep`: A utility type for accessing deeply nested properties in an object.
- `PrimitiveTypes`: Represents primitive JavaScript types such as string, number, boolean, etc.
- `TypesOfState`: Represents the types allowed in a store's state.
- `BasicStore<T>`: Represents the basic structure of a store, containing a name and a state.
- `CacheOptions`: Represents options for caching data.
- `StoreOptions<T>`: Represents options for configuring a store.
- `Subscriber<T, U>`: Represents a function that subscribes to changes in a store's state.
- `SubscribersMap<T>`: Represents a map of subscribers for different keys in a store.
- `StoreInstance<T>`: Represents an instance of a store.

#### Functions

##### `createState<T extends BasicStore>(store: T, options?: StoreOptions): T`

Creates a store for the given `store` object and caches its state if caching is enabled.

- `store`: The store object to create.
- `options`: Options for configuring the store, including caching options.

##### `storeInstance<InferedState = undefined>(store?: BasicStore<InferedState>, mainStore?: string, options?: StoreOptions): StoreInstance<InferedState>`

Creates an instance of a store with methods to interact with its state.

- `store`: The store object to create an instance for.
- `mainStore`: The name of the main store.
- `options`: Options for configuring the store instance.

##### `createStore<T>(store: BasicStore<T>, options?: StoreOptions): StoreInstance<T>`

Creates a store with the provided `store` object and options.

- `store`: The store object to create.
- `options`: Options for configuring the store.

##### `useStore<T extends BasicStore<Record<string, unknown>>>(storeName: string): StoreInstance<T['state']>`

Returns an instance of a store with the specified name.

- `storeName`: The name of the store to use.

#### Example Usage

```typescript
import { createStore, useStore, idbAdapter } from '../../dist/index.js';

// Create a store
const store = createStore(
    {
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
    },
    {
        cache: {
            adapter: idbAdapter
        }
    }
);

// Use the store
const instance = useStore('res');
```

This module provides functionality for managing stores, caching their states, and interacting with their data.