import { idbAdapter } from '$lib/cache-adapters/index.js';
import { createStore } from '$lib/stores/basic.js';

export type Todo = {
	id: ReturnType<typeof crypto.randomUUID>;
	title: string;
	status: 'completed' | 'active';
};

type State = {
	todos: Todo[];
	index: number;
};

const getNewState = (): State => ({
	todos: [],
	index: 0
});

export const todosStore = createStore(
	'todos',
	getNewState(),
	{
		getters: {
			getTodos: (state) => state.todos,
			getIndex: (state, i: number) => state.index + i
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
			},
			reset(s) {
				s = getNewState();
			}
		}
	},
	{
		cache: {
			adapter: idbAdapter
		}
	}
);
