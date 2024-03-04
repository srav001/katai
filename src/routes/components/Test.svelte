<script lang="ts">
	import { onDestroy } from 'svelte';
	import { testStore } from './test.js';

	testStore.subscribe([(state) => state.counter], ([value]) => {
		console.log('counter', value);
	});

	const interval = setInterval(() => {
		testStore.$value.counter = testStore.$value.counter + 1;
	}, 1000);

	// cleanup
	onDestroy(() => {
		clearInterval(interval);
	});

	const tes = testStore.get((state) => state.counter);
</script>

<h2>{tes()}</h2>
