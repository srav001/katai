<script lang="ts">
	import Test from './components/Test.svelte';

	let show = $state(true);
</script>

<main>
	<article>
		{#if show}
			<Test />
		{/if}
	</article>
</main>
