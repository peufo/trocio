<script>
	import { onMount } from 'svelte'
	import { fade } from 'svelte/transition'
	import Button from '@smui/button'
	import Dialog from '@smui/dialog'

	import { me, troc } from './stores'
	import { getHeader } from './utils'
	import SearchUser from './SearchUser.svelte'
	import Provide from './Provide.svelte'
	import Buy from './Buy.svelte'
	import Recover from './Recover.svelte'
	import Giveback from './Giveback.svelte'
	import Resume from './Resume.svelte'
	import Login from './Login.svelte'

	export let adminIntegration = false //For not reload troc

	let dialogLogin // Create user

	let user = {}
	let searchUser = ''
	let userPlaceholder = 'Trouver un client'
	let userOk = false
	let clientAnonym = false
	let popupPaymentOpen = false

	let action = 4
	let actions = [
		{num: 0, name: 'Fournit', icon: '<i class="fas fa-sign-in-alt"></i>'},
		{num: 1, name: 'Récupère', icon: '<i class="fas fa-sign-out-alt"></i>'},
		{num: 2, name: 'Achète', icon: '<i class="fas fa-shopping-basket"></i>', clientAnonymAutorised: true},
		{num: 3, name: 'Retourne', icon: '<i class="fas fa-undo"></i>', clientAnonymAutorised: true},
		{num: 4, name: 'Aperçu', icon: '<i class="far fa-eye"></i>', clientAnonymAutorised: true},
	]

	let tarif = undefined //bind to Resume.svelte
	let validPaymentPromise

	let balance = 0 //bind to Resume.svelte

	let provided = [] 	//List of articles provided from Resume.svelte
	let purchases = [] 	//List of articles purchases from Resume.svelte
	let payments = []	//List of payments from Resume.svelte
	let givebacks = []  //List of articles returned from Givbacks.svelte

	//And there promises
	let providedPromise 	//Promise provided and proposed
	let purchasesPromise	//Promise purchases
	let paymentsPromise		//Promise payments
	let givebacksPromise	//Promise givebacks


    onMount(() => {
		if (!adminIntegration) troc.find(location.pathname.replace('/cashier/',''))
    })
    
	function userSelected(e){
		searchUser = e.detail.name
		userOk = true
		clientAnonym = false
		user = e.detail
	}

	function inputSearchUser() {

		balance = 0 // not work ?? why?

		user = {}
		userOk = false
		clientAnonym = false
		userPlaceholder = 'Trouver un client'
	}

	function focusInSearchUser() {
		userOk = false
		clientAnonym = false
		userPlaceholder = 'Trouver un client'
		searchUser = '' // Malin ou pas ?
	}

	function clickClientAnonym() {
		userOk = true
		user = {}
		clientAnonym = true
		action = 2
		searchUser = ''
		userPlaceholder = 'Anonyme'
	}

	//Post payment
	async function validPayment() {
		let payment = {
			acceptor: $me._id,
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
		if (e.ctrlKey) {
			switch(e.key){
				case 'ArrowLeft':
					//TODO: works with clientAnonym
					if (!clientAnonym && action > 0 ) action--
					break

				case 'ArrowRight':
					//TODO: works with clientAnonym
					if (!clientAnonym && action < actions.length - 1) action++
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
		<div class="w3-row w3-padding">

			<!-- Utilisateur -->
			
			<!-- Règle le solde -->
			{#if userOk && balance != 0}
			<div in:fade={{duration: 200}} style="display: inline-block; transform: translate(0px, 5px);" class="w3-right">
				<Button 
				variant="raised"
				style="color: white;"
				on:click="{() => popupPaymentOpen = true}">
					Régler le solde de {balance.toFixed(2)}
				</Button>
			</div>
			{/if}

			<!--  -->
			<div style="display: inline-block">
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
								on:input={inputSearchUser}
								on:focusin={focusInSearchUser}
								placeholder={userPlaceholder}
								bind:search={searchUser}
								on:select="{userSelected}"/>
				</div>
			</div>

			{#if !userOk}
				<div in:fade={{duration: 200}} style="display: inline-block">
					
					<!-- TODO: open LOGIN blocked for create account-->
					<Button
					on:click="{() =>  dialogLogin.open()}"
					color="secondary"
					variant="outlined"
					class="w3-margin-left">
					<i class="fas fa-user-plus w3-large"></i>&nbsp;Nouveau
					</Button>
					<Dialog bind:this={dialogLogin}>
						<Login id="NewClient" on:newClient={userSelected}/>
					</Dialog>

					<Button
					on:click={clickClientAnonym}
					color="secondary"
					variant="outlined"
					class="w3-margin-left">
					<i class="fas fa-user-secret w3-large"></i>&nbsp;Anonyme
					</Button>

				</div>
			{/if}
			
		</div>


		{#if userOk}
		<div transition:fade={{duration: 200}} style="height: calc(100% - 126px);">

			<!-- Action -->
			<div class="onglets w3-margin-top w3-border-top">
				{#each actions.filter(a => !clientAnonym || a.clientAnonymAutorised) as tab}
					<div class="w3-padding underline-div onglet"
						on:click="{() => action = tab.num}"
						class:actived="{action == tab.num}">
						{@html tab.icon}
						<span class="underline-span">{tab.name}</span>
					</div>
				{/each}
			</div>

			
			<div class="tabs" style="height: 100%;">
				{#if !clientAnonym}
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
				{/if}

				<!-- Achète -->
				<div class="tab" class:center={action == 2} class:left={action > 2} class:right={action < 2}>
					<br>
					<Buy bind:user bind:purchases bind:purchasesPromise/>
				</div>

				<!-- Retourne -->
				<div class="tab" class:center={action == 3} class:left={action > 3} class:right={action < 3}>
					<br>
					<Giveback userId={user._id} trocId={$troc._id}
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
		{#if clientAnonym}
			<div class="w3-center w3-xlarge">
				{`Un client vous a versé ${(-balance).toFixed(2)}`}
			</div>
		{:else}
			<div class="w3-center w3-xlarge">
				{balance > 0 ? `Vous avez versé ${balance.toFixed(2)} à ${user.name}`: `${user.name} vous a versé ${(-balance).toFixed(2)}`}
			</div>
		{/if}
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