<script>
	import SearchUser from './SearchUser.svelte'

	export let _id = ''
	export let name = ''
	export let apply = []
	export let margin = 0
	export let fee = []
	export let bydefault = false


</script>



<div class="w3-card w3-padding w3-round">

	<input bind:value={name} type="text" placeholder="Nom du tarif" class="w3-input w3-large w3-center"><br>
	{#if bydefault}
		Est appliqué par défault
	{:else}
		S'applique à:
		<div id="apply" class="w3-right">
			<SearchUser placeholder="Ajouter un utilisateur"/>
		</div>
		<br><br>
	{/if}
</div>

<style>
	#apply {
		width: calc(100% - 120px);
	}
</style>