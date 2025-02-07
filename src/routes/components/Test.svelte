<script lang="ts">
	import { createWritable } from '$lib/stores/writable.svelte.js';
	import { todosStore } from '../stores.svelte.js';

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
		console.log('$effect', todosStore.getIndex());
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
<br />

derived - {todosStore.res1.$value}

<button onclick={todosStore.increment}>INDEX {todosStore.getIndex()}</button>
