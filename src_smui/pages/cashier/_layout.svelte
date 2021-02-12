<script>
	
	import { redirect, goto, params } from '@roxi/routify'
	import { onMount, onDestroy } from 'svelte'
	import { fade, fly } from 'svelte/transition'

	import Switch from '@smui/switch'
	import FormField from '@smui/form-field'
	import Button from '@smui/button'
	import Dialog, { Title, Content, Actions } from '@smui/dialog'

	import { user, troc, trocDetails as details, cashierOptions } from '$/stores.js'
	import { getHeader } from '$/utils.js'
	import notify from '$/notify.js'
	import SearchUser from '$/SearchUser.svelte'
	import Login from '$/Login.svelte'
	import Tips from '$/Tips.svelte'

	//export let scoped
	export let client = {}
	export let adminIntegration = false

	let tipsOpen = false
	
	//TODO: replace with search users
	let dialogLogin // Create user
	let dialogPayment

	let searchClient = ''
	let clientPlaceHodlerDefault = 'Trouver un client'
	let clientPlaceHodler = clientPlaceHodlerDefault
	let clientOk = false
	let clientAnonym = false

	let validPaymentPromise

	let offsetWidth

    onMount(async () => {

		if ($params.client === 'undefined') {
			client = {}
			clientOk = true
			clientAnonym = true
			searchClient = ''
			clientPlaceHodler = 'Anonyme'
		}else if ($params.client) {
			try {
				let res = await fetch(`/__API__/users/name/${$params.client}`)
				client = await res.json()
				searchClient = client.name
				clientOk = true
				clientAnonym = false
			} catch (error) {
				notify.error(error.message)
			}
		}

		//Keyboard shortcut listener
		document.addEventListener('keyup', shortcut)

	})

	onDestroy(() => document.removeEventListener('keyup', shortcut))

	function shortcut(e) {
		if (e.ctrlKey && e.key === 'Backspace') {
			if (document.activeElement.id === 'searchUser1') {
				document.activeElement.blur()
				clickClientAnonym()
			}else{
				searchClient = ''
				document.getElementById('searchUser1').focus()	
			}
		} else if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
			if (clientOk && $details && $details.balance != 0) dialogPayment.open()
			else if (!clientOk) notify.info('Veuillez sélectionner un client.')
			else if (clientAnonym) notify.info('Le solde des clients anonymes est nul.')
			else notify.info(`Le solde de ${client.name} est nul.`)
		}
	}

	async function updateClientQuery() {
		let query = {...$params}
		if (client._id) query.client = client._id
		else if (clientAnonym) query.client = 'undefined'
		else delete query.client
		console.log({query})
		await $redirect(location.pathname, query)
	}
    
	async function clientSelected(e){
		searchClient = e.detail.name
		client = e.detail
		await updateClientQuery()
		clientOk = true
		clientAnonym = false
	}

	function inputSearchClient() {
		clientOk = false
		clientAnonym = false
		client = {}
		clientPlaceHodler = clientPlaceHodlerDefault
	}

	function focusInSearchClient() {
		clientOk = false
		clientAnonym = false
		client = {}
		updateClientQuery()
		clientPlaceHodler = clientPlaceHodlerDefault
		searchClient = ''
	}

	async function clickClientAnonym() {
		clientAnonym = true
		await updateClientQuery()
		clientOk = true
		client = {}
		searchClient = ''
		clientPlaceHodler = 'Anonyme'
	}

	//Post payment
	async function validPayment() {
		let payment = {
			acceptor: $user._id,
			user: client._id,
			troc: $details.troc,
			amount: -$details.balance, 
			message: $details.balance > 0 ? `Versé par ${$user.name}` : `Encaissé par ${$user.name}`
		}
		try {
			let res = await fetch(`/__API__/payments`, getHeader(payment))
			let json = await res.json()
			if (res.ok && json.success) {
				let newPayment = json.message
				$details.payments = [newPayment, ...$details.payments]
				$details.paySum += newPayment.amount
				$details.balance += newPayment.amount
				dialogPayment.close()
				notify.success({title: `Paiement validé`, text: `${newPayment.amount.toFixed(2)} ${newPayment.message}`})
				return
			}else{
				notify.error(json.message)
			}
		} catch(error) {
			console.trace(error)
		}
	}

