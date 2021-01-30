<script>
    import { flip } from 'svelte/animate'
    import Button from '@smui/button'
    import { crossfade } from 'svelte/transition'
    
    import { getHeader, crossfadeConfig, sortByUpdatedAt, sortByRecover, addStatutField } from './utils.js'
    import Article from './Article.svelte'
    import { user, troc, trocDetails as details } from './stores.js'
    import notify from './notify.js'
    
    let validPromise // valid button

    const [send, receive] = crossfade(crossfadeConfig)
    
    const providedFilter = art => art.valided && !art.sold && !art.recover && !art.isRemovable
    const recoverFilter = art => art.recover && art.isRemovable

    const LIMIT_LIST_INIT = 5 //Nombre d'élément d'une liste afficher initialement
    let LIMIT_LIST_A = LIMIT_LIST_INIT //Nombre d'élément afficher pour la premier liste
    let LIMIT_LIST_B = LIMIT_LIST_INIT //Nombre d'élément afficher pour la seconde liste

    function recover(e) {

        let index = $details.provided.map(art => art._id).indexOf(e.detail._id)
        $details.provided[index].recover = new Date()
        $details.provided[index].updatedAt = new Date()
        $details.provided[index].isRemovable = true

    }

    function recoverAll() {
        /*
        let all = provided.filter(providedFilter)
        all.forEach((art, i) => {
            art.recover = new Date()
            art.isRemovable = true
        }) 
        provided = provided
        */
        $details.provided = $details.provided.map((art, i) => {
            if (providedFilter(art)){
                art.recover = new Date()
                art.updatedAt = new Date()
                art.isRemovable = true
            }
            return art
        })
    }

    async function valid() {
        let articlesRecover = $details.provided.filter(recoverFilter)
        try {
            let res = await fetch('/__API__/articles', getHeader(articlesRecover, 'PATCH'))
            let json = await res.json()
            if (res.ok && json.success) {
                let articlesPatched = json.message

                //Tri pour vité un mélange due à l'asynchrone de la sauvegarde en backend
                
                articlesPatched.sort(sortByRecover).forEach((art, i) => {
                    art.updatedAt = new Date(art.recover)
                })

                //Fait le lien entre les articles mis à jour et provided
                let providedMapId = $details.provided.map(a => a._id)
                let providedIndex = articlesPatched.map(art => providedMapId.indexOf(art._id))
                providedIndex.forEach((provIndex, patchedIndex) => {
                    $details.provided[provIndex] = addStatutField(articlesPatched[patchedIndex])
                })

                let nb = articlesPatched.length
                notify.success(`${nb>1?nb:'Un'} article${nb>1?'s':''} récupéré${nb>1?'s':''} par le client`)

                return
            }
        } catch (error) {
            console.log(error)
            notify.error(error.message)
            return
        }
    }

    function remove(e) {
        let index = $details.provided.map(art => art._id).indexOf(e.detail._id)
        $details.provided[index].recover = false
        $details.provided[index].isRemovable = false
    }

</script>



<div class="w3-row">

    <div class="w3-col m6">
        <div class="w3-margin-right">

            {#if $details.provided.filter(providedFilter).length}
                <Button on:click={recoverAll} class="w3-right" variant="outlined" color="secondary">
                    Tout récupérer
                </Button>
            {/if}

            <h4>En vente</h4>

            {#each $details.provided.filter(providedFilter).slice(0, LIMIT_LIST_A) as article (article._id)}
                <div in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">

                    <Article article={article} timeKey={'validTime'} clickable on:select="{recover}"/>

                </div>
            {:else}
                <span class="w3-opacity">Pas d'articles fournis en magasin !</span>
            {/each}

            <!-- Bouton pour prolongé la liste -->
            {#if $details.provided.filter(providedFilter).length > LIMIT_LIST_A}
                <div on:click="{() => LIMIT_LIST_A += 25}" class="underline-div w3-center">
                    <span class="underline-span w3-opacity">
                        Afficher plus d'éléments ({$details.provided.filter(providedFilter).length - LIMIT_LIST_A})
                    </span>
                </div>
            {/if}

        </div>
    </div>

    <div class="w3-col m6">
        <div class="w3-margin-left">

            {#await validPromise}
                <Button variant="raised" class="w3-right" style="color: white;">
                    <i class="fas fa-circle-notch w3-spin"></i>
                    Validation de la récupération...
                </Button>
            {:then}
                {#if $details.provided.filter(art => art.recover && art.isRemovable).length}
                    <Button variant="raised" class="w3-right" on:click="{() => validPromise = valid()}" style="color: white;">
                        Récupérer {$details.provided.filter(art => art.recover && art.isRemovable).length <= 1 ? `l'article` : `les ${$details.provided.filter(art => art.recover && art.isRemovable).length} articles`}
                    </Button>
                {/if}
            {/await}

            <h4>Récupérés</h4>

            {#each $details.provided.filter(art => art.recover).sort(sortByUpdatedAt).slice(0, LIMIT_LIST_B) as article (article._id)}
                <div in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">

                    <Article article={article} timeKey={'recoverTime'} on:remove="{remove}"/>

                </div>
            {:else}
                <span class="w3-opacity">Pas d'articles récupérés !</span>
            {/each}

            <!-- Bouton pour prolongé la liste -->
            {#if $details.provided.filter(art => art.recover).length > LIMIT_LIST_B}
                <div on:click="{() => LIMIT_LIST_B += 25}" class="underline-div w3-center">
                    <span class="underline-span w3-opacity">
                        Afficher plus d'éléments ({$details.provided.filter(art => art.recover).length - LIMIT_LIST_B})
                    </span>
                </div>
            {/if}

            
        </div>
    </div>
</div>
