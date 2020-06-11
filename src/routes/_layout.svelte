<script context="module">
    export async function preload(page, { user }) {
        return { user }
    }
</script>

<script>
	import Head from '../components/Head.svelte'
	export let user
</script>

<svelte:head>
	<title>Trocio</title>
</svelte:head>

<Head {user}/>

<main>
	<slot></slot>
</main>