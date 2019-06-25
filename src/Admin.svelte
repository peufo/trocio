<script>
	import { me, troc } from './stores'
	import { fade } from 'svelte/transition'
	import EditForm from './EditForm.svelte'
	import SearchUser from './SearchUser.svelte'

	$: console.log($troc)

	let tabs = ['Informations', 'Travailleurs', 'Tarifications', 'Statistique', 'Correction']
	let tabSelected = 1

	let searchAdmin = ''
	let searchCashier = ''


	function save(e) {
		fetch(`/trocs/${$troc._id}`, {
			method: 'PATCH',
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(e.detail)
		})
		.then(res => res.json())
		.then(json => {
			if (json.success) {
				let index = $me.trocs.map(t => t.troc._id).indexOf($troc._id)
				$me.trocs[index].troc = json.message
				$troc = json.message
			}else{
				alert('Erreur !')
			}
		})
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

	{#if tabSelected == 0}			<!-- Apercu -->
	<div in:fade>
		<EditForm on:save={save} />
	</div>

	{:else if tabSelected == 1 && $troc.admin}		<!-- Worker  TODO: supprimier le test && $troc.admin-->
	<div in:fade>

		<div class="w3-col m6 w3-padding">
			<h2 class="w3-center">Administrateurs</h2>
			<ul class="w3-ul">
			{#each $troc.admin as admin}
				<li class="user">
					<div class="w3-left">
						{admin.name}
						<em class="w3-right w3-small">{admin.mail}</em>						
					</div>&nbsp;
					<i class="fa fa-times w3-large w3-right"></i>
				</li>
			{/each}
				<li>
					<input bind:value={searchAdmin} type="text" class="w3-input" placeholder="Nouvel administrateur">
					<SearchUser search={searchAdmin}
								exepted="{$troc.admin}"/>
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
					<i class="fa fa-times w3-large w3-right"></i>
				</li>
			{/each}
				<li>
					<input bind:value={searchCashier} type="text" class="w3-input" placeholder="Nouveau caissier">
					<SearchUser search={searchCashier}
								exepted="{$troc.cashier}" 
								on:select="{e => searchCashier = e.detail.mail}"/>
				</li>
			</ul>			
		</div>

	</div>

	{:else if tabSelected == 2}		<!-- Tarif  -->
		Tarif


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
