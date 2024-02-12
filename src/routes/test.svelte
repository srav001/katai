<script lang="ts">
	import { useStore } from '../../dist/index.js';

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

	const tes = useStore<two>('tes2');

	tes.subscribe('fo.bar.*', (val) => {
		console.log('subscribe - ', val);
	});
</script>

<h3>{tes.$value.fo.bar.ba}</h3>
