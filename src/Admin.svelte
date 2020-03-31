<script>
	import { onMount } from 'svelte'
	import { me, troc } from './stores'
	import { fade } from 'svelte/transition'
	import EditForm from './EditForm.svelte'
	import SearchUser from './SearchUser.svelte'
	import AutoPatch from './AutoPatch.svelte'
	import UserLi from './UserLi.svelte'
	import Collaborators from './Collaborators.svelte'
	import Tarif from './Tarif.svelte'
	import Correction from './Correction.svelte'
	import Stats from './Stats.svelte'
	import Cashier from './Cashier.svelte'
	import TagEdit from './TagEdit.svelte'
	import { getHeader, updateTroc } from './utils'


	let tabSelected = 5
	let oldTabSelected = -1
	let tabs = [
		{num: 0, name: 'Informations', 	icon: '<i class="fas fa-info-circle"></i>'},
		{num: 1, name: 'Collaborateurs', icon: '<i class="fas fa-users"></i>'}, 
		{num: 2, name: 'Tarifications', icon: '<i class="fas fa-coins"></i>'},
		{num: 3, name: 'Etiquetage', 	icon: '<i class="fas fa-tag"></i>'},
		{num: 4, name: 'Statistique', 	icon: '<i class="fas fa-chart-pie"></i>'},
		{num: 5, name: 'Correction', 	icon: '<i class="fas fa-eraser"></i>'},
		{num: 6, name: 'Caisse', 		icon: '<i class="fas fa-cash-register"></i>'}
	]

	onMount(() => {
		troc.find(location.pathname.replace('/admin/',''))
	})

	function saveMeta(e) {
		fetch(`/trocs/${$troc._id}`, getHeader(e.detail, 'PATCH'))
		.then(res => res.json())
		.then(updateTroc)
	}

	function removeTarif(i) {
		$troc.tarif.splice(i, 1)
		$troc.tarif = $troc.tarif
	}

	let changeFlag = false //For SearchUser to AutoPatch 
	let tag = {} // For tag edit

</script>

<!-- Check if all is OK ! -->
{#if $troc.failed}
	<div class="w3-display-container">
		<div class="w3-display-middle w3-red w3-padding w3-round w3-large w3-center">
			<i class="fas fa-bug"></i> Oups ! <br>
			{#if $troc.reason == 'Not found'}
				<span>Ce troc n'éxiste pas !</span>
			{:else if $troc.reason == 'Bad request'}
				<span>La requête n'est pas valide !</span>
			{:else}
				<span>Vous n'avez pas accès à la page administrateur de ce troc !</span>
			{/if}
		</div>
	</div>
{:else}
<div in:fade style="height: calc(100% - 58px);">
	
	<div class="onglets w3-center">
		{#each tabs as tab}
			<div class="w3-padding underline-div onglet"
				on:click="{() => tabSelected = tab.num}"
				class:actived="{tabSelected == tab.num}">
				{@html tab.icon}
				<span class="underline-span tab-name">{tab.name}</span>
			</div>
		{/each}
	</div>

	{#if $troc._id}
	<div class="tabs" style="height: calc(100% - 38px);">

		<!-- Apercu -->
		<div class="tab" class:center={tabSelected == 0} class:left={tabSelected > 0}>
			<br>
			<div class="w3-padding w3-card w3-round" style="max-width: 850px; margin: auto;">
				<EditForm {...$troc} />
			</div>
			<br>
		</div>

		<!-- Worker -->
		<div class="tab" class:center={tabSelected == 1} class:left={tabSelected > 1} class:right={tabSelected < 1}>
			<br>
			<Collaborators/>
		</div>

		<!-- Tarif  -->
		<div class="tab" class:center={tabSelected == 2} class:left={tabSelected > 2} class:right={tabSelected < 2}>
			<br>
			<AutoPatch source="editTarif" body="{{tarif: $troc.tarif}}" path="{`/trocs/${$troc._id}`}" bind:changeFlag={changeFlag} trocRefresh/>
			<div id="editTarif" in:fade>
			{#each $troc.tarif as tarif, i}
				<Tarif 	index={i}
						bind:name={tarif.name}
						bind:apply={tarif.apply}
						bind:margin={tarif.margin}
						bind:fee={tarif.fee}
						bind:maxarticles={tarif.maxarticles}
						bind:bydefault={tarif.bydefault}
						on:remove="{() => removeTarif(i)}"
						on:selectUser="{() => changeFlag = true}"
						on:removeUser="{() => changeFlag = true}"/>
			{/each}
				<div id="addTarif">
					<div on:click="{() => $troc.tarif = [...$troc.tarif, {}]}"
						 class="patchButton w3-button w3-border w3-round w3-right">
						+1 tarif
					</div>
				</div>

			</div>
		</div>

		<!-- Etiquetage  -->
		<div class="tab" class:center={tabSelected == 3} class:left={tabSelected > 3} class:right={tabSelected < 3}>
			<br>
			<AutoPatch source="tagEdit" body="{{tag: $troc.tag}}" path="{`/trocs/${$troc._id}`}" trocRefresh/>
			<div id="tagEdit">
				<TagEdit bind:width={$troc.tag.width} bind:height={$troc.tag.height} bind:padding={$troc.tag.padding} bind:border={$troc.tag.border}/>
			</div>
		</div>

		<!-- Stats  -->
		<div class="tab" class:center={tabSelected == 4} class:left={tabSelected > 4} class:right={tabSelected < 4}>
			<br>
			<Stats />
		</div>

		<!-- Correction  -->
		<div class="tab" class:center={tabSelected == 5} class:left={tabSelected > 5} class:right={tabSelected < 5}>
			<br>
			<Correction troc={$troc._id} />
		</div>

		<!-- Caisse  -->
		<div class="tab" class:center={tabSelected == 6} class:left={tabSelected > 6} class:right={tabSelected < 6}>
			<br>
			<Cashier adminIntegration />
		</div>
		
	</div>
	{/if}

</div>
{/if}

<svelt:head>
	<style>#waitLoaded { display: none; }</style>
</svelt:head>

<style>

	@media screen and (max-width: 970px) {
		.tab-name {
			display: none;
		}
	}

	#addTarif {
		max-width: 850px;
		margin: auto;
	}

	.underline-div {
		display: inline-block;
	}

	.w3-display-container {
		height: calc(100% - 57px);
	}

</style>
