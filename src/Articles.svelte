<script>
    import { fade } from 'svelte/transition'
    import Textfield from '@smui/textfield'

    export let troc = ''

    let search = ''
    let wait //Timeout
    let articles = []
    let articlesPromise

    const LIMIT_LIST_INIT = 20 //Nombre d'élément d'une liste afficher initialement
    let LIMIT_LIST_A = LIMIT_LIST_INIT //Nombre d'élément afficher pour la premier liste

    function searchInput() {
        if (wait) clearTimeout(wait)
        wait = setTimeout(() => articlesPromise = getArticles(), 200)
    }

    async function getArticles() {
        if (search.length) {
            let res = await fetch(`articles/search?troc=${troc}&search=${search}`)
            let json = await res.json()
            if(res.ok) {
                LIMIT_LIST_A = LIMIT_LIST_INIT
                articles = json
                return
            }
        }else{
            articles = []
            return
        }
    }

</script>

<div class="w3-margin" style="display: inline-block;">

    <div style="width: 400px; margin: auto;">
        <Textfield
            bind:value="{search}"
            on:input="{searchInput}"
            class="shaped-outlined w3-margin-top"
            label="Recherche"
            variant="outlined"
            style="width: 400px;"
            />
    </div>

    <hr>

    {#await articlesPromise}
        <div class="w3-center"><img src="/favicon.ico" alt="Logo trocio" class="w3-spin"></div>
    {:then}
        <div class="w3-margin-left">

            {#each articles.slice(0, LIMIT_LIST_A) as article}
                    <div class="list-element w3-padding w3-margin-right w3-display-container valided">
                        {article.name}
                        <br>
                        <b class="w3-tiny w3-right" style="line-height: 1;">{!isNaN(article.price) && article.price.toFixed(2)}</b>
                    </div>
            {/each}

            {#if articles.length > LIMIT_LIST_A}
                <!-- Bonton pour alonger la liste -->
                <br>
                <div class="w3-col underline-div w3-center w3-opacity" on:click="{() => LIMIT_LIST_A += 20}">
                    <span class="underline-span">
                        Afficher plus d'article ?
                    </span>
                </div>

            {:else if search.length && !articles.length}
                <div class="w3-center w3-opacity" in:fade={{delay: 200}}>
                    <span>Aucun article trouvés</span>
                </div>
            {/if}

        </div>

    {/await}


</div>

<style>

    .list-element {
        display: inline-block;
        max-width: calc(50% - 16px);
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