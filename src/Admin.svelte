<script>
	import { me, troc } from './stores'
	import { fade } from 'svelte/transition'
	import EditForm from './EditForm.svelte'
	import SearchUser from './SearchUser.svelte'
	import Tarif from './Tarif.svelte'
	import { getHeader } from './utils'


	let tabs = ['Informations', 'Travailleurs', 'Tarifications', 'Statistique', 'Correction']
	let tabSelected = 2
	
	//Pour test
	troc.find('5d166f8de5b28e1958a76f32')

	let searchAdmin = ''
	let searchCashier = ''

	function saveMeta(e) {
		fetch(`/trocs/${$troc._id}`, getHeader(e.detail, 'PATCH'))
		.then(res => res.json())
		.then(updateTroc)
	}

	function addAdmin(e) {
		console.log(e.detail._id)
		fetch(`/trocs/${$troc._id}/admin`, getHeader({admin: e.detail._id}))
		.then(res => res.json())
		.then(json => updateTroc(json, () => searchAdmin = ''))
	}

	function addCashier(e) {
		fetch(`/trocs/${$troc._id}/cashier`, getHeader({cashier: e.detail._id}))
		.then(res => res.json())
		.then(json => updateTroc(json, () => searchCashier = ''))
	}

	function removeAdmin(admin) {
		fetch(`/trocs/${$troc._id}/admin/remove`, getHeader({admin: admin._id}))
		.then(res => res.json())
		.then(updateTroc)
	}

	function removeCashier(cashier) {
		fetch(`/trocs/${$troc._id}/cashier/remove`, getHeader({cashier: cashier._id}))
		.then(res => res.json())
		.then(updateTroc)
	}

	function updateTroc(json, cb) {
		if (json.success) {
			troc.refresh(json.message)
			if (cb) cb()
		}else{
			alert(json.message)
		}
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
				<EditForm on:save={saveMeta} />
			</div>

		{:else if tabSelected == 1}		<!-- Worker  TODO: supprimer le test && $troc.admin-->
			<div in:fade>

				<div class="w3-col m6 w3-padding">
					<h2 class="w3-center">Administrateurs</h2>
					<ul class="w3-ul">
					{#each $troc.admin as admin}
						<li class="user">
							<div class="w3-left">
								{admin.name}
								<em class:w3-hide="{admin._id != $troc.creator}" 
									class="w3-tiny w3-border w3-round">
									Créateur</em>
								<em class="w3-right w3-small">{admin.mail}</em>	
							</div>&nbsp;
							<i 	class:w3-hide="{admin._id == $troc.creator || admin._id == $me._id}" 
								on:click="{() => removeAdmin(admin)}"
								class="fa fa-times w3-large w3-right"></i>
						</li>
					{/each}
						<li>

							<SearchUser bind:search={searchAdmin}
										placeholder="Nouvel administrateur"
										exepted="{$troc.admin}"
										on:select={addAdmin}/>
						</li>
					</ul>			
				</div>

				<div class="w3-col m6 w3-padding w3-border-left">
					<h2 class="w3-center">Caissiers</h2>
					<ul class="w3-ul">
					{#each $troc.cashier as cashier}
						<li class="user">
							<div class="w3-left">
								{cashier.name}
								<em class="w3-right w3-small">{cashier.mail}</em>				
							</div>&nbsp;
							<i 	on:click="{() => removeCashier(cashier)}"
								class="fa fa-times w3-large w3-right"></i>
						</li>
					{/each}
						<li>
							<SearchUser bind:search={searchCashier}
										placeholder="Nouveau caissier"
										exepted="{$troc.cashier}" 
										on:select={addCashier}/>
						</li>
					</ul>			
				</div>
			</div>

		{:else if tabSelected == 2 }		<!-- Tarif  -->
			{#each $troc.tarif as tarif}
				<Tarif {...tarif}/>
			{/each}

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
