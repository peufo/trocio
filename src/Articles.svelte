<script>
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

<div class="w3-margin">

    <input bind:value={search} on:input={searchInput} type="search" class="w3-input" placeholder="Que cherchez-vous ?">
    <br><br>

    {#await articlesPromise}
        <div class="w3-center"><img src="favicon.ico" alt="Logo trocio" class="w3-spin"></div>
    {:then}
        <div class="w3-row w3-margin-left">

            {#each articles.slice(0, LIMIT_LIST_A) as article}
                <div class="w3-col m4">
                    <div class="list-element w3-padding w3-margin-right w3-display-container valided">
                        {article.name}
                        <br>
                        <b class="w3-tiny w3-right" style="line-height: 1;">{article.price.toFixed(2)}</b>
                    </div>
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

            {/if}

        </div>

    {/await}


</div>

<style>
    input {
        width: 300px;
        margin: auto;
        text-align: center;
        font-size: 1.5em;
    }
</style>