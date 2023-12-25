<script lang="ts">
	import { createStores } from '$lib/db.svelte.js';

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

	type Stores = {
		test: one['state'];
		tes2: two['state'];
	};

	const store = createStores<Stores>([
		{
			name: 'test',
			state: {
				foo: {
					bar: {
						baz: 'hello'
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

	const res = store.get('test.foo').value();
	console.log(res);

	store.addSubscriber('tes2.*', (value, oldValue) => {
		console.log(value, oldValue);
	});

	store.writeUpdate('test.foo.bar.baz', () => 'hi');

	console.log(store.getValue('tes2.fo.bar.ba'));

	setInterval(() => {
		store.writeUpdate('tes2.fo.bar.ba', (value) => value + 1);
	}, 1000);

	store.addSubscriber('tes2.fo.bar.ba', (value, oldValue) => {
		console.log(value, oldValue);
	});
</script>

<h1>{store.$value['tes2']['fo']['bar']['ba']}</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<h1>{store.getValue('tes2.fo.bar.ba')}</h1>
