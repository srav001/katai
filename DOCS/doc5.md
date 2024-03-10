# `createWritable` Function Documentation

The `createWritable` function is designed to create a writable store that allows for managing and tracking state changes in a structured way. It's based on the writable from Svelte. 

## Function Signature

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
}
```

## Parameters

- `initalValue: T` - The initial value to be stored. It must be an object that extends `Record<string, any>`. This value serves as the starting point for the store's state.

- `storeName: string` (optional) - A string representing the name of the store. If not provided, a random string will be generated and used as the store name. This name is used for identifying the store uniquely.

- `storeOptions: StoreOptions` (optional) - Additional options for store creation. These options can include configuration settings or options specific to the underlying store implementation. Providing this parameter allows for further customization of the store's behavior.

## Return Value

The function returns an object containing the following properties:

- `get: () => T` - A function that retrieves the current value from the store.

- `set: (val: T) => void` - A function that updates the value in the store with the provided value.

- `update: (callback: (val: T) => T) => void` - A function that takes a callback function as an argument. The callback function is used to update the value in the store based on the current state.

- `subscribe: (subscriber: (val: T) => void) => void` - A function that allows subscribing to changes in the store. The subscriber function is called with the new state whenever the store's value changes.

- `clearCache: () => void` - A function that clears the cache associated with the store name. This is useful for resetting the store's state or when the store is no longer needed.

## Usage Example

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