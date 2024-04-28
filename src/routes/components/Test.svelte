<script lang="ts">
	import { createWritable } from '$lib/stores/writable.svelte.js';

	const tes = createWritable({
		counter: 1
	});

	tes.set({ counter: 101 });

	setInterval(() => {
		// console.clear();
		console.log('\nincremented');
		tes.update((state) => {
			state.counter += 1;
			return state;
		});
	}, 2000);

	tes.subscribe((state) => {
		console.log('writable store', state);
	});
</script>

<h2>{tes.get().counter}</h2>
