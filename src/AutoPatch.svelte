<script>
	import { troc } from './stores'
	import { afterUpdate } from 'svelte'
	import { getHeader } from './utils'

	export let body = {}
	export let valid = false
	export let concerne = ''


	let waiting
	let isMounted = false
	let onModify = false
	let patched
	let patchCount = 0

	$: {
		body
		if (isMounted) {
			onModify = true
			clearTimeout(waiting)
			if (valid) waiting = setTimeout(getPatched, 1000)
		}
		isMounted = true
	}

	function getPatched() {
		onModify = false
		patched = patch()
	}

	async function patch() {
		patchCount++
		const res = await fetch(`/trocs/${$troc._id}/${concerne}`, getHeader(body, 'PATCH'))
		const json = await res.json()
		patchCount--
		if (res.ok && json.success) {
			if (patchCount == 0 && !onModify) troc.refresh(json.message)
			return 
		}else{
			return Error('Echec de le mise a jour')
		}
	}


</script>

<div class="w3-small" on:click="{() => console.log(body)}">
	{#if !valid}
		<i class="fas fa-exclamation-triangle"></i>
		Invalide
	{:else if onModify}
		<i class="far fa-edit"></i>
		Modification...	
	{:else}
		{#await patched}
			<i class="fas fa-sync-alt w3-spin"></i>
			Sauvegarde...
		{:then}
			<i class="fas fa-check"></i>
			Sauvegardé
		{:catch error}
			<i class="fas fa-bug"></i>
			{error}
		{/await}
		
	{/if}

</div>

<style>
	div {
		position: absolute;
		left: 10px;
		bottom: 10px;
	}
</style>