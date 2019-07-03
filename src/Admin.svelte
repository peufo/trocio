<script>
	import { me, troc } from './stores'
	import { fade } from 'svelte/transition'
	import EditForm from './EditForm.svelte'
	import SearchUser from './SearchUser.svelte'
	import AutoPatch from './AutoPatch.svelte'
	import UserLi from './UserLi.svelte'
	import Tarif from './Tarif.svelte'
	import { getHeader, updateTroc } from './utils'


	let tabs = ['Informations', 'Travailleurs', 'Tarifications', 'Statistique', 'Correction']
	let tabSelected = 2

	//Pour test
	troc.find('5d1ccca6374e323c306901dd')


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


</script>

<div in:fade>
	
	<div class="w3-bar w3-theme w3-large">
	{#each tabs as tab, i}
		<button 
			class="w3-bar-item w3-button" 
			on:click="{() => tabSelected = i}"
			class:w3-theme-l5="{tabSelected == i}">
			{tab}
		</button>
	{/each}
	</div>
	
	<div class="w3-margin">

	{#if $troc._id}
		{#if tabSelected == 0}			<!-- Apercu -->
			<div in:fade>
				<EditForm {...$troc} />
			</div>

		{:else if tabSelected == 1}		<!-- Worker -->
			<div in:fade>
				<div class="w3-col m6 w3-padding">
					<h2 class="w3-center">Administrateurs</h2>
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

				<div class="w3-col m6 w3-padding w3-border-left">
					<h2 class="w3-center">Caissiers</h2>
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

		{:else if tabSelected == 2 }		<!-- Tarif  -->
			<AutoPatch source="editTarif" body="{{tarif: $troc.tarif}}" path="{`/trocs/${$troc._id}`}"/>
			<div id="editTarif" in:fade>
			{#each $troc.tarif as tarif, i}
				<Tarif 	bind:name={tarif.name}
						bind:apply={tarif.apply}
						bind:margin={tarif.margin}
						bind:fee={tarif.fee}
						bind:bydefault={tarif.bydefault}
						on:remove="{() => removeTarif(i)}"/>
			{/each}
				<div id="addTarif" >
					<div on:click="{() => $troc.tarif = [...$troc.tarif, {}]}"
						 class="w3-button w3-border w3-round w3-right">
						+1 tarif
					</div>
				</div>

			</div>
			<!--
			
			-->
		{:else if tabSelected == 3}		<!-- Stats  -->
			Stats

		{:else if tabSelected == 4}		<!-- Correction  -->
			Correction

		{/if}
	{/if}

	</div>

</div>


<style>
	
	button.w3-bar-item  {
		border-radius: 5px 5px 0px 0px;
	}

	.user div {
		width: calc(100% - 30px);
	}

	#addTarif {
		max-width: 850px;
		margin: auto;
	}

</style>
