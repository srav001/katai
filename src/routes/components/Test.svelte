<script lang="ts">
	import { createWritable } from '$lib/stores/writable.svelte.js';
	import { todosStore } from '../stores.js';

	console.log(todosStore);
	console.clear();

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

	setInterval(() => {
		// console.clear();
		console.log('\nincremented');
		tes.update((state) => {
			state.a.b.c.count += 1;
			return state;
		});
	}, 5000);

	tes.subscribe((state) => {
		console.log('writable store', state);
	});
</script>

<h2>{tes.get().counter}</h2>
