To provide a more detailed explanation and additional examples of cache adapters, let's explore how cache adapters can be implemented using different storage mediums and scenarios. Cache adapters play a crucial role in enhancing application performance by efficiently managing the retrieval and storage of state data. Below, we'll cover examples using LocalStorage, IndexedDB, and a custom API as storage mediums.

### 1. LocalStorage Cache Adapter

The `localStorageAdapter` example demonstrates a basic implementation using the browser's LocalStorage. This adapter is suistore for small amounts of data that need to be persisted across browser sessions.

#### Detailed Implementation:

```typescript
const localStorageAdapter = {
	getFromCache: async <U>(key: string): Promise<U | undefined> => {
		const data = localStorage.getItem(key);
		return data ? JSON.parse(data) : undefined;
	},
	setToCache: (key: string, data: any): void => {
		localStorage.setItem(key, JSON.stringify(data));
	},
	deleteFromCache: (key: string): void => {
		localStorage.removeItem(key);
	}
};
```

#### Usage Example:

```typescript
const settingsStore = createStore(
	{
		name: 'settings',
		state: { theme: 'dark', notifications: true }
	},
	{
		cache: {
			adapter: localStorageAdapter
		}
	}
);
```

### 2. IndexedDB Cache Adapter

For larger datasets or more complex data structures, IndexedDB provides a more robust solution. Below is an example of an IndexedDB cache adapter.

#### Detailed Implementation:

```typescript
const indexedDBAdapter = {
	db: null,
	async init() {
		if (!this.db) {
			this.db = await idb.openDB('MyAppStore', 1, {
				upgrade(db) {
					db.createObjectStore('store', { keyPath: 'key' });
				}
			});
		}
	},
	getFromCache: async <U>(key: string): Promise<U | undefined> => {
		await this.init();
		return this.db.transaction('store').objectStore('store').get(key);
	},
	setToCache: async (key: string, data: any): Promise<void> => {
		await this.init();
		const tx = this.db.transaction('store', 'readwrite');
		tx.objectStore('store').put({ key, data });
		await tx.done;
	},
	deleteFromCache: async (key: string): Promise<void> => {
		await this.init();
		const tx = this.db.transaction('store', 'readwrite');
		tx.objectStore('store').delete(key);
		await tx.done;
	}
};
```

#### Usage Example:

```typescript
const userPreferencesStore = createStore(
	{
		name: 'userPreferences',
		state: { language: 'en', accessibilityOptions: { highContrast: false } }
	},
	{
		cache: {
			adapter: indexedDBAdapter
		}
	}
);
```

### 3. Custom API Cache Adapter

In some scenarios, you might want to cache state data on a remote server. This example demonstrates how to implement a cache adapter that interacts with a custom API.

#### Detailed Implementation:

```typescript
const apiCacheAdapter = {
	getFromCache: async <U>(key: string): Promise<U | undefined> => {
		try {
			const response = await fetch(`https://example.com/api/cache/${key}`);
			if (response.ok) {
				return response.json();
			}
		} catch (error) {
			console.error('Failed to get from cache:', error);
		}
		return undefined;
	},
	setToCache: async (key: string, data: any): Promise<void> => {
		try {
			await fetch(`https://example.com/api/cache/${key}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
		} catch (error) {
			console.error('Failed to set cache:', error);
		}
	},
	deleteFromCache: async (key: string): Promise<void> => {
		try {
			await fetch(`https://example.com/api/cache/${key}`, {
				method: 'DELETE'
			});
		} catch (error) {
			console.error('Failed to delete from cache:', error);
		}
	}
};
```

#### Usage Example:

```typescript
const sessionStore = createStore(
	{
		name: 'session',
		state: { token: 'abc123', user: { id: 1, name: 'John Doe' } }
	},
	{
		cache: {
			adapter: apiCacheAdapter
		}
	}
);
```

### Conclusion

Cache adapters are a versatile tool in state management, allowing applications to efficiently manage state data across different storage mediums. By abstracting the caching logic into adapters, developers can easily switch between LocalStorage, IndexedDB, remote APIs, or any other storage solution without changing the core logic of their state management system. This flexibility ensures that applications can be optimized for performance, scalability, and user experience.
