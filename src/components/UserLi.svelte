<script>
	import { troc } from './stores'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	export let user = { _id: '', name: '', mail: '' }
	export let cantRemove = false

</script>

<li>
	<div class="w3-left">
		{user.name}
		<em class:w3-hide="{user._id != $troc.creator}" 
			class="w3-tiny w3-border w3-round">
			Créateur</em>
		<em class="w3-right w3-small">{user.mail}</em>	
	</div>&nbsp;
	<i 	class:w3-hide={cantRemove} 
		on:click="{() => dispatch('remove', user)}"
		class="fa fa-times w3-large w3-right"></i>
</li>

<style>
	div {
		width: calc(100% - 30px);
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