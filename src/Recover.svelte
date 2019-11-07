<script>
    import { flip } from 'svelte/animate'
    import Button from '@smui/button'
    import { getHeader, crossfadeConfig, sortByUpdatedAt } from './utils.js'
    import { crossfade } from 'svelte/transition'
    import Article from './Article.svelte'

    export let user = {}
    export let provided = [] //Articles provided
    export let providedPromise
    let validPromise // valid button

    const [send, receive] = crossfade(crossfadeConfig)
    
    const providedFilter = art => art.valided && !art.sold && !art.recover && !art.isRemovable
    const recoverFilter = art => art.recover && art.isRemovable && !art.isCreated

    const LIMIT_LIST_INIT = 5 //Nombre d'élément d'une liste afficher initialement
    let LIMIT_LIST_A = LIMIT_LIST_INIT //Nombre d'élément afficher pour la premier liste
    let LIMIT_LIST_B = LIMIT_LIST_INIT //Nombre d'élément afficher pour la seconde liste

    function recover(e) {

        let index = provided.map(art => art._id).indexOf(e.detail._id)
        provided[index].recover = new Date()
        provided[index].updatedAt = new Date()
        provided[index].isRemovable = true

    }

    function recoverAll() {
        let all = provided.filter(providedFilter)
        all.forEach((art, i) => {
            art.recover = new Date()
            art.isRemovable = true
        }) 
        provided = provided
    }

    async function valid() {
        
        let articlesRecover = provided.filter(art => art.recover && art.isRemovable && !art.isCreated)

        let res = await fetch('/articles', getHeader(articlesRecover, 'PATCH'))
        let json = await res.json()
        if (res.ok && json.success) {
            
            //Fait le lien entre les articles mis à jour et provided
            let articlesPatched = json.message
            let providedMapId = provided.map(a => a._id)
            let providedIndex = articlesPatched.map(art => providedMapId.indexOf(art._id))

            providedIndex.forEach((provIndex, patchedIndex) => {
                provided[provIndex] = articlesPatched[patchedIndex]
            })

            return
        }

    }

    function remove(e) {
        
        let index = provided.map(art => art._id).indexOf(e.detail._id)
        provided[index].recover = false
        provided[index].isRemovable = false

    }

</script>

<div class="w3-row">
    <div class="w3-col m6">

        {#if provided.filter(providedFilter).length}
            <Button on:click={recoverAll} class="w3-right w3-margin-right" variant="outlined">
                Tout récupérer
            </Button>
        {/if}

        <h4>En vente</h4>
        <div class="w3-margin-right">
        {#await providedPromise}
            <div class="w3-center">
                <img src="/favicon.ico" alt="Logo trocio" class="w3-spin">
            </div>
        {:then}
            {#each provided.filter(providedFilter).slice(0, LIMIT_LIST_A) as article (article._id)}
                <div in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">

                    <Article article={article} timeKey={'validTime'} clickable on:select="{recover}"/>

                </div>
            {:else}
                <span class="w3-opacity">Pas d'articles fournis en magasin !</span>
            {/each}

            <!-- Bouton pour prolongé la liste -->
            {#if provided.filter(providedFilter).length > LIMIT_LIST_A}
                <div on:click="{() => LIMIT_LIST_A += 25}" class="underline-div w3-center">
                    <span class="underline-span w3-opacity">
                        Afficher plus d'éléments ({provided.filter(providedFilter).length - LIMIT_LIST_A})
                    </span>
                </div>
            {/if}

        {/await}
        </div>
    </div>
    <div class="w3-col m6">
        {#await validPromise}
            <div class="w3-right w3-round validButton">
                <i class="fas fa-circle-notch w3-spin"></i>
                Validation de la récupération...
            </div>
        {:then}
            <div class="w3-right w3-round validButton hide"
                class:visible={provided.filter(art => art.recover && art.isRemovable).length}
            on:click="{() => validPromise = valid()}">
                Récupérer {provided.filter(art => art.recover && art.isRemovable).length <= 1 ? `l'article` : `les ${provided.filter(art => art.recover && art.isRemovable).length} articles`}
            </div>
        {/await}

        <h4 class="w3-margin-left">Récupérés</h4>
        <div class="w3-margin-left">
        {#await providedPromise}
            <div class="w3-center">
                <img src="/favicon.ico" alt="Logo trocio" class="w3-spin">
            </div>
        {:then}
            {#each provided.filter(art => art.recover).sort(sortByUpdatedAt).slice(0, LIMIT_LIST_B) as article (article._id)}
                <div in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">

                    <Article article={article} timeKey={'recoverTime'} on:remove="{remove}"/>

                </div>
            {:else}
                <span class="w3-opacity">Pas d'articles récupérés !</span>
            {/each}

            <!-- Bouton pour prolongé la liste -->
            {#if provided.filter(art => art.recover).length > LIMIT_LIST_B}
                <div on:click="{() => LIMIT_LIST_B += 25}" class="underline-div w3-center">
                    <span class="underline-span w3-opacity">
                        Afficher plus d'éléments ({provided.filter(art => art.recover).length - LIMIT_LIST_B})
                    </span>
                </div>
            {/if}

        {/await}
        </div>
    </div>
</div>
