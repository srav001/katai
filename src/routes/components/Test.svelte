<script lang="ts">
	import { createWritable } from '$lib/stores/writable.svelte.js';
	import { todosStore } from '../stores.js';

	const tes = createWritable({
		counter: 1,
		a: {
			b: {
				c: {
					count: 0
				}
			}
		}
	});

	// setInterval(() => {
	// 	// console.clear();
	// 	console.log('\nincremented');
	// 	tes.update((state) => {
	// 		state.a.b.c.count += 1;
	// 		return state;
	// 	});
	// }, 5000);

	todosStore.$subscribe([(s) => s.todos], ([todos]) => {
		console.log('sub - ', $state.snapshot(todos));
	});

	$effect(() => {
		console.log('$effect');
		console.log(todosStore.getIndex(1));
		console.log({ ...todosStore.res.$value });
		console.log(todosStore.getTodos());

		console.log('\n');
	});

	function addTodo() {
		todosStore.addTodo({
			id: crypto.randomUUID(),
			title: 'test - '.concat(Date.now().toString()),
			status: 'active'
		});
	}
</script>

<h2>{tes.get().counter}</h2>
<button onclick={addTodo}>Add Todo</button>
<pre>{JSON.stringify(todosStore.res.$value, null, 2)}</pre>

<button onclick={todosStore.increment}>INDEX {todosStore.getIndex(1)}</button>

<button onclick={todosStore.reset}>Reset</button>
