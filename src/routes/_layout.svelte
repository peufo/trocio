<script context="module">
/*
    export async function preload(page, { user }) {
        return { user }
	}
	*/
</script>

<script>
	import Head from '../components/Head.svelte'
</script>

<svelte:head>
	<title>Trocio</title>
</svelte:head>

<Head/>

<main>
	<slot></slot>
</main>