<script>
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	import { fly } from 'svelte/transition'

	export let search = ''
	export let exepted = []
	$: console.log(exepted)

	let users = []

	async function searchUser() {
		const res = await fetch(`/users/search/${search}`)
		const json = await res.json()
		if (res.ok)	return json
		else Error(res.message)
	}

	$: if (search.length > 2) users = searchUser()

	function select(user) {
		if (!isExepted(user)) {
			dispatch('select', user)
		}
	}

	function isExepted(user) {
		return exepted.map(e => e.mail).indexOf(user.mail) > -1
	}

</script>

{#if search.length > 2}
<div class="w3-border w3-round w3-padding" in:fly="{{y: 50}}">
	
	{#await users}
		<i class="fas fa-circle-notch w3-spin"></i>
		Recherche...
	{:then users}
		{#if users.length}
			<ul class="w3-ul">
				{#each users as user}
				<li class="w3-round" 
					class:w3-theme-l3="{user.hover && !isExepted(user)}"
					on:mouseenter="{() => user.hover = true}"
					on:mouseleave="{() => user.hover = false}"
					on:click="{() => select(user)}">
					{user.name}
					<em class="w3-small w3-right">{user.mail}</em>
				</li>
				{/each}
			</ul>

		{:else}
			Aucun résultat pour <b>{search}</b>
		{/if}		
	{:catch error}
		<span class="w3-red">{error}</span>
	{/await}

</div>
{/if}

<style>
	li {
		cursor: pointer;
	}
</style>