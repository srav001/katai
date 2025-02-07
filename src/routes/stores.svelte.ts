import { localStorageAdapter } from '$lib/cache-adapters/index.js';
import { createStore } from '$lib/stores/index.js';

export type Todo_id = ReturnType<typeof crypto.randomUUID>;

export type Todo = {
	id: Todo_id;
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

const samplePromise = () =>
	new Promise<State>((resolve) =>
		setTimeout(
			() =>
				resolve({
					todos: [
						{
							id: crypto.randomUUID(),
							title: 'test - '.concat(Date.now().toString()),
							status: 'active'
						},
						{
							id: crypto.randomUUID(),
							title: 'test - '.concat(Date.now().toString()),
							status: 'active'
						},
						{
							id: crypto.randomUUID(),
							title: 'test - '.concat(Date.now().toString()),
							status: 'active'
						},
						{
							id: crypto.randomUUID(),
							title: 'test - '.concat(Date.now().toString()),
							status: 'active'
						},
						{
							id: crypto.randomUUID(),
							title: 'test - '.concat(Date.now().toString()),
							status: 'active'
						}
					],
					index: 2
				}),
			5000
		)
	);

export const todosStore = createStore(
	'todos',
	getNewState(),
	{
		getters: {
			get: (s) => s,
			getTodos: (state) => state.todos,
			getIndex: (state) => state.index
		},
		computeds: {
			res1(state) {
				console.log('running computeds');
				return state.index === 0 ? state.todos[0]?.id : state.todos[state.index - 1]?.id;
			}
		},
		query: {
			loader: {
				fn: samplePromise
			}
		},
		actions: {
			addTodo(state, todo: Todo) {
				state.todos.push(todo);
			},
			removeTodo(state, id: Todo_id) {
				state.todos = state.todos.filter((todo) => todo.id !== id);
			},
			toggleTodo(state, id: Todo_id) {
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
			adapter: localStorageAdapter
		}
	}
);
