<script>
	import { MaterialApp, Button } from 'svelte-materialify'
	import Head from '$/Head.svelte'
	import FadeDecorator from '$/FadeDecorator.svelte'
	import { isDarkTheme } from '$/stores.js'

	let headHeight

	const themes = ['light', 'dark']

</script>

<MaterialApp theme={themes[+$isDarkTheme]} style="height: 100%;">
	
	<Head bind:offsetHeight={headHeight}/>

	<slot decorator={FadeDecorator} scoped={{headHeight}}/>

	<Button icon class="toggleTheme" on:click={() => $isDarkTheme = !$isDarkTheme}>
		{#if $isDarkTheme}
			<i class="fas fa-sun"></i>
		{:else}
			<i class="fas fa-moon"></i>
		{/if}
	</Button>

</MaterialApp>

<style global>
	html, body, #routify-app {
		height: 100%;
	}

	.toggleTheme {
		position: fixed!important;
		right: 5px;
		bottom: 5px;
	}

</style>

