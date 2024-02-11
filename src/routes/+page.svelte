<script lang="ts">
	import { createStore, useStore } from '$lib/db.svelte.js';
	import Test from './test.svelte';

	type two = {
		name: 'tes2';
		state: {
			fo: {
				bar: {
					ba: number;
				};
			};
		};
	};

	const store = createStore({
		name: 'res',
		state: {
			check: {
				one: {
					two: {
						three: 'hello'
					}
				}
			}
		}
	});

	console.log(store.get('check.one.two'));

	type Stores = {
		tes2: two['state'];
	};
	createStore({
		name: 'tes2',
		state: {
			fo: {
				bar: {
					ba: 0
				}
			}
		}
	} satisfies two);

	const tes = useStore<Stores['tes2']>('tes2');
	console.log(' fo.bar.ba - ', tes.get('fo.bar.ba'));

	setInterval(() => {
		console.log('interval ');
		tes.update('fo.bar.ba', (val) => {
			return val + 1;
		});
	}, 2000);

	let tester = $state(true);
</script>

<h1>{store.$value.check.one.two.three}</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<button on:click={() => (tester = !tester)}>Toggle</button>
{#if tester === true}
	<Test />
{/if}
