<script>
	import { troc } from './stores'
	import SearchUser from './SearchUser.svelte'
	import UserLi from './UserLi.svelte'

	export let tarif = {
		_id: 	'',
		name: 	'',
		apply: 	[],
		margin: 0,
		fee: 	[],
		bydefault: false,		
	}

	function removeApply(i) {
		tarif.apply.splice(i, 1)
		tarif.apply = tarif.apply
	}


</script>

<div class="w3-card w3-padding w3-round">

	<input bind:value={tarif.name} type="text" placeholder="Nom du tarif" class="w3-input w3-large w3-center"><br>
	{#if tarif.bydefault}
		Est appliqué par défault
	{:else}
		<span class="w3-left">S'applique à:</span>
		<div id="apply">
			<ul class="w3-ul w3-border-left">
			{#each tarif.apply as apply, i}
				<UserLi user={apply} on:remove="{() => removeApply(i)}"/>
			{/each}
			</ul>
			<SearchUser on:select="{e => tarif.apply = [...tarif.apply, e.detail]}"
						exepted={tarif.apply}
						placeholder="Ajouter un utilisateur"/>
		</div>
		<br>
	{/if}
</div>

<style>
	#apply {
		width: calc(100% - 120px);
		margin-left: 120px;
	}
</style>