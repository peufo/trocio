<script>
	import { onMount } from 'svelte'
	import { fade } from 'svelte/transition'
	import Button from '@smui/button'

	import { me, troc } from './stores'
	import { getHeader } from './utils'
	import SearchUser from './SearchUser.svelte'
	import Provide from './Provide.svelte'
	import Buy from './Buy.svelte'
	import Recover from './Recover.svelte'
	import Giveback from './Giveback.svelte'
	import Resume from './Resume.svelte'


	let user = {}
	let searchUser = ''
	let userPlaceholder = 'Trouver un client'
	let userOk = false
	let clientAnonym = false
	let popupPaymentOpen = false

	let action = 4
	let actions = [
		{name: 'Fournit', icon: '<i class="fas fa-sign-in-alt"></i>'},
		{name: 'Récupère', icon: '<i class="fas fa-sign-out-alt"></i>'},
		{name: 'Achète', icon: '<i class="fas fa-shopping-basket"></i>', clientAnonymAutorised: true},
		{name: 'Retourne', icon: '<i class="fas fa-undo"></i>', clientAnonymAutorised: true},
		{name: 'Aperçue', icon: '<i class="far fa-eye"></i>', clientAnonymAutorised: true},
	]

	let balance = 0 //bind to Resume.svelte
	let tarif = undefined //bind to Resume.svelte
	let validPaymentPromise

	let provided = [] 	//List of articles provided from Resume.svelte
	let purchases = [] 	//List of articles purchases from Resume.svelte
	let givebacks = []  //List of articles returned from Resume.svelte
	let payments = []	//List of payments from Resume.svelte

	//And there promises
	let providedPromise 	//Promise provided and proposed
	let purchasesPromise	//Promise purchases
	let givebacksPromise	//Promise givebacks
	let paymentsPromise		//Promise payments

    onMount(() => {
		if (document.location.hash.substr(1).length == 24) {
			troc.find(document.location.hash.substr(1))
		} else {
			$troc = {failed: true, reason: 'Bad request'}
		}
    })
    
	function userSelected(e){
		user = e.detail
	}

	//Post payment
	async function validPayment() {
		let payment = {
			user: user._id,
			troc: $troc._id,
			amount: -balance, 
			message: balance > 0 ? `Versé par ${$me.name}` : `Encaissé par ${$me.name}`
		}
		let res = await fetch(`/payments`, getHeader(payment))
		let json = await res.json()
		if (res.ok && json.success) {
			payments = [json.message, ...payments]
			popupPaymentOpen = false
			return
		}
	}

	//Keyboard shortcut listener
	document.addEventListener('keydown', e => {
		console.log(e.key)
		if (e.ctrlKey) {
			switch(e.key){
				case 'ArrowLeft':
					if (action > 0 ) action--
					break

				case 'ArrowRight':
					if (action < actions.length - 1) action++
					break
				
				case 'Backspace':
					searchUser = ''
					document.getElementById('searchUser1').focus()
					break
			}
		}
	})

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
				<span>Vous n'avez pas accès à la caisse de ce troc !</span>
			{/if}
		</div>
	</div>
{:else}

	<div class="w3-card w3-round" style="max-width: 850px; margin: auto; height: calc(100% - 45px);">
		<div class="w3-row w3-padding w3-margin-top">

			<!-- Utilisateur -->
			
			<div class="w3-margin-left" style="display: inline-block">
				<div class="icon iconUser">
					{#if !clientAnonym}
						<i class:far={!userOk} class:fas={userOk} class="fa-user w3-large"></i>
					{:else}
						<i class="fas fa-user-secret w3-large"></i>
					{/if}
				</div>
				<div style="display: inline-block; width: 260px;">
					<SearchUser modeSelect 
								id="1"
								on:input="{() => {clientAnonym = false; userPlaceholder = 'Trouver un client'}}"
								placeholder={userPlaceholder}
								bind:search={searchUser}
								bind:selectOk={userOk}
								on:select="{userSelected}"/>
				</div>
			</div>

			{#if !clientAnonym && !userOk}
				<div in:fade={{duration: 200}} style="display: inline-block">
					
					<!-- TODO: open LOGIN blocked for create account-->
					<Button
					color="secondary"
					variant="outlined"
					class="w3-margin-left">
					<i class="fas fa-user-plus w3-large"></i>&nbsp;Nouveau client
					</Button>	

					<Button
					on:click="{() => {action = 2; clientAnonym = true; searchUser = ''; userPlaceholder = 'Anonyme'}}"
					color="secondary"
					variant="outlined"
					class="w3-margin-left">
					<i class="fas fa-user-secret w3-large"></i>&nbsp;Client anonyme
					</Button>

				</div>
			{/if}

			
			<!-- Règle le solde -->
			<div class:visible={userOk && balance != 0} class="hide w3-right w3-padding">

				<div class="button w3-round" on:click="{() => popupPaymentOpen = true}">
					Régler le solde de {balance.toFixed(2)}
				</div>
			</div>
			
		</div>


		{#if userOk || clientAnonym}
		<div transition:fade style="height: calc(100% - 126px);">

			<!-- Action -->
			<div class="onglets w3-margin-top w3-border-top">
				{#each actions.filter(a => !clientAnonym || a.clientAnonymAutorised) as tab, i}
					<div class="w3-padding underline-div onglet"
						on:click="{() => action = i}"
						class:actived="{action == i}">
						{@html tab.icon}
						<span class="underline-span">{tab.name}</span>
					</div>
				{/each}
			</div>

			
			<div class="tabs" style="height: 100%;">

				<!-- Fournit -->
				<div class="tab" class:center={action == 0} class:left={action > 0}>
					<br>
					<Provide bind:user bind:provided bind:providedPromise bind:tarif/>
				</div>

				<!-- Récupère -->
				<div class="tab" class:center={action == 1} class:left={action > 1} class:right={action < 1}>
					<br>
					<Recover bind:user bind:provided bind:providedPromise/>
				</div>

				<!-- Achète -->
				<div class="tab" class:center={action == 2} class:left={action > 2} class:right={action < 2}>
					<br>
					<Buy bind:user bind:purchases bind:purchasesPromise/>
				</div>

				<!-- Retourne -->
				<div class="tab" class:center={action == 3} class:left={action > 3} class:right={action < 3}>
					<br>
					<Giveback bind:user
							bind:purchases bind:purchasesPromise
							bind:givebacks bind:givebacksPromise />
				</div>
			
				<!-- Aperçue -->
				<div class="tab" class:center={action == 4} class:right={action < 4}>
					<br>
					<Resume userId={user._id} trocId={$troc._id}
							bind:provided bind:providedPromise
							bind:purchases bind:purchasesPromise
							bind:payments bind:paymentsPromise 
							bind:balance bind:tarif/>
				</div>

			</div>

		</div>
		{:else}

			<div class="w3-display-middle w3-center" transition:fade>
				<i class="fas fa-cash-register noUserLogo"></i>
				<br>
			</div>

		{/if}

	</div>

{/if}

{#if popupPaymentOpen}
<div class="w3-modal" transition:fade|local={{duration: 150}}>
	<div class="w3-modal-content w3-padding w3-round">
		<div class="w3-right w3-padding close-icon" on:click="{() => popupPaymentOpen = false}">
			<i class="fa fa-times w3-large"></i>
		</div>
		<br><br>
		<div class="w3-center w3-xlarge">
			{balance > 0 ? `Vous avez versé ${balance.toFixed(2)} à ${user.name}`: `${user.name} vous à versé ${(-balance).toFixed(2)}`}
		</div>
		<br>
		{#await validPaymentPromise}
			<div class="validButton w3-round w3-right">
				Validation en cours...
			</div>
		{:then}
			<div class="validButton w3-round w3-right" on:click="{() => validPaymentPromise = validPayment()}">
				Valider la transaction
			</div>
		{/await}
		<br><br>
	</div>
</div>
{/if}


<svelt:head>
	<style>#waitLoaded { display: none; }</style>
</svelt:head>

<style>
    .w3-display-container {
        height: calc(100% - 57px);
	}
	
	.tab {
		padding-left: 32px;
		padding-right: 32px;
	}

	.icon {
		display: inline-block;
		padding-top: 10px;
	}

	.iconUser i{
		transition: all .15s;
	}

	.iconUser .fas {
		transform: scale(1.2);
	}

	.noUserLogo {
		font-size: 140px;
		opacity: .08;
	}

	.w3-modal {
		display: block;
	}

</style>