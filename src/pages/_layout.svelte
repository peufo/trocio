<script>
	import { page } from '@roxi/routify'
	import { MaterialApp, Button } from 'svelte-materialify'
	import Head from '$/Head.svelte'
	import Footer from '$/Footer.svelte'
	import FadeDecorator from '$/FadeDecorator.svelte'
	import { isDarkTheme } from '$/stores.js'

	const themes = ['light', 'dark']

	let innerHeight 	// Window height
	let headHeight		// Header height
	let mainHeight		// Main content height
	let footerHeight 	// Footer height

	$: {
		mainHeight = innerHeight - headHeight
		if ($page.meta.isFooterDisplay) mainHeight -= footerHeight
	}


</script>

<svelte:window bind:innerHeight/>

<div style={`min-height: ${innerHeight}px;`}>
	<MaterialApp theme={themes[+$isDarkTheme]}>
		
		<Head bind:offsetHeight={headHeight}/>
	
		<div style="min-height: {mainHeight}px;">
			<slot decorator={FadeDecorator} scoped={{headHeight, footerHeight, mainHeight}}/>
		</div>
		
		{#if $page.meta.isFooterDisplay}
			<Footer bind:offsetHeight={footerHeight}/>
		{/if}
		
		<!-- Theme Button-->
		<Button icon class="toggleTheme" on:click={() => $isDarkTheme = !$isDarkTheme}>
			{#if $isDarkTheme}
				<i class="fas fa-sun"></i>
			{:else}
				<i class="fas fa-moon"></i>
			{/if}
		</Button>
	
	</MaterialApp>
</div>

<style global>

	.toggleTheme {
		position: fixed!important;
		right: 5px;
		bottom: 5px;
	}

</style>

