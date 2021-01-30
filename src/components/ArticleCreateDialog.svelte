<script>
	import { createEventDispatcher } from 'svelte'
    import Dialog, { Title, Content } from '@smui/dialog'
    import Button from '@smui/button'

    import { trocDetails as details } from './stores.js'
    import { addStatutField, formatPrice, getHeader } from './utils.js'
    import notify from './notify.js'

    export let dialog = {}
	export let createPromise = {}
	const dispatch = createEventDispatcher()
	let newName = ''
    let newPrice = ''
    
	async function createArticle(e) {

		if ($details.tarif && $details.provided.length + 1 > $details.tarif.maxarticles) {
			notify.warning({
				title: `Trop d'articles`,
				text: `Vous avez atteint le nombre maximal d'articles pouvant être proposés.\nRenseignez-vous auprès de l'organisateur pour lever cette limite.`
			})
			return
		}
		
		try {
			let body = {troc: $details.troc, provider: $details.user, name: newName, price: newPrice}
			console.log(body)
			let res = await fetch('/__API__/articles', getHeader(body))
			let json = await res.json()
			if (json.success) {
				
				$details.provided = [...$details.provided, addStatutField(json.message[0])]
				
				newName = ''
				newPrice = ''

				//preserve dialog
				//document.getElementById(`newArticleName`).focus()
				dialog.close()
				dispatch('articleCreated')
				notify.success('Article ajouté')
				return
				
			}else notify.error(json.message)
		} catch (error) {
			notify.error(error.message)
		}
    }

</script>

<Dialog bind:this={dialog}>
    <Title>Proposer un article</Title>
    <Content>
        <textarea id="newArticleName" cols="30" rows="3" placeholder="Désignation" bind:value={newName}></textarea>
        <input use:formatPrice style="width: 30%; height: 36px;" bind:value={newPrice}  />
        {#await createPromise}
            <Button color="secondary" variant="outlined" class="w3-right">
                <i class="fas fa-circle-notch w3-spin"></i>&nbsp;Création de l'article ...
            </Button>
        {:then}
            <Button variant="outlined" class="w3-right" on:click={e => createPromise = createArticle(e)}>
                Valider
            </Button>
        {/await}
    </Content>
</Dialog>
