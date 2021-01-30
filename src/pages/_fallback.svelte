<script>
	import Footer from '$/Footer.svelte'

	let footerHeight

</script>

<div class="image" style={`height: calc(100% - ${footerHeight}px);`}>
	<br><br><br><br>
	<h1>Nous ne trouvons pas ce que vous cherchez</h1>
</div>

<Footer bind:offsetHeight={footerHeight}/>


<svelte:head>
	<style>
		html, body, #routify-app, main {
			height: 100%;
		}
	</style>

</svelte:head>

<style>

	.image {
		text-transform: uppercase;
		text-align: center;
		color: #fff;
		background: url('/images/forest-720.png');
		background-position-x: center;
		background-size: cover;
	}

</style>