<script>
	import { troc } from './stores'
	import SearchUser from './SearchUser.svelte'
	import UserLi from './UserLi.svelte'


	export let _id = ''
	export let name = ''
	export let apply = []
	export let margin = 0
	export let fee = []
	export let bydefault = false		
	

	function removeFee(i) {
		fee.splice(i, 1)
		fee = fee
	}
	function removeApply(i) {
		apply.splice(i, 1)
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



</script>

<div id="tarif" class="w3-card w3-padding w3-round w3-margin-bottom">

	<input bind:value={name} type="text" placeholder="Nom du tarif" readonly={bydefault} class="w3-input w3-large w3-center">
	<br>

	<!-- Margin -->
	<div class="w3-row">
		<div class="w3-col m5 w3-padding">
			Votre part sur les articles vendus:
		</div>

		<div class="number w3-col">
			<input bind:value="{pourcent}" class="w3-input" type="number" min="0" max="50">			
		</div>
		<div class="w3-padding"><i class="fas fa-percent"></i></div>
	</div>
	
	<hr>

	<!-- fee -->
	<div class="w3-row">
		<div class="w3-col m5 w3-padding">
			Frais de traitement d'un article:
		</div>

		<div class="w3-col m7">
			<!-- -->
			{#each fee as f, i}
				<div class="fee">
					A partir du prix:
					<div class="number">
						<input 	bind:value={f.price} 
								class="w3-input" 
								type="number" 
								min="{i == 0 ? 0 : fee[i - 1].price}" 
								max="{i == fee.length - 1 ? '' : fee[i + 1].price}">
					</div>
					&nbsp;&nbsp;&nbsp;Frais:
					<div class="number">
						<input 	bind:value={f.value} 
								class="w3-input" 
								type="number" 
								min="{i == 0 ? 0 : fee[i - 1].value}" 
								max="{i == fee.length - 1 ? '' : fee[i + 1].value}">
					</div>
					<i 	on:click="{() => removeFee(i)}"
						class="fa fa-times w3-large w3-right w3-padding"></i>
				</div>
			{/each}

			<div on:click="{addFee}"
				class="w3-button w3-border w3-round w3-margin-top w3-right">
				Ajouter
			</div>
			
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
				<SearchUser on:select="{e => apply = [...apply, e.detail]}"
							exepted={apply}
							placeholder="Ajouter un utilisateur soumit au tarif {name}"/>
			</div>

			<br>
		{/if}
	</div>


</div>

<style>
	#tarif {
		max-width: 850px;
		margin: auto;
	}
	.number {
		width: 70px;
		display: inline-block;
	}
	.fee i {
		display: none;
		cursor: pointer;
	}

	.fee:hover i {
		display: block;
	}

	.fee i:hover {
		transform:scale(1.2);
		color: red;
	}
</style>
