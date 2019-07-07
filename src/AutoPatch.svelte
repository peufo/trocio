<script>
	import { troc } from './stores'
	import { onMount, onDestroy } from 'svelte'
	import { getHeader } from './utils'

	export let body = {} 
	export let source = ''
	export let invalid = ''
	export let path = ''
	export let changeFlag = false
	export let trocRefresh = false

	const WAIT_FOR_PATCH = 600
	let waiting
	let onModify = false
	let patched
	let patchCount = 0


	onMount(() => {
		document.getElementById(source).addEventListener('input', testInput)
		document.getElementById(source).addEventListener('click', testClick)
	})


	let firstChangeFlag = true
	$: {
		if (!firstChangeFlag) {
			changeFlag
			change()
			changeFlag = false		
		}
		firstChangeFlag = false
	}

	function testInput(e) {
		if(!e.target.classList.contains('searchUser')) {
			change()
		}
	}

	function testClick(e) {
		if(e.target.classList.contains('patchButton')) {
			change()
		}
	}

	function change() {
		onModify = true
		clearTimeout(waiting)
		if (!invalid) waiting = setTimeout(getPatched, WAIT_FOR_PATCH)
	}

	function getPatched() {
		onModify = false
		patched = patch()
	}

	async function patch() {
		patchCount++
		const res = await fetch(path, getHeader(body, 'PATCH'))
		const json = await res.json()
		patchCount--
		if (res.ok && json.success) {
			if (patchCount == 0 && !onModify) {
				if (trocRefresh) troc.refresh(json.message)
			}
			return 
		}else{
			return Error('Echec de le mise a jour')
		}
	}


</script>

<div class="w3-card w3-padding w3-round">
	{#if !!invalid}
		<i class="fas fa-exclamation-triangle"></i>
		{invalid}
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
		background: white;
		left: 10px;
		bottom: 10px;
	}
</style>