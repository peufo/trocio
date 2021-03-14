<!-- routify:options isFooterDisplay=true -->

<script>
	import { Button } from 'svelte-materialify'

	export let scoped

	$: console.count(scoped)

</script>

<div class="image" style="min-height: {scoped.mainHeight}px;">
	<br><br><br><br>
	<h4>Nous ne trouvons pas ce que vous cherchez</h4>
	<br><br>
	<a href="/">
		<Button>Retour à la page d'accueil</Button>
	</a>
</div>

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