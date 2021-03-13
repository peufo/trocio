<script>
	import { tick } from 'svelte'
	import { afterPageLoad, page } from '@roxi/routify'
	import { MaterialApp, Button } from 'svelte-materialify'
	import Head from '$/Head.svelte'
	import Footer from '$/Footer.svelte'
	import FadeDecorator from '$/FadeDecorator.svelte'
	import { isDarkTheme } from '$/stores.js'

	let headHeight
	let footerHeight
	let totalHeight
	let mainHeight

	const themes = ['light', 'dark']

	$afterPageLoad(loadHeight)
	
	async function loadHeight() {
		totalHeight = 0
		await tick()
		totalHeight = document.getElementsByTagName('HTML')[0].scrollHeight
	}

	$: {
		mainHeight = totalHeight - headHeight
		if ($page.meta.isFooterDisplay) mainHeight -= footerHeight
	}

</script>

<svelte:window on:resize={loadHeight}/>

<div style={`min-height: ${totalHeight}px;`}>
	<MaterialApp theme={themes[+$isDarkTheme]}>
		
		<Head bind:offsetHeight={headHeight}/>
	
		<div style={`min-height: ${mainHeight}px;`}>
			<slot decorator={FadeDecorator} scoped={{headHeight, footerHeight}}/>
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

