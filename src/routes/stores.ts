import { localStorageAdapter } from '$lib/cache-adapters/index.js';
import { createBasicStore } from '$lib/stores/basic.js';

export type Todo = {
	id: number;
	title: string;
	status: 'completed' | 'active';
};

export const todosStore = createBasicStore(
	'todos',
	{
		state: {
			todos: [] as Todo[]
		},
		getters: {
			getTodos: (state) => state.todos
		},
		actions: {
			addTodo: (state, todo: Todo) => {
				state.todos.push(todo);
			},
			removeTodo: (state, id: number) => {
				state.todos = state.todos.filter((todo) => todo.id !== id);
			},
			toggleTodo: (state, id: number) => {
				const todo = state.todos.find((todo) => todo.id === id);
				if (todo) {
					todo.status = todo.status === 'completed' ? 'active' : 'completed';
				}
			}
		}
	},
	{
		cache: {
			adapter: localStorageAdapter
		}
	}
);
