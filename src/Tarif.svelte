<script>
	import { slide } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	import SearchUser from './SearchUser.svelte'
	import UserLi from './UserLi.svelte'

	export let index = 0
	export let name = ''
	export let apply = []
	export let margin = 0
	export let fee = []
	export let maxarticles = 0
	export let bydefault = false		

	function removeFee(i) {
		fee.splice(i, 1)
		fee = fee
	}
	function removeApply(i) {
		apply.splice(i, 1)
		dispatch('removeUser')
		apply = apply
	}

	function addFee() {
		let last = fee.length - 1
		if (last == -1) {
			fee = [...fee, {price: 0, value: 0.5}]
		}else{
			fee = [...fee, {price: fee[last].price + 1, value: fee[last].value + 1}]
		}
	}


	let pourcent = margin * 100
	//Pas util de calculé à chaque fois
	$: margin = pourcent / 100

	function checkRangePrice(e, i) {
		if (e.target.min && fee[i].price < e.target.min) fee[i].price = Number(e.target.min)
		if (e.target.max && fee[i].price > e.target.max) fee[i].price = Number(e.target.max)
	}

	function checkRangeValue(e, i) {
		if (e.target.min && fee[i].value < e.target.min) fee[i].value = Number(e.target.min)
		if (e.target.max && fee[i].value > e.target.max) fee[i].value = Number(e.target.max)
	}

	function remove() {
		if (confirm(`Etes-vous sur de vouloir supprimer le tarif "${name}"`)) {
			dispatch('remove')
		}
	}

	function addApply(e) {
		apply = [...apply, e.detail]
		dispatch('selectUser')
	}


</script>

<div class="tarif w3-card w3-padding w3-round w3-margin-bottom" in:slide>

	<input bind:value={name} type="text" placeholder="Nom du tarif" readonly={bydefault} class="name w3-input w3-large w3-center">
	<i 	on:click="{remove}" 
		class:w3-hide={bydefault}
		class="remove fa fa-times w3-large w3-right w3-padding"></i>

	<br>

	<!-- Margin -->
	<div class="w3-row">
		<div class="w3-col m5 w3-padding">
			Votre part sur les articles vendus:
		</div>

		<div class="number w3-col">
			<input bind:value="{pourcent}" class="w3-input" type="number" min="0" max="50">			
		</div>
		<div class="w3-padding">
			<i class="fas fa-percent"></i>
		</div>
	</div>
	
	<hr>

	<!-- fee -->
	<div class="w3-row">
		<div class="w3-col m5 w3-padding">
			Frais de traitement d'un article:
		</div>

		<div class="w3-col m7">
			{#each fee as f, i}
				<div class="fee">
					A partir du prix:
					<div class="number">
						<input 	bind:value={f.price}
								class="w3-input" 
								type="number"
								on:keyup="{e => checkRangePrice(e, i)}"
								min="{i == 0 ? 0 : fee[i - 1].price}" 
								max="{i == fee.length - 1 ? '' : fee[i + 1].price}">
					</div>
					&nbsp;&nbsp;&nbsp;Frais:
					<div class="number">
						<input 	bind:value={f.value} 
								class="w3-input" 
								type="number" 
								on:keyup="{e => checkRangeValue(e, i)}"
								min="{i == 0 ? 0 : fee[i - 1].value}" 
								max="{i == fee.length - 1 ? '' : fee[i + 1].value}">
					</div>
					<i 	on:click="{() => removeFee(i)}"
						class="patchButton fa fa-times w3-large w3-right w3-padding"></i>
				</div>
			{/each}

			<div on:click="{addFee}"
				class="patchButton w3-button w3-border w3-round w3-margin-top w3-right">
				+1 règle
			</div>
			
		</div>

	</div>
	
	<hr>

	<!-- Nombre maximum d'article autorisé (maxarticles) -->
	<div class="w3-row">
		<div class="w3-col m5 w3-padding">
			Nombre maximum d'article autorisés:
		</div>

		<div class="w3-col number">
			<input bind:value={maxarticles} class="w3-input" type="number" max="9999">
		</div>
		<div class="w3-padding">
			<i class="fas fa-cube"></i>
		</div>

	</div>

	<hr>

	<!-- Apply -->
	<div class="w3-row">
		{#if bydefault}
			<div class="w3-center w3-padding">
				Est appliqué par défault
			</div>
		{:else}
			<div class="w3-col m5 w3-padding">
				Valable pour:
			</div>

			<div class="w3-col m7">
				<ul class="w3-ul w3-border-left">
				{#each apply as a, i}
					<UserLi user={a} on:remove="{() => removeApply(i)}"/>
				{/each}
				</ul>
				<SearchUser 
				id={`tarif${index}`}
				on:select="{addApply}"
				exepted={apply}
				placeholder="{`Ajouter un utilisateur soumit au tarif "${name}"`}"/>
			</div>

			<br>
		{/if}
	</div>


</div>


<style>
	.tarif {
		max-width: 850px;
		margin: auto;
	}
	.name {
		width: calc(100% - 40px)
	}

	.tarif {
		position: relative;
	}

	.remove {
		position: absolute;
		top: 10px;
		right: 10px;
	}
	.number {
		width: 70px;
		display: inline-block;
	}

	.fa-times {
		transform: scale(0);
		transition: all 0.2s ease;
		cursor: pointer;
	}
	.fee:hover .fa-times, #tarif:hover #remove {
		transform: scale(1);
	}
	.fee .fa-times:hover, #tarif #remove:hover {
		transform:scale(1.2);
		color: red;
	}
	
</style>
