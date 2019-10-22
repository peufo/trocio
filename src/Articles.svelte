<script>
    import { onMount } from 'svelte'
    import { fade } from 'svelte/transition'
    import Textfield from '@smui/textfield'

    export let troc = ''

    let search = ''
    let wait //Timeout
    let articles = []
    let articlesPromise
    let moreResultsPromise

    let noMoreResults = false
    const LIMIT = 30
    let skip = 0

    onMount(() => {
        articlesPromise = getArticles()
    })

    function searchInput() {
        skip = 0
        if (wait) clearTimeout(wait)
        wait = setTimeout(() => articlesPromise = getArticles(), 200)
    }

    function getMoreResults() {
        skip += LIMIT
        moreResultsPromise = getArticles()
    }

    async function getArticles() {
        let res = await fetch(`articles/search?troc=${troc}&search=${search}&limit=${LIMIT}&skip=${skip}`)
        let json = await res.json()
        if(res.ok) {

            if (search.length && json.length < LIMIT) noMoreResults = true
            else noMoreResults = false

            if (!!skip) {
                articles = [...articles, ...json]
            }else{
                articles = json
            }

            return
        }
    }

    $: console.log(articles)

</script>

<div class="w3-margin">

    <div style="width: 400px; margin: auto;">
        <Textfield
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
        <div class="w3-margin-left">

            {#each articles as article}
                <div class="list-element w3-padding w3-margin-right w3-display-container valided">
                    {article.name}
                    <br>
                    <b class="w3-tiny w3-right" style="line-height: 1;">{!isNaN(article.price) && article.price.toFixed(2)}</b>
                </div>
            {/each}

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

        </div>

    {/await}

</div>

<style>

    .list-element {
        display: inline-block;
        width: calc(33.3% - 16px);
        
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