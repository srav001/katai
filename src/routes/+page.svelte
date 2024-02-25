<script lang="ts">
	import { createStore, useStore, idbAdapter } from '../../dist/index.js';
	import Test from './test.svelte';

	const store = createStore(
		{
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
		},
		{
			cache: {
				adapter: idbAdapter
			}
		}
	);

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

	console.log(store.get('check.one.two.three'));

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

	const tes = useStore<two>('tes2');
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
