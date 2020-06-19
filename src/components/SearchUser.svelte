<script>
	import { onMount, createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	import { fly } from 'svelte/transition'
	import List, {Item, Text, PrimaryText, SecondaryText } from '@smui/list'

	export let id = 0
	export let search = ''
	export let placeholder = 'Chercher un utilisateur'
	export let exepted = []
	export let modeSelect = false
	export let itemSelected = {} //itemSelected = user
	export let selectOk = false
	export let disabled = false

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

		//If item is preselected
		if (itemSelected._id) {
			select(itemSelected)
		}

		if (modeSelect) {//TODO: WTF!?!?!
			
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

	$: selectOk = itemSelected.name == search
	
	async function searchUser() {
		const res = await fetch(`/users/search/${search}`)
		const json = await res.json()
		if (res.ok)	return json
		else return []
	}

	function input(){
		dispatch('input')
		clearTimeout(waiting)
		if (search.length > 1) waiting = setTimeout(() => users = searchUser(), 100)
	}

	function select(user) {
		
		if (!isExepted(user)) {
			itemSelected = user
			dispatch('select', user)
			if (modeSelect) {
				search = user.name
				//nextInput.focus()
				document.getElementById(`searchUser${id}`).blur()
			}else{
				search = ''
			}
		}
	}

	function isExepted(user) {
		return exepted.map(e => e._id).indexOf(user._id) > -1
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

	

	function focusin() {
		focus = true
		dispatch('focusin')
	}

	function focusout() {
		setTimeout(() => focus = false, 200)
	}

</script>

<div style="position: relative;">
	<input  id="{`searchUser${id}`}"
			bind:value={search}
			on:keydown={keydown}
			on:input={input}
			on:focusin="{focusin}"
			on:focusout="{focusout}"
			type="text"
			class:w3-disabled={disabled}
			class="w3-input searchUser"
			autocomplete="off"
			placeholder="{placeholder}">

	{#if focus && search.length > 1 && (!modeSelect || !selectOk)}
	<div id="proposition" class="w3-border w3-round w3-padding" in:fly="{{y: 50}}"  style="min-width: 260px;">
		
		{#await users}
			<i class="fas fa-circle-notch w3-spin"></i>
			Recherche...
		{:then users}

		    <List
			twoLine
			avatarList
			singleSelection
			dense
			on:mouseenter="{() => {listhover = true; selected = -1}}"
			on:mouseleave="{() => listhover = false}">
			{#each users as user, i}
				<Item 
				on:mouseenter="{() => selected = i}"
				role="menuitem"
				selected={selected === i && !isExepted(user)}
				disabled={isExepted(user)}
				on:click="{() => select(user)}">
					<Text>
						<PrimaryText>{user.name}</PrimaryText>
						<SecondaryText>{user.mail}</SecondaryText>
					</Text>
				</Item>
			{:else}
				<div class="w3-center">
					Aucun résultat pour <b>{search}</b>
				</div>
			{/each}
			</List>



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
		z-index: 99;
	}

</style>