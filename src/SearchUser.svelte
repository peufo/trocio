<script>
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	import { fly } from 'svelte/transition'

	export let search = ''
	export let placeholder = 'Chercher un utilisateur'
	export let exepted = []

	//TODO: Transformer pour aussi servire au article
	//1. Utilisé ._id au lieu de .mail
	//2. remplacer user par item
	//3. Utilisé <slot> pour la représentation 


	let users
	let selected = 0
	let listhover = false

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
			search = ''
		}
	}

	function isExepted(user) {
		return exepted.map(e => e.mail).indexOf(user.mail) > -1
	}


	const ENTER = 13, DOWN = 40, UP = 38

	function keydown(e) {
		if (!users) return 
		
		switch (e.which) {
			case ENTER:
				if (selected > -1) {
					users.then(users => select(users[selected]))
				}
				break

			case DOWN:
				e.preventDefault()
				users.then(users => {
					for (var i = selected + 1; i < users.length; i++) {
						if (!isExepted(users[i])) {
							selected = i
							break
						}
					}
				})

				break

			case UP:
				e.preventDefault()
				users.then(users => {
					for (var i = selected - 1; i > -1; i--) {
						if (!isExepted(users[i])) {
							selected = i
							break
						}
					}
				})
				break

			default:
				selected = -1
		}
	}


</script>

<input  bind:value={search}
		on:keydown={keydown}
		type="text" 
		class="w3-input" 
		placeholder="{placeholder}">

{#if search.length > 2}
<div class="w3-border w3-round w3-padding" in:fly="{{y: 50}}">
	
	{#await users}
		<i class="fas fa-circle-notch w3-spin"></i>
		Recherche...
	{:then users}
		{#if users.length}
			<ul class="w3-ul"
				on:mouseenter="{() => {listhover = true; selected = -1}}"
				on:mouseleave="{() => listhover = false}">
				{#each users as user, i}
				<li class="w3-round"
					class:w3-opacity="{isExepted(user)}"
					class:w3-theme-l3="{(selected == i || user.hover) && !isExepted(user)}"
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
	div {
		background: #fff;
		margin-top: 4px;
		box-shadow: 1px 1px 4px grey;
	}

	li {
		cursor: pointer;
	}
	
	li i {
		display: none;
		cursor: pointer;
	}

	li:hover i {
		display: block;
	}

	li i:hover {
		transform:scale(1.2);
		color: red;
	}

</style>