<script>
    import { fade } from 'svelte/transition'
    import { TextField, Icon } from 'svelte-materialify'
    import notify from './notify.js'

    export let troc = ''

    let search = ''
    let wait //Timeout
    let articles = []
    let articlesPromise
    let moreResultsPromise

    let noMoreResults = false
    const LIMIT = 20

    $:  if (troc) initArticles()
        else articles = []

    $: (!!search || !search) && newSearch()

    function initArticles() {
        articles = []
        articlesPromise = getArticles()
    }
    function getMoreResults() {
        moreResultsPromise = getArticles()
    }
    function newSearch() {
        articles = []
        if (wait) clearTimeout(wait)
        wait = setTimeout(() => articlesPromise = getArticles(), 200)
    }

    async function getArticles() {
        try {
            let res = await fetch(`/__API__/articles?troc=${troc}&search_name=${search}&skip=${articles.length}&limit=${LIMIT}`)
            let json = await res.json()
            if(!res.ok || json.error) throw json.message
    
            if (json.data.length < LIMIT) noMoreResults = true
            else noMoreResults = false

            articles = [...articles, ...json.data]    
            
        } catch(error) {
            notify.error(error)
        }
    }

</script>

<div id="articles">
    <br>
    <div style="max-width: 350px; margin: auto;">
        <TextField
            bind:value={search}
            clearable
            placeholder="Recherche">
            <div slot="prepend">
                <Icon class="fas fa-search"/>
            </div>
        </TextField>
    </div>

    <br>

    {#await articlesPromise}
        <div in:fade class="w3-center"><img src="/favicon.ico" alt="Logo trocio" class="w3-spin"></div>
    {:then}
        <div in:fade class="flex" style="width: calc(100% + 5px);">
            {#each articles as article}
                <div class="list-element w3-padding w3-display-container valided" style="margin-right: 5px;">
                    {article.name}
                    <br>
                    <b class="w3-tiny w3-right" style="line-height: 1;">{!isNaN(article.price) && Number(article.price).toFixed(2)}</b>
                </div>
            {/each}
        </div>

        <br>

        {#if !articles.length && search.length}

            <div class="w3-center w3-opacity" in:fade={{delay: 200}}>
                <span>Aucun article trouvé</span>
            </div>

        {:else if articles.length}

            {#if !noMoreResults}
                {#await moreResultsPromise}
                    <div class="w3-center"><img src="/favicon.ico" alt="Logo trocio" class="w3-spin"></div>
                {:then}
                    <!-- Bonton pour plus de résultats-->
                    <div class="w3-col underline-div w3-center w3-opacity" on:click={getMoreResults}>
                        <span class="underline-span">Plus de résultats</span>
                    </div>
                {/await}
            {/if}

        {/if}

        <br>

    {/await}

</div>

<style>

    #articles {
        min-height: 550px;
    }

    .flex {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
    }

    .flex .list-element {
        /*max-width: calc(50% - 16px);*/
        flex-grow: 1;
    }

  * :global(.shaped-outlined .mdc-text-field__input) {
    padding-left: 32px;
    padding-right: 32px;
  }
  * :global(.shaped-outlined .mdc-notched-outline .mdc-notched-outline__leading) {
    border-radius: 28px 0 0 28px;
    width: 28px;
  }
  * :global(.shaped-outlined .mdc-notched-outline .mdc-notched-outline__trailing) {
    border-radius: 0 28px 28px 0;
  }
  * :global(.shaped-outlined .mdc-notched-outline .mdc-notched-outline__notch) {
    max-width: calc(100% - 28px * 2);
  }
  * :global(.shaped-outlined + .mdc-text-field-helper-line) {
    padding-left: 32px;
    padding-right: 28px;
  }

</style>