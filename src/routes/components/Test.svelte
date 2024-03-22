<script lang="ts">
	import { onDestroy } from 'svelte';
	import { newStore, testStore } from './test.js';
	import { createVirtualStore } from '$lib/stores/virtual-store.js';

	testStore.subscribe([(state) => state.counter], ([value]) => {
		console.log('counter', value);
	});

	const interval = setInterval(() => {
		newStore.updateCounter(1);
		testStore.$value.counter = testStore.$value.counter + 1;
	}, 2000);

	// cleanup
	onDestroy(() => {
		clearInterval(interval);
	});

	const tes = testStore.get((state) => {
		if (state.counter % 2 === 0) {
			return 'even';
		}
		return 'odd';
	});

	newStore.subscribe([(state) => state.counter], (states) => {
		console.log('newStore', states[0]);
	});

	const virtualStore = createVirtualStore(
		{
			a: {
				b: {
					c: {
						d: 1
					}
				}
			}
		},
		'virtualStore'
	);

	virtualStore.get('a.b');
</script>

<h2>{tes()}</h2>

<h2>{newStore.getCounter()}</h2>