</script>

<!-- Check if all is OK ! -->
<main class:tipsOpen >
	{#if $user === null}
		{$goto('/')}
	{:else}
		<div class="w3-padding"bind:offsetWidth style="max-width: 1100px; margin: auto;">

			<!-- Utilisateur -->
			<div id="userHandler">
				<!-- Règle le solde -->
				{#if clientOk && $details && $details.balance != 0}
					<div in:fade={{duration: 200}} style="display: inline-block; transform: translate(0px, 5px);" class="w3-right">
						<Button 
						variant="raised"
						style="color: white;"
						on:click={dialogPayment.open()}>
							Régler le solde de {$details.balance.toFixed(2)}
						</Button>
					</div>
				{/if}

				<!-- Recherche du client -->
				<div style="display: inline-block">
					<div class="icon iconUser">
						{#if !clientAnonym}
							<i class:far={!clientOk} class:fas={clientOk} class="fa-user w3-large"></i>
						{:else}
							<i class="fas fa-user-secret w3-large"></i>
						{/if}
					</div>
					<div style="display: inline-block; width: 260px;">
						<SearchUser modeSelect 
									id="1"
									bind:search={searchClient}
									on:input={inputSearchClient}
									on:focusin={focusInSearchClient}
									placeholder={clientPlaceHodler}
									on:select="{clientSelected}"/>
					</div>
				</div>

				{#if !clientOk}
					<div in:fade={{duration: 200}} style="display: inline-block">
						
						<!-- TODO: open LOGIN blocked for create account-->
						<Button
						on:click={dialogLogin.open}
						color="secondary"
						variant="outlined"
						class="w3-margin-left">
						<i class="fas fa-user-plus w3-large"></i>&nbsp;Nouveau
						</Button>
						<Dialog bind:this={dialogLogin}>
							<Login on:newClient={clientSelected} newUser/>
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
		</div>

		<div class:w3-padding={offsetWidth > 740} style="max-width: 1100px; margin: auto;">
			{#if clientOk}
				<slot></slot>
			{:else}

				<i class="fas fa-cash-register noUserLogo"></i>

				<!-- Cash register options-->
				<div style="position: fixed; bottom: 3em;">
					<FormField class="w3-large">
						<Switch bind:checked={$cashierOptions.autoPrintTag}></Switch>
						<span slot="label">
							<i class="fas fa-print"></i>
							Lancer l'impression d'étiquettes lors de la validation d'article fournis
						</span>
					</FormField>
				</div>
				
			{/if}
		</div>

		<Dialog bind:this={dialogPayment}>
			<Title>Règlement du solde</Title>
			{#if !!$details}
				<Content>
					<div class="w3-large" style="min-width: 400px;">
						{#if clientAnonym}
							{`Un client vous a versé ${(-$details.balance).toFixed(2)}`}
						{:else}
							{$details.balance > 0 ? 
							`Vous avez versé ${$details.balance.toFixed(2)} à ${client.name}` :
							`${client.name} vous a versé ${(-$details.balance).toFixed(2)}`}
						{/if}
					</div>
				</Content>
				<Actions>
					{#await validPaymentPromise}
						<Button>Validation en cours...</Button>
					{:then}
						<Button on:click={() => validPaymentPromise = validPayment()} variant="raised">
							Valider la transaction
						</Button>
					{/await}
				</Actions>
			{/if}
		</Dialog>

	{/if}

	{#if !adminIntegration}

		<!--<Tips bind:open={tipsOpen} headHeight={scoped.headHeight} isCashier/>-->
		<Tips bind:open={tipsOpen} isCashier/>

		{#if $troc && $troc.is_try}
			<div
				transition:fly={{y: 40, delay: 500, duration: 800}}
				style={`width: calc(100% - ${tipsOpen ? 400 : 0}px)`}
				class="try-bannear">
				<b>Troc d'entrainement</b>
			</div>
		{/if}

	{/if}
	
</main>


<svelte:head>
	<style>#waitLoaded { display: none; }</style>
</svelte:head>

<style>

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
		position: fixed;
		left: calc(50% - 70px);
		top: calc(50% - 70px);
	}

    main {
        transition: margin .4s ease;
	}
	
	main.tipsOpen {
        margin-left: 400px;
    }

</style>