<script lang="ts">
	import { createStores, createStore, useStore } from '$lib/db.svelte.js';

	type one = {
		name: 'test';
		state: {
			foo: {
				bar: {
					baz: string;
				};
			};
		};
	};

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

	console.log(store.getValue('check.one.two'));

	type Stores = {
		test: one['state'];
		tes2: two['state'];
	};
	createStores<Stores>([
		{
			name: 'test',
			state: {
				foo: {
					bar: {
						baz: 'heo'
					}
				}
			}
		} satisfies one,
		{
			name: 'tes2',
			state: {
				fo: {
					bar: {
						ba: 0
					}
				}
			}
		} satisfies two
	]);

	const tes = useStore<Stores['test']>('test');
	console.log(tes.$value.foo);
</script>

<h1>{store.$value.check.one.two.three}</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
