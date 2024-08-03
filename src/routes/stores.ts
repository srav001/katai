import { idbAdapter } from '$lib/cache-adapters/index.js';
import { createStore } from '$lib/stores/basic.js';

export type Todo = {
	id: string;
	title: string;
	status: 'completed' | 'active';
};

export const todosStore = createStore(
	'todos',
	{
		state: {
			todos: [
				{
					id: crypto.randomUUID(),
					title: 'test',
					status: 'active'
				}
			] as Todo[],
			index: 0
		},
		getters: {
			getTodos: (state) => state.todos,
			getIndex: (state) => state.index
		},
		computeds: {
			res: (state) => state.todos[state.index]
		},
		actions: {
			addTodo(state, todo: Todo) {
				console.log('add todo');
				state.todos.push(todo);
			},
			removeTodo(state, id: ReturnType<typeof crypto.randomUUID>) {
				state.todos = state.todos.filter((todo) => todo.id !== id);
			},
			toggleTodo(state, id: ReturnType<typeof crypto.randomUUID>) {
				const todo = state.todos.find((todo) => todo.id === id);
				if (todo) {
					todo.status = todo.status === 'completed' ? 'active' : 'completed';
				}
			},
			increment(state) {
				state.index++;
			}
		}
	},
	{
		cache: {
			adapter: idbAdapter
		}
	}
);
