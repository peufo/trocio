<script>
    import { flip } from 'svelte/animate'
    import { getHeader, crossfadeConfig } from './utils.js'
    import { crossfade } from 'svelte/transition'
    import Article from './Article.svelte'

    export let user = {}
    export let provided = [] //Articles provided
    export let recovered = [] //Articles recovered
    export let articlesPromise
    export let validPromise

    const [send, receive] = crossfade(crossfadeConfig)
    
    const providedFilter = art => !art.sold && !art.recover && !art.isRemovable

    function recover(e) {

        let index = provided.map(art => art._id).indexOf(e.detail._id)
        provided[index].recover = new Date()
        provided[index].isRemovable = true
        recovered = [provided[index], ...recovered]

    }

    function recoverAll() {
        let all = provided.filter(providedFilter)
        all.forEach((art, i) => {
            art.recover = new Date()
            art.isRemovable = true
        })
        recovered = [...all, ...recovered]   
        provided = provided
    }

    async function valid() {
        
        let articlesRecover = recovered.filter(art => art.isRemovable)

        let res = await fetch('/articles', getHeader(articlesRecover, 'PATCH'))
        let json = await res.json()
        if (res.ok && json.success) {
            recovered = recovered.map(art => {
                if (art.isRemovable) delete art.isRemovable
                return art
            })
            return
        }

    }

    function remove(e) {
        
        let index = recovered.map(art => art._id).indexOf(e.detail._id)
        recovered.splice(index, 1)
        recovered = recovered

        index = provided.map(art => art._id).indexOf(e.detail._id)
        provided[index].recover = undefined
        provided[index].isRemovable = false

    }

</script>

<div class="w3-row">
    <div class="w3-col m6">
        <div class="w3-right w3-margin-right w3-round button hide" class:visible={provided.filter(providedFilter).length} on:click={recoverAll}>
            Tout récupérer
        </div>

        <h4>Fournis</h4>
        <div class="w3-margin-right">
        {#await articlesPromise}
            <div class="w3-center">
                <img src="favicon.ico" alt="Logo trocio" class="w3-spin">
            </div>
        {:then}
            {#each provided.filter(providedFilter) as article (article._id)}
                <div in:receive="{{key: article._id}}" out:send="{{key: article._id}}" animate:flip="{{duration: 200}}">

                    <Article article={article} timeKey={'validTime'} clickable on:select="{recover}"/>

                </div>
            {:else}
                <span class="w3-opacity">Pas d'articles fournis en magasin !</span>
            {/each}
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
            <div class="w3-right w3-round validButton hide" class:visible={recovered.filter(art => art.isRemovable).length} on:click="{() => validPromise = valid()}">
                Valider {recovered.length <= 1 ? `l'article` : `les ${recovered.filter(art => art.isRemovable).length} articles`}
            </div>
        {/await}

        <h4 class="w3-margin-left">Récupérés</h4>
        <div class="w3-margin-left">
        {#await articlesPromise}
            <div class="w3-center">
                <img src="favicon.ico" alt="Logo trocio" class="w3-spin">
            </div>
        {:then}
            {#each recovered as article (article._id)}
                <div in:receive="{{key: article._id}}" out:send="{{key: article._id}}" animate:flip="{{duration: 200}}">

                    <Article article={article} timeKey={'recoverTime'} on:remove="{remove}"/>

                </div>
            {:else}
                <span class="w3-opacity">Pas d'articles récupéré !</span>
            {/each}
        {/await}
        </div>
    </div>
</div>
