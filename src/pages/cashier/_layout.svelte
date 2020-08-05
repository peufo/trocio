<script>
	
	import { redirect, params } from '@sveltech/routify'
	import { onMount } from 'svelte'
	import { fade } from 'svelte/transition'

	import Switch from '@smui/switch'
	import FormField from '@smui/form-field'
	import Button from '@smui/button'
	import Dialog from '@smui/dialog'
	import Card, {Content} from '@smui/card'
	import TabBar from '@smui/tab-bar'
	import Tab, {Icon, Label} from '@smui/tab'

	import { user, trocDetails as details } from 'stores.js'
	import { getHeader } from 'utils.js'
	import notify from 'notify.js'
	import SearchUser from 'SearchUser.svelte'
	import Login from 'Login.svelte'
	import Provide from 'Provide.svelte'

	export let client = {}
	
	let dialogLogin // Create user

	let searchClient = ''
	let clientPlaceHodlerDefault = 'Trouver un client'
	let clientPlaceHodler = clientPlaceHodlerDefault
	let clientOk = false
	let clientAnonym = false
	let popupPaymentOpen = false

	let validPaymentPromise


	//Options
	let optionAutoPrintTag = true

    onMount(async () => {

		if ($params.client) {
			try {
				let res = await fetch(`/users/name/${$params.client}`)
				client = await res.json()
				searchClient = client.name
				clientOk = true
				clientAnonym = false
			} catch (error) {
				notify.error(error.message)
			}
		}

		//Keyboard shortcut listener
		document.addEventListener('keydown', e => {
			if (e.ctrlKey) {
				switch (e.key) {
					case 'Backspace':
						searchClient = ''
						document.getElementById('searchUser1').focus()	
						break
					case 'ArrowUp':
						document.querySelector('#cashierTabs .mdc-tab[aria-selected="true"]').focus()
						break
				}	
			}
		})
	})

	async function updateClientQuery() {
		let query = {...$params}
		if (client._id) query.client = client._id
		else delete query.client
		await $redirect(location.pathname, query)
	}
    
	async function clientSelected(e){
		searchClient = e.detail.name
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

	function clickClientAnonym() {
		clientOk = true
		clientAnonym = true
		client = {}
		updateClientQuery()
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
		let res = await fetch(`/payments`, getHeader(payment))
		let json = await res.json()
		if (res.ok && json.success) {
			let newPayment = json.message
			$details.payments = [newPayment, ...$details.payments]
			$details.balance += newPayment.amount
			popupPaymentOpen = false
			notify.success({title: `Paiement validé`, text: `${newPayment.amount.toFixed(2)} ${newPayment.message}`})
			return
		}else{
			notify.error(json.message)
		}
	}

</script>

<!-- Check if all is OK ! -->
<div class="w3-padding">

	<!-- Utilisateur -->
	<div id="userHandler">
		<!-- Règle le solde -->
		{#if clientOk && $details && $details.balance != 0}
			<div in:fade={{duration: 200}} style="display: inline-block; transform: translate(0px, 5px);" class="w3-right">
				<Button 
				variant="raised"
				style="color: white;"
				on:click="{() => popupPaymentOpen = true}">
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
							bind:itemSelected={client}
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
				on:click="{() =>  dialogLogin.open()}"
				color="secondary"
				variant="outlined"
				class="w3-margin-left">
				<i class="fas fa-user-plus w3-large"></i>&nbsp;Nouveau
				</Button>
				<Dialog bind:this={dialogLogin}>
					<Login id="NewClient" on:newClient={clientSelected} newUser/>
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

	{#if clientOk}

		<br>
		<slot></slot>
		
	{:else}

		<i class="fas fa-cash-register noUserLogo"></i>

		<!-- Cash register options-->
		<div style="position: fixed; bottom: 1em;">
			<FormField class="w3-large">
				<Switch bind:checked={optionAutoPrintTag}></Switch>
				<span slot="label">
					<i class="fas fa-print"></i>
					Lancer l'impression d'étiquettes lors de la validation d'article fournis
				</span>
			</FormField>
		</div>
		
	{/if}

</div>

{#if popupPaymentOpen}
	<div class="w3-modal" transition:fade|local={{duration: 150}}>
		<div class="w3-modal-content w3-padding w3-round">
			<div class="w3-right w3-padding close-icon" on:click="{() => popupPaymentOpen = false}">
				<i class="fa fa-times w3-large"></i>
			</div>
			<br><br>
			{#if clientAnonym}
				<div class="w3-center w3-xlarge">
					{`Un client vous a versé ${(-$details.balance).toFixed(2)}`}
				</div>
			{:else}
				<div class="w3-center w3-xlarge">
					{$details.balance > 0 ? `Vous avez versé ${$details.balance.toFixed(2)} à ${client.name}`: `${client.name} vous a versé ${(-$details.balance).toFixed(2)}`}
				</div>
			{/if}
			<br>
			{#await validPaymentPromise}
				<Button class="w3-right">
					Validation en cours...
				</Button>
			{:then}
				<Button on:click={() => validPaymentPromise = validPayment()} variant="raised" class="w3-right">
					Valider la transaction
				</Button>
			{/await}
			<br><br>
		</div>
	</div>
{/if}


<svelt:head>
	<style>#waitLoaded { display: none; }</style>
</svelt:head>

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
		position: absolute;
		left: calc(50% - 70px);
		top: calc(50% - 70px);
	}

	.w3-modal {
		display: block;
	}

</style>