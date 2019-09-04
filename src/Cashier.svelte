<script>
	import { onMount } from 'svelte'
	import { fade } from 'svelte/transition'
    import { troc } from './stores'
	import SearchUser from './SearchUser.svelte'
	import Provide from './Provide.svelte'
	import Buy from './Buy.svelte'
	import Recover from './Recover.svelte'
	import Giveback from './Giveback.svelte'

	let user = {}
	let userOk = false

	let action = 3
	let actions = [
		{id: 0, name: 'Fournit', icon: '<i class="fas fa-sign-in-alt"></i>'},
		{id: 2, name: 'Récupère', icon: '<i class="fas fa-sign-out-alt"></i>'},
		{id: 1, name: 'Achète', icon: '<i class="fas fa-shopping-basket"></i>'},
		{id: 3, name: 'Retourne', icon: '<i class="fas fa-undo"></i>'},
		{id: 4, name: 'Aperçue', icon: '<i class="far fa-eye"></i>'},
	]

	let provided = [] 	//List of articles provided
	let proposed = []	//List of articles proposed
	let recovered = [] 	//List of articles recovered
	let purchases = [] 	//List of articles buyed
	let givebacks = []  //List of articles returned
	let providedPromise //and there promise
	let purchasesPromise
	let givebacksPromise


    onMount(() => {
		if (document.location.hash.substr(1).length == 24) {
			troc.find(document.location.hash.substr(1))
		} else {
			$troc = {failed: true, reason: 'Bad request'}
		}
    })
    
	function userSelected(e){
		user = e.detail
		getArticles()
	}

	function getArticles() {
		providedPromise = getProvided()
		purchasesPromise = getPurchases()
		givebacksPromise = getGivebacks()
	}

	async function getProvided() {
		let res = await fetch(`/articles?troc=${$troc._id}&provider=${user._id}`)
		let json = await res.json()
		if (res.ok) {
			proposed = json.filter(art => !art.valided)
			//proposed = addTime(json.filter(art => !art.valided), 'createdAt', 'proposedTime')
			provided = addTime(json, 'valided', 'validTime')
			recovered = addTime(json, 'recover', 'recoverTime')
			return
		}
	}

	async function getPurchases() {
        let res = await fetch(`/articles?buyer=${user._id}`)
        let json = await res.json()
        if (res.ok) {
			purchases = addTime(json, 'sold', 'soldTime')
            return
        }
	}

	async function getGivebacks() {
        let res = await fetch(`/articles?giveback.user=${user._id}`)
        let json = await res.json()
        if (res.ok) {
			givebacks = json
            return
        }
	}
	
	//Filtre et ajoute time
	function addTime(arr, keyIn, keyOut) {
		let lastTime = 0
		let out = arr.filter(elem => elem[keyIn])
		.map(elem => {
			elem[keyOut] = new Date(elem[keyIn]).getTime()
			return elem
		})
		.sort((a, b) => b[keyOut] - a[keyOut]).map(elem => {
			if (elem[keyOut] && elem[keyOut] != lastTime) {
				lastTime = elem[keyOut]
			}else{
				elem[keyOut] = 0
			}
			return elem
		})
		return out
	}

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
			<div class="w3-col s6 w3-padding">
				<div class="icon iconUser">
					<i class:far={!userOk} class:fas={userOk} class="fa-user w3-large"></i>
				</div>
				<div class="w3-right" style="width: calc(100% - 22px);">
					<SearchUser modeSelect 
								id="1"
								search=".com"
								placeholder="Trouver un client"
								bind:selectOk={userOk}
								on:select="{userSelected}"/>
				</div>
			</div>

			<!-- Règle le solde -->
			<div class:visible={userOk} class="hide w3-col s6 w3-padding">
				<div class="validButton w3-right w3-round">Régler le solde de 200.00 </div>
			</div>
			
		</div>


		{#if userOk}
		<div style="height: calc(100% - 126px);">

			<!-- Action -->
			<div class="onglets w3-margin-top w3-border-top">
				{#each actions as tab, i}
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
					<Provide bind:user bind:provided bind:proposed bind:articlesPromise={providedPromise} />
				</div>

				<!-- Achète -->
				<div class="tab" class:center={action == 1} class:left={action > 1} class:right={action < 1}>
					<br>
					<Recover bind:user bind:provided bind:recovered articlesPromise={providedPromise}/>
				</div>

				<!-- Récupère -->
				<div class="tab" class:center={action == 2} class:left={action > 2} class:right={action < 2}>
					<br>
					<Buy bind:user bind:purchases bind:purchasesPromise/>
				</div>

				<!-- Retourne -->
				<div class="tab" class:center={action == 3} class:left={action > 3} class:right={action < 3}>
					<br>
					<Giveback bind:user bind:purchases  bind:purchasesPromise bind:givebacks bind:givebacksPromise />
				</div>
			
				<!-- Aperçue -->
				<div class="tab" class:center={action == 4} class:right={action < 4}>
					<br>
					aperçue
				</div>

			</div>

		</div>
		{:else}
			<div class="w3-display-container" style="z-index: -1;">
				<div class="w3-display-middle w3-center">
					<i class="fas fa-cash-register noUserLogo"></i>
					<br>
				</div>
			</div>
		{/if}

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

</style>