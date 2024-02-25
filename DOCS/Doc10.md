### Module: `localCacheAdapter`

This module provides functions to interact with the local storage for caching data.

#### Functions:

1. **`getFromCache(key: string): Promise<any>`**

   - Description: Retrieves data from the local storage based on the provided key.
   - Parameters:
     - `key`: A string representing the key under which the data is stored in the local storage.
   - Returns: A promise that resolves to the retrieved data or `undefined` if the key does not exist.
   - Example:
     ```typescript
     const data = await getFromCache('myDataKey');
     ```

2. **`setToCache(key: string, value: any): void`**

   - Description: Stores data in the local storage under the provided key.
   - Parameters:
     - `key`: A string representing the key under which the data will be stored in the local storage.
     - `value`: The data to be stored. It can be of any type.
   - Returns: `void`.
   - Example:
     ```typescript
     setToCache('myDataKey', { foo: 'bar' });
     ```

3. **`deleteFromCache(key: string): void`**

   - Description: Deletes data from the local storage based on the provided key.
   - Parameters:
     - `key`: A string representing the key whose associated data needs to be deleted from the local storage.
   - Returns: `void`.
   - Example:
     ```typescript
     deleteFromCache('myDataKey');
     ```

### Module: `idbCacheAdapter`

This module provides functions to interact with IndexedDB for caching data.

#### Functions:

1. **`getFromCache(key: string): Promise<any>`**

   - Description: Retrieves data from IndexedDB based on the provided key.
   - Parameters:
     - `key`: A string representing the key under which the data is stored in IndexedDB.
   - Returns: A promise that resolves to the retrieved data or `{}` if the key does not exist.
   - Example:
     ```typescript
     const data = await getFromCache('myDataKey');
     ```

2. **`setToCache(key: string, value: any): void`**

   - Description: Stores data in IndexedDB under the provided key.
   - Parameters:
     - `key`: A string representing the key under which the data will be stored in IndexedDB.
     - `value`: The data to be stored. It can be of any type.
   - Returns: `void`.
   - Example:
     ```typescript
     setToCache('myDataKey', { foo: 'bar' });
     ```

3. **`deleteFromCache(key: string): void`**

   - Description: Deletes data from IndexedDB based on the provided key.
   - Parameters:
     - `key`: A string representing the key whose associated data needs to be deleted from IndexedDB.
   - Returns: `void`.
   - Example:
     ```typescript
     deleteFromCache('myDataKey');
     ```