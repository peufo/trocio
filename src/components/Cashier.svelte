<script>
	import { user } from '../stores'
	
	import { onMount, onDestroy, tick } from 'svelte'
	import { fade } from 'svelte/transition'
	import Switch from '@smui/switch'
	import FormField from '@smui/form-field'
	import Button from '@smui/button'
	import Dialog from '@smui/dialog'
	import Card, {Content} from '@smui/card'
	import TabBar from '@smui/tab-bar'
	import Tab, {Icon, Label} from '@smui/tab'

	import { getHeader } from './utils'
	import SearchUser from './SearchUser.svelte'
	import Provide from './Provide.svelte'
	import Buy from './Buy.svelte'
	import Recover from './Recover.svelte'
	import Giveback from './Giveback.svelte'
	import Resume from './Resume.svelte'
	import Login from './Login.svelte'

	export let mobileDisplay = false
	export let troc = ''
	export let client = {}

	export let provided = []
	export let purchases = []
	export let payments = []
	export let givebacks = []

	$: console.log('clientOk', clientOk)
	$: console.log('payments', payments)

	let dialogLogin // Create user

	let searchClient = ''
	let clientPlaceHodlerDefault = 'Trouver un client'
	let clientPlaceHodler = clientPlaceHodlerDefault
	let clientOk = false
	let clientAnonym = false
	let popupPaymentOpen = false

	let actions = [
		{component: Provide,	label: 'Fournit', 		icon: 'fas fa-sign-in-alt'},
		{component: Recover,	label: 'Récupère', 		icon: 'fas fa-sign-out-alt'},
		{component: Buy,		label: 'Achète', 		icon: 'fas fa-shopping-basket', clientAnonymAutorised: true},
		{component: Giveback,	label: 'Retourne', 		icon: 'fas fa-undo', 			clientAnonymAutorised: true},
		{component: Resume,		label: 'Aperçu', 		icon: 'far fa-eye', 			clientAnonymAutorised: true},
	]
	let tabActive = actions[4]

	let tarif = undefined //bind to Resume.svelte
	let validPaymentPromise

	let balance = 0 //bind to Resume.svelte



	//Options
	let optionAutoPrintTag = true


    onMount(() => {

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
		//let query = queryString.parse(location.search)
		if (client._id) query.client = client._id
		else delete query.client
		await goto(`${location.pathname}?${queryString.stringify(query)}`)
		await tick()
		tabActive = tabActive
	}
    
	function clientSelected(e){
		clientOk = true
		clientAnonym = false
		updateClientQuery()
		searchClient = e.detail.name
		
		//client = e.detail // is binded
	}

	function inputSearchClient() {

		clientOk = false
		clientAnonym = false
		client = {}
		//updateClientQuery()
		clientPlaceHodler = clientPlaceHodlerDefault
	}

	function focusInSearchClient() {
		clientOk = false
		clientAnonym = false
		client = {}
		//updateClientQuery()
		clientPlaceHodler = clientPlaceHodlerDefault
		searchClient = ''
	}

	function clickClientAnonym() {
		clientOk = true
		clientAnonym = true
		client = {}
		updateClientQuery()
		tabActive = actions.filter(a => !clientAnonym || a.clientAnonymAutorised)[0]
		searchClient = ''
		clientPlaceHodler = 'Anonyme'
	}

	//Post payment
	async function validPayment() {
		let payment = {
			acceptor: user._id,
			user: client._id,
			troc,
			amount: -balance, 
			message: balance > 0 ? `Versé par ${user.name}` : `Encaissé par ${user.name}`
		}
		let res = await fetch(`/payments`, getHeader(payment))
		let json = await res.json()
		if (res.ok && json.success) {
			payments = [json.message, ...payments]
			popupPaymentOpen = false
			return
		}
	}

</script>

<!-- Check if all is OK ! -->
<div class="w3-padding">

	<!-- Utilisateur -->
	<div id="userHandler">
		<!-- Règle le solde -->
		{#if clientOk && balance != 0}
			<div in:fade={{duration: 200}} style="display: inline-block; transform: translate(0px, 5px);" class="w3-right">
				<Button 
				variant="raised"
				style="color: white;"
				on:click="{() => popupPaymentOpen = true}">
					Régler le solde de {balance.toFixed(2)}
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
		<Card id="cashierContainer" class="w3-margin-top">
			<TabBar bind:active={tabActive}
			id="cashierTabs"
			tabs={actions.filter(a => !clientAnonym || a.clientAnonymAutorised)}
			let:tab
			style="border-radius: 4px 4px 0px 0px; border-bottom: 1px solid rgb(240, 240, 240);">
				<Tab {tab} style="border-radius: 4px 4px 0px 0px;">
					<Icon class={tab.icon}></Icon>
					{#if !mobileDisplay}
						<Label>{tab.label}</Label>
					{/if}
				</Tab>
			</TabBar>

			<Content>
				
				<svelte:component this={tabActive.component} userId={client._id} trocId={troc} {client} {provided} {purchases} {givebacks} {payments} />

			</Content>
		
		</Card>
		
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
					{`Un client vous a versé ${(-balance).toFixed(2)}`}
				</div>
			{:else}
				<div class="w3-center w3-xlarge">
					{balance > 0 ? `Vous avez versé ${balance.toFixed(2)} à ${client.name}`: `${client.name} vous a versé ${(-balance).toFixed(2)}`}
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
	/*
	#userHandler {
		display: flex;
		justify-content: center;
	}
	*/

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