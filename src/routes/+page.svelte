<script lang="ts">
	import { todosStore } from './stores.js';

	let toComplete = $derived(todosStore.get().todos.filter((todo) => todo.status === 'active'));
	let completed = $derived(todosStore.get('todos').filter((todo) => todo.status === 'completed'));

	let newTodoTitle = $state('');
	function addTodo() {
		todosStore.update('todos', (todos) => {
			todos.push({ id: todos.length, title: newTodoTitle, status: 'active' });
			return todos;
		});
		newTodoTitle = '';
	}
</script>

<main>
	<article>
		<h1>TODOS</h1>
		<h6>Active: {toComplete.length} | completed: {completed.length}</h6>

		<form on:submit={addTodo}>
			<input name="title" type="text" placeholder="Enter a new todo" bind:value={newTodoTitle} />
			<button type="submit">Add Todo</button>
		</form>
		{#each toComplete as todo}
			<article>{todo.title}</article>
		{/each}
	</article>
</main>
