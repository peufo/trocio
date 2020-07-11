<script>
	export let status
</script>

<style>
	h1, p {
		margin: 0 auto;
	}
	h1 {
		font-size: 2.8em;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}
	p {
		margin: 1em auto;
	}
	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}

	img {
		position: fixed;
		bottom: 0px;
		right: 15%;
	}

</style>

<svelte:head>
	<title>{status}</title>
</svelte:head>


<img src="/images/John_Travoltat_confused.gif" alt="John Travoltat confused">



