<script>
	import { onMount } from 'svelte'
	import { me, troc } from './stores'
	import { fade } from 'svelte/transition'
	import EditForm from './EditForm.svelte'
	import SearchUser from './SearchUser.svelte'
	import AutoPatch from './AutoPatch.svelte'
	import UserLi from './UserLi.svelte'
	import Tarif from './Tarif.svelte'
	import Cashier from './Cashier.svelte'
	import Tag from './Tag.svelte'
	import { getHeader, updateTroc } from './utils'


	let tabSelected = 6
	let oldTabSelected = -1
	let tabs = [
		{name: 'Informations', 	icon: '<i class="fas fa-info-circle"></i>'},
		{name: 'Collaborateurs', icon: '<i class="fas fa-users"></i>'}, 
		{name: 'Tarifications', icon: '<i class="fas fa-coins"></i>'},
		{name: 'Etiquetage', 	icon: '<i class="fas fa-tag"></i>'},
		{name: 'Statistique', 	icon: '<i class="fas fa-chart-pie"></i>'},
		{name: 'Correction', 	icon: '<i class="fas fa-eraser"></i>'},
		{name: 'Caisse', 		icon: '<i class="fas fa-cash-register"></i>'}
	]

	onMount(() => {
		if (document.location.hash.substr(1).length == 24) {
			troc.find(document.location.hash.substr(1))
		} else {
			$troc = {failed: true, reason: 'Bad request'}
		}
	})

	function saveMeta(e) {
		fetch(`/trocs/${$troc._id}`, getHeader(e.detail, 'PATCH'))
		.then(res => res.json())
		.then(updateTroc)
	}

	function addAdmin(e) {
		fetch(`/trocs/${$troc._id}/admin`, getHeader({admin: e.detail._id}))
		.then(res => res.json())
		.then(updateTroc)
	}

	function addCashier(e) {
		fetch(`/trocs/${$troc._id}/cashier`, getHeader({cashier: e.detail._id}))
		.then(res => res.json())
		.then(updateTroc)
	}

	function removeAdmin(e) {
		fetch(`/trocs/${$troc._id}/admin/remove`, getHeader({admin: e.detail._id}))
		.then(res => res.json())
		.then(updateTroc)
	}

	function removeCashier(e) {
		fetch(`/trocs/${$troc._id}/cashier/remove`, getHeader({cashier: e.detail._id}))
		.then(res => res.json())
		.then(updateTroc)
	}

	function removeTarif(i) {
		$troc.tarif.splice(i, 1)
		$troc.tarif = $troc.tarif
	}

	let changeFlag = false //For SearchUser to AutoPatch 

	function selectTab(i) {
		oldTabSelected = tabSelected
		tabSelected = i
		setTimeout(() => oldTabSelected = -1, 450)
	}

	$: console.log(oldTabSelected)

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
	
	<div class="onglets">
	{#each tabs as tab, i}
		<div class="w3-padding underline-div onglet"
			 on:click="{() => selectTab(i)}"
			 class:actived="{tabSelected == i}">
			 {@html tab.icon}
			<span class="underline-span">{tab.name}</span>
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
			<div class="w3-padding w3-card w3-round w3-row" style="max-width: 850px; margin: auto;">
				<div class="w3-padding w3-col m6" >
					<h3 class="w3-center">Administrateurs</h3>
					<ul class="w3-ul">
					{#each $troc.admin as admin}
						<UserLi user={admin} 
								on:remove="{removeAdmin}"
								cantRemove="{admin._id == $troc.creator._id || admin._id == $me._id}"/>
					{/each}
						<li>
							<SearchUser placeholder="Nouvel administrateur"
										exepted="{$troc.admin}"
										on:select={addAdmin}/>
						</li>
					</ul>
				</div>

				<div class="w3-padding w3-border-left w3-col m6" >
					<h3 class="w3-center">Caissiers</h3>
					<ul class="w3-ul">
					{#each $troc.cashier as cashier}
						<UserLi user={cashier}
								on:remove="{removeCashier}"/>
					{/each}
						<li>
							<SearchUser placeholder="Nouveau caissier"
										exepted="{[...$troc.cashier, $troc.creator]}" 
										on:select={addCashier}/>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Tarif  -->
		<div class="tab" class:center={tabSelected == 2} class:left={tabSelected > 2} class:right={tabSelected < 2}>
			<br>
			<AutoPatch source="editTarif" body="{{tarif: $troc.tarif}}" path="{`/trocs/${$troc._id}`}" bind:changeFlag={changeFlag} trocRefresh/>
			<div id="editTarif" in:fade>
			{#each $troc.tarif as tarif, i}
				<Tarif 	bind:name={tarif.name}
						bind:apply={tarif.apply}
						bind:margin={tarif.margin}
						bind:fee={tarif.fee}
						bind:bydefault={tarif.bydefault}
						on:remove="{() => removeTarif(i)}"
						on:selectUser="{() => changeFlag = true}"/>
			{/each}
				<div id="addTarif" >
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
			<Tag/>
		</div>

		<!-- Stats  -->
		<div class="tab" class:center={tabSelected == 4} class:left={tabSelected > 4} class:right={tabSelected < 4}>
			<br>
			Stats
		</div>

		<!-- Correction  -->
		<div class="tab" class:center={tabSelected == 5} class:left={tabSelected > 5} class:right={tabSelected < 5}>
			<br>
			Correction
		</div>

		<!-- Caisse  -->
		<div class="tab" class:center={tabSelected == 6} class:left={tabSelected > 6} class:right={tabSelected < 6}>
			<br>
			<Cashier/>
		</div>
		
	</div>
	{/if}

</div>
{/if}

<svelt:head>
	<style>#waitLoaded { display: none; }</style>
</svelt:head>

<style>

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
