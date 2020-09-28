<script>
	import Footer from 'Footer.svelte'

</script>

<main class="w3-center">
	<br><br><br><br>
	<h1>Nous ne trouvons pas ce que vous cherchez</h1>
</main>

<Footer/>

<svelte:head>
	<style>
		html, body, #routify-app {
			height: 100%;
		}
		#main-content, #main-content>div {
			height: calc(100% - 100px);
		}
	</style>
</svelte:head>

<style>

	main {
		height: 100%;
		text-transform: uppercase;
		color: #fff;
		background: url('/images/forest-720.png');
		background-position-x: center;
		background-size: cover;
	}

</style>