<script lang="ts">
	import { createWritable } from '$lib/stores/writable.js';

	const tes = createWritable({
		counter: 1
	});

	tes.set({ counter: 101 });

	console.log('writable store - ', tes.get().counter);

	setInterval(() => {
		console.log('\nincremented');
		tes.update((state) => {
			state.counter += 1;
			return state;
		});
	}, 1000);

	tes.subscribe((state) => {
		console.log('writable store');
	});
</script>

<h2>{tes.get().counter}</h2>
