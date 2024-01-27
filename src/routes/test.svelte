<script lang="ts">
	import { createStores, createStore, useStore } from '$lib/db.svelte.js';

	const tes = useStore<Stores['tes2']>('tes2');

	tes.addSubscriber('fo.bar.ba', (val) => {
		console.log('val - ', val);
	});
</script>

<h1>{tes.$value.fo.bar.ba}</h1>
