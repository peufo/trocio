<script>
    import { onMount } from 'svelte'
    import { troc } from './stores'
	import { crossfade } from 'svelte/transition'
    import { flip } from 'svelte/animate'
    import { getHeader, crossfadeConfig } from './utils'
    import Article from './Article.svelte'

    export let userId = false
    export let trocId = false
    export let purchases = []
    export let purchasesPromise
    export let givebacks = []
    export let givebacksPromise

    let validPromise

    const [send, receive] = crossfade(crossfadeConfig)

    const LIMIT_LIST_INIT = 5 //Nombre d'élément d'une liste afficher initialement
    let LIMIT_LIST_A = LIMIT_LIST_INIT //Nombre d'élément afficher pour la premier liste
    let LIMIT_LIST_B = LIMIT_LIST_INIT //Nombre d'élément afficher pour la seconde liste

    onMount(() => {
        givebacksPromise = getGivebacks()
    })

    async function getGivebacks() {
        let res = await fetch(`/articles?giveback.user=${userId}&troc=${trocId}`)
		let json = await res.json()		
        if (res.ok) {
			givebacks = json.map(art => {
                let { raison, time} = getMyLastGiveBack(art)
                art.givebackRaison = raison
                art.givebackTime = new Date(time).getTime()
                return art
            })
            return
        }
	}

    function select(artId) {
        let raison = prompt('Quelle est la raison du retour ?')
        if (raison != null) {
            let index = purchases.map(art => art._id).indexOf(artId)
            if (index != -1) {
                let back = purchases[index]
                if (!back.giveback) back.giveback = []
                back.giveback = [...back.giveback, {sold: back.sold, back: new Date(), raison, user: userId}]
                back.isRemovable = true
                givebacks = [back, ...givebacks]
                givebacks[0].givebackRaison = raison
                givebacks[0].givebackTime = new Date().getTime()

                purchases.splice(index, 1)
                purchases = purchases
            }
        }
    }

    function remove(artId) {
        let index = givebacks.map(art => art._id).indexOf(artId)
        if (index != -1) {
            purchases = [...givebacks.splice(index, 1), ...purchases]
            purchases[0].isRemovable = false
            givebacks = givebacks
        }
    }

    async function valid() {
        let date = new Date()
        let newGivebacks = givebacks.filter(art => art.isRemovable).map(art => {
            let giveback = art.giveback[art.giveback.length - 1]
            giveback.back = date
            return {_id: art._id, giveback}
        })
        let res = await fetch('/articles/giveback', getHeader(newGivebacks))
        let json = await res.json()
        if (res.ok && json.success) {
            //let givebacksUpdated = json.message
            givebacks = givebacks.map(art => {
                art.isRemovable = false
                art.sold = undefined
				art.buyer = undefined
                return art
            })
            
        }
        return
    }

    function getMyLastGiveBack(art) {
        let backs = []
        if (userId) {
            backs = art.giveback.filter(back => back.user == userId)
        }else{
            backs = art.giveback.filter(back => !back.user)
        }
        let raison = backs.length == 0 ? '' : backs[backs.length - 1].raison
        let time = backs.length == 0 ? 0 : backs[backs.length - 1].back
        return { raison, time }
    }

</script>

<div class="w3-row">

    <div class="w3-col s6">
        <div class="w3-margin-right">
            
            <h4>Achats</h4>
        
            {#await purchasesPromise}
                <div class="w3-center"><img src="favicon.ico" alt="Logo Trocio" class="w3-spin"></div>
            {:then}
                {#each purchases.slice(0, LIMIT_LIST_A) as article (article._id)}
                    <div in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">
                        <Article article={article} timeKey={'soldTime'} clickable on:select="{() => select(article._id)}"/>
                    </div>
                {:else}
                    <span class="w3-opacity">Pas d'achat à retourner</span>
                {/each}

                <!-- Bouton pour prolongé la liste -->
                {#if purchases.length > LIMIT_LIST_A}
                    <div on:click="{() => LIMIT_LIST_A += 25}" class="underline-div w3-center">
                        <span class="underline-span w3-opacity">
                            Afficher plus d'éléments ({purchases.length - LIMIT_LIST_A})
                        </span>
                    </div>
                {/if}
            {/await}
        </div>
    </div>

    <div class="w3-col s6">
        <div class="w3-margin-left">
            {#await validPromise}
                <div class="w3-right w3-round validButton">
                    <i class="fas fa-circle-notch w3-spin"></i>
                    Validation du retour...
                </div>
            {:then}
                <div class="w3-right w3-round validButton hide" class:visible={givebacks.filter(art => art.isRemovable).length} on:click="{() => validPromise = valid()}">
                    Valider le retour de{givebacks.filter(art => art.isRemovable).length <= 1 ? ` l'article` : `s ${givebacks.filter(art => art.isRemovable).length} articles`}
                </div>
            {/await}
            
            <h4>Retours</h4>

            {#await givebacksPromise}
                <div class="w3-center"><img src="favicon.ico" alt="Logo Trocio" class="w3-spin"></div>
            {:then}
                {#each givebacks.sort((a, b) => b.givebackTime - a.givebackTime).slice(0, LIMIT_LIST_B) as article (article._id)}
                    <div in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">
                        <Article article={article}
                            on:remove="{() => remove(article._id)}"
                            comment="{article.givebackRaison}"/>
                    </div>
                {:else}
                    <span class="w3-opacity">Pas de retour</span>
                {/each}

                    <!-- Bouton pour prolongé la liste -->
                    {#if givebacks.length > LIMIT_LIST_B}
                        <div on:click="{() => LIMIT_LIST_B += 25}" class="underline-div w3-center">
                            <span class="underline-span w3-opacity">
                                Afficher plus d'éléments ({givebacks.length - LIMIT_LIST_B})
                            </span>
                        </div>
                    {/if}
            {/await}
        </div>
    </div>

</div>

