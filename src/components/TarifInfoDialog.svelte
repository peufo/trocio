<script>
	import Dialog, { Title, Content } from '@smui/dialog'
	
    import { trocDetails as details } from './stores.js'

    export let dialog

</script>

<Dialog bind:this={dialog}>
    {#if $details && $details.tarif}
		<Title>Vous êtes soumis au tarif <b>{$details.tarif.name}</b>: </Title>
		<Content>
			<h5>Nombre maximum d'article proposés</h5><br>
			<div style="text-align: center;">
				<b>{$details.tarif.maxarticles}</b> <i class="fas fa-cube"></i>
			</div>
			<br><br>

			<h5>Frais de traitement
				<span class="w3-small w3-opacity">Appliqué au dépot de l'article</span>
			</h5><br>
			<div style="text-align: center;">
				{#each $details.tarif.fee.sort((a, b) => a.price - b.price) as fee}
					A partir de <b>{fee.price.toFixed(2)} </b><i class="fas fa-arrow-right"></i> <b>{fee.value.toFixed(2)}</b>
					<br>
				{/each}
			</div>
			<br><br>

			<h5>Marge
				<span class="w3-small w3-opacity">Appliquée à la vente de l'article</span>
			</h5><br>
			<div style="text-align: center;">
				<b>{$details.tarif.margin * 100}</b> <i class="fas fa-percent"></i>
			</div>
			<br>
			
		</Content>
    {/if}
</Dialog>
