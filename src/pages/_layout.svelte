
<script>
	import Head from 'Head.svelte'
	import FadeDecorator from 'FadeDecorator.svelte'
</script>

<svelte:head>
	<title>Trocio</title>
</svelte:head>

<Head/>

<main>
	<slot decorator={FadeDecorator} />
</main>