<script>
    import { onMount } from 'svelte'
	import { crossfade } from 'svelte/transition'
    import { flip } from 'svelte/animate'
    import { params } from '@roxi/routify'
    import Button from '@smui/button'

    import { getHeader, crossfadeConfig } from './utils'
    import Article from './Article.svelte'
    import { trocDetails as details, trocDetailsPromise as detailsPromise} from './stores.js'
    import notify from './notify.js'
    import { troc } from './stores'

    let validPromise

    const [send, receive] = crossfade(crossfadeConfig)

    const LIMIT_LIST_INIT = 5 //Nombre d'élément d'une liste afficher initialement
    let LIMIT_LIST_A = LIMIT_LIST_INIT //Nombre d'élément afficher pour la premier liste
    let LIMIT_LIST_B = LIMIT_LIST_INIT //Nombre d'élément afficher pour la seconde liste

    /*
    async function getGivebacks() {
        let res = await fetch(`/__API__/articles?user_giveback.user=${$details.user}&troc=${$details.troc}`)
		let json = await res.json()		
        if (res.ok) {
			$details.givebacks = json.data.map(art => {
                let { raison, time} = getMyLastGiveBack(art)
                art.giveback.raison = raison
                art.giveback.back = new Date(time).getTime()
                return art
            })
            return
        }
    }

    
    function getMyLastGiveBack(art, user) {
        let backs = art.giveback.filter(back => back.user == user).reverse()[0]

        let raison = backs.length == 0 ? '' : backs[backs.length - 1].raison
        let time = backs.length == 0 ? 0 : backs[backs.length - 1].back
        return { raison, time }
    }
    */
    function select(artId) {
        let raison = prompt('Quelle est la raison du retour ?')
        if (raison != null) {
            let index = $details.purchases.map(art => art._id).indexOf(artId)
            if (index != -1) {
                let back = $details.purchases[index]
                let newBack = $params.client && $params.client !== 'undefined' ? {user: $params.client} : {}
                newBack = {...newBack, sold: back.sold, back: new Date(), raison}
                if (!back.giveback) back.giveback = []
                back.giveback = [...back.giveback, newBack]
                back.isRemovable = true
                $details.givebacks = [back, ...$details.givebacks]
                $details.givebacks[0].giveback.raison = raison
                $details.givebacks[0].giveback.back = new Date().getTime()

                $details.purchases.splice(index, 1)
                $details.purchases = $details.purchases
            }
        }
    }

    function remove(artId) {
        let index = $details.givebacks.map(art => art._id).indexOf(artId)
        if (index != -1) {
            $details.purchases = [...$details.givebacks.splice(index, 1), ...$details.purchases]
            $details.purchases[0].isRemovable = false
            $details.givebacks = $details.givebacks
        }
    }

    async function valid() {
        let date = new Date()
        let newGivebacks = $details.givebacks.filter(art => art.isRemovable).map(art => {
            let giveback = art.giveback[art.giveback.length - 1]
            giveback.back = date
            return {_id: art._id, giveback}
        })
        try {
            let res = await fetch('/__API__/articles/giveback', getHeader(newGivebacks))
            let json = await res.json()
            if (res.ok && json.success) {
                let givebacksUpdated = json.message
                let priceSum = givebacksUpdated.map(art => art.price).reduce((acc, cur) => acc += cur)
                $details.buySum += priceSum
                $details.balance += priceSum
    
                //Reset
                $details.givebacks = $details.givebacks.map(art => {
                    art.isRemovable = false
                    art.sold = undefined
                    art.buyer = undefined
                    return art
                })
                
                notify.success(givebacksUpdated.length > 1 ? `${givebacksUpdated.length} artciles retournés` : 'Un article retourné')
    
            }else{
                notify.error(json.message)
            }
            return
        } catch(error) {
			console.trace(error)
		}
    }

</script>

<div class="w3-row">

    <div class="w3-col m6">
        <div class="w3-margin-right">
            
            <h4>Achats</h4>
        
            {#each $details.purchases.slice(0, LIMIT_LIST_A) as article (article._id)}
                <div in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">
                    <Article article={article} timeKey={'soldTime'} clickable on:select="{() => select(article._id)}"/>
                </div>
            {:else}
                <span class="w3-opacity">Pas d'achat à retourner</span>
            {/each}

            <!-- Bouton pour prolongé la liste -->
            {#if $details.purchases.length > LIMIT_LIST_A}
                <div on:click="{() => LIMIT_LIST_A += 25}" class="underline-div w3-center">
                    <span class="underline-span w3-opacity">
                        Afficher plus d'éléments ({$details.purchases.length - LIMIT_LIST_A})
                    </span>
                </div>
            {/if}

        </div>
    </div>

    <div class="w3-col m6">
        <div class="w3-margin-left">

            {#await validPromise}
                <Button class="w3-right" variant="outlined">
                    <i class="fas fa-circle-notch w3-spin"></i>
                    Validation du retour...
                </Button>
            {:then}
                {#if $details.givebacks.filter(art => art.isRemovable).length}
                    <Button on:click="{() => validPromise = valid()}" class="w3-right" variant="raised">
                        Valider le retour de{$details.givebacks.filter(art => art.isRemovable).length <= 1 ? ` l'article` : `s ${$details.givebacks.filter(art => art.isRemovable).length} articles`}
                    </Button>
                {/if}
            {/await}
            
            <h4>Retours</h4>

            {#each $details.givebacks.sort((a, b) => b.giveback.back - a.giveback.back).slice(0, LIMIT_LIST_B) as article (article._id)}
                <div in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">
                    <Article article={article}
                        on:remove="{() => remove(article._id)}"
                        comment="{article.giveback.raison}"/>
                </div>
            {:else}
                <span class="w3-opacity">Pas de retour</span>
            {/each}

            <!-- Bouton pour prolongé la liste -->
            {#if $details.givebacks.length > LIMIT_LIST_B}
                <div on:click="{() => LIMIT_LIST_B += 25}" class="underline-div w3-center">
                    <span class="underline-span w3-opacity">
                        Afficher plus d'éléments ({$details.givebacks.length - LIMIT_LIST_B})
                    </span>
                </div>
            {/if}
            
        </div>
    </div>

</div>

