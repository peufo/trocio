<script>
	import { onMount, createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	import { fly } from 'svelte/transition'

	export let id = 0
	export let search = ''
	export let placeholder = 'Chercher un utilisateur'
	export let exepted = []
	export let modeSelect = false
	export let itemSelected = {} //itemSelected = user
	export let selectOk = false
	

	//TODO: Transformer pour aussi servire au article
	//1. Utilisé ._id au lieu de .mail
	//2. remplacer user par item
	//3. Utilisé <slot> pour la représentation 


	let users = []
	let selected = 0
	let listhover = false
	let waiting
	let nextInput
	let focus = false

	onMount(() => {
		if (modeSelect) {
			// Get next Input
			let inputs = [...document.getElementsByClassName('w3-input')]
			let input = document.getElementById(`searchUser${id}`)
			let index = inputs.indexOf(input)
			if (index < inputs.length - 1) {
				nextInput = inputs[index + 1]
			}else {
				nextInput = inputs[0]
			}
		}
	})

	async function searchUser() {
		const res = await fetch(`/users/search/${search}`)
		const json = await res.json()
		if (res.ok)	return json
		else Error(res.message)
	}

	function input(){
		clearTimeout(waiting)
		if (search.length > 2) waiting = setTimeout(() => users = searchUser(), 100)
	}

	function select(user) {
		
		if (!isExepted(user)) {
			dispatch('select', user)
			itemSelected = user
			if (modeSelect) {
				search = user.name
				nextInput.focus()
			}else{
				search = ''
			}
		}
	}

	function isExepted(user) {
		return exepted.map(e => e.mail).indexOf(user.mail) > -1
	}

	const ENTER = 13, DOWN = 40, UP = 38

	function keydown(e) {

		if (Array.isArray(users)) return

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
		console.log(selected)
	}

	$: selectOk = itemSelected.name == search

	function focusout() {
		setTimeout(() => focus = false, 200)
	}

</script>

<div style="position: relative;">
	<input  id="{`searchUser${id}`}"
			bind:value={search}
			on:keydown={keydown}
			on:input={input}
			on:focusin="{() => focus = true}"
			on:focusout="{focusout}"
			type="text" 
			class="w3-input searchUser"
			autocomplete="off"
			placeholder="{placeholder}">

	{#if focus && search.length > 2 && (!modeSelect || !selectOk)}
	<div id="proposition" class="w3-border w3-round w3-padding" in:fly="{{y: 50}}">
		
		{#await users}
			<i class="fas fa-circle-notch w3-spin"></i>
			Recherche...
		{:then users}
			{#if users.length}
				<ul class="w3-ul"
					on:mouseenter="{() => {listhover = true; selected = -1}}"
					on:mouseleave="{() => listhover = false}">
					{#each users as user, i}
					<li class="underline-div without-hover"
						class:w3-opacity="{isExepted(user)}"
						class:selected="{selected == i && !isExepted(user)}"
						on:mouseenter="{() => selected = i}"
						on:click="{() => select(user)}">
						<span class="underline-span">{user.name}</span>
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
</div>


<style>

	#proposition {
		position: absolute;
		width: 100%;
		background: #fff;
		margin-top: 4px;
		box-shadow: 1px 1px 4px grey;
	}

	li {
		cursor: pointer;
		border: none;
	}

</style>