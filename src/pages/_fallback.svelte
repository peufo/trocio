<script>
	import { Button } from 'svelte-materialify'
	import Footer from '$/Footer.svelte'

	let footerHeight

</script>

<div class="image" style={`height: calc(100% - ${footerHeight}px);`}>
	<br><br><br><br>
	<h4>Nous ne trouvons pas ce que vous cherchez</h4>
	<br><br>
	<a href="/">
		<Button class="theme--dark">Retour à la l'acceuil</Button>
	</a>
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