<script lang="ts">
	import { type Todo, todosStore } from '../stores.js';

	function removeTodo(id: number) {
		todosStore.update('todos', (todos) => {
			for (const todo of todos) {
				if (todo.id === id) {
					todo.status = 'completed';
				}
			}
			return todos;
		});
	}

	let { todo } = $props<{
		todo: Todo;
	}>();
</script>

<article>
	<header>
		<strong>
			{todo.title}
		</strong>
	</header>
	<p>{todo.status === 'completed' ? 'InProgress' : 'Completed'}</p>
	<footer>
		<button disabled={todo.status === 'completed'} onclick={() => removeTodo(todo.id)}>
			{todo.status === 'completed' ? 'Done' : ' Complete'}
		</button>
	</footer>
</article>
