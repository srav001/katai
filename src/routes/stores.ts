import { createStore, localStorageAdapter } from '$lib/index.js';

export type Todo = {
	id: number;
	title: string;
	status: 'completed' | 'active';
};

export const todosStore = createStore<{
	todos: Todo[];
}>(
	{
		name: 'todos',
		state: {
			todos: []
		}
	},
	{
		cache: {
			adapter: localStorageAdapter
		}
	}
);
