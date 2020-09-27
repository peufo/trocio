<script>
    import { fade } from 'svelte/transition'
    import TextField from '@smui/textfield'

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

    function initArticles() {
        articles = []
        articlesPromise = getArticles()
    }
    function getMoreResults() {
        moreResultsPromise = getArticles()
    }
    function searchInput() {
        articles = []
        if (wait) clearTimeout(wait)
        wait = setTimeout(() => articlesPromise = getArticles(), 200)
    }

    async function getArticles() {
        try {
            let res = await fetch(`/articles?troc=${troc}&search_name=${search}&skip=${articles.length}&limit=${LIMIT}`)
            let json = await res.json()
            if(res.ok) {
    
                if (json.data.length < LIMIT) noMoreResults = true
                else noMoreResults = false
    
                articles = [...articles, ...json.data]
    
                return
            }
        } catch(error) {
            console.trace(error)
        }
    }

</script>

<div id="articles">

    <div style="max-width: 400px; margin: auto;">
        <TextField
            bind:value="{search}"
            on:input="{searchInput}"
            class="shaped-outlined w3-margin-top"
            label="Recherche"
            variant="outlined"
            style="width: 100%;"
            />
    </div>

    <hr>

    {#await articlesPromise}
        <div class="w3-center"><img src="/favicon.ico" alt="Logo trocio" class="w3-spin"></div>
    {:then}
    
        <div class="flex" style="width: calc(100% + 5px);">
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
        width: 480px;
        min-height: 550px;
    }

    @media screen and (max-width: 600px) {
         #articles {width: 450px;}
    }
    @media screen and (max-width: 550px) {
         #articles {width: 400px;}
    }
    @media screen and (max-width: 500px) {
         #articles {width: 350px;}
    }
    @media screen and (max-width: 450px) {
         #articles {width: 300px;}
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