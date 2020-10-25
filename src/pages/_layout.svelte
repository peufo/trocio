
<script>
	import Head from 'Head.svelte'
	import FadeDecorator from 'FadeDecorator.svelte'

	let headHeight

</script>

<Head bind:offsetHeight={headHeight}/>

<div style={`height: calc(100% - ${headHeight}px)`}>
	<slot decorator={FadeDecorator} scoped={{headHeight}}/>
</div>

<svelt:head>
	<style>
		html, body, #routify-app {
			height: 100%;
		}
	</style>
</svelt:head>
