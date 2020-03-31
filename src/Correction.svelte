<script>
    import { onMount } from 'svelte'
    import Textfield from '@smui/textfield'
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table'
    import Checkbox from '@smui/checkbox'
    import Button from '@smui/button'
    import Menu from '@smui/menu'
    
    import { formatPrice } from './utils'
    import RowsPromise from './RowsPromise.svelte'


    export let troc = ''

    let searchProviders = ''
    let providersPromise
    let providers = [{_id: 1, name : 'toto', mail: 'rfesdfsa'}, {_id: 2, name : 'toto', mail: 'rfesdfsa'}]
    let selectedProvider = []

    $: console.log(troc)

    let searchArticles = ''
    let articles = []
    let articlesPromise
    let moreArticlesPromise
    let noMoreArticles = false

    let limitArticles = 50
    let skipArticles = 0

    let waitArticles //Timeout

    onMount(() => {
        articlesPromise = getArticles()
    })

    /*
    async function getProviders() {
        let res = await fetch(`/trocs/${troc}/providername`)
        let json = await res.json()
        if (Array.isArray(json)) {
            providers = json
        }
        return
    }
    */

    function searchInputArticles() {
        //wait 200mm for executing getArticles()
        skipArticles = 0
        if (waitArticles) clearTimeout(waitArticles)
        waitArticles = setTimeout(() => articlesPromise = getArticles(), 200)
    }

    function getMoreArticles() {
        skipArticles += limitArticles
        moreArticlesPromise = getArticles()
    }

    async function getArticles() {

        let providersQuery = selectedProvider.map((p, i) => `provider[]=${p._id}`).join('&')

        let res = await fetch(`/articles/search?troc=${troc}&${providersQuery}&search=${searchArticles}&limit=${limitArticles}&skip=${skipArticles}`)
        let json = await res.json()

        console.log(json)
        if(res.ok) {

            if (json.length < limitArticles) noMoreArticles = true
            else noMoreArticles = false

            if (!!skipArticles) {
                articles = [...articles, ...json]
            }else{
                articles = json
            }

        }else{
            articles = []
        }
        return
    }

    //From Resume.svelte
	let status = ['Proposé', 'En vente', 'Vendu', 'Récupéré']
	function getStatus(art) {
		if (!art.valided) return 0
		if (art.sold) return 2
		if (art.recover) return 3
		return 1
    }


</script>

        
<br>
<div style="text-align: center;">
    <DataTable>
        <Head>
            <Row>
                <Cell>Fournisseur</Cell>
                <Cell>#Ref</Cell>
                <Cell>Status</Cell>
                <Cell>Prix</Cell>
                <Cell>Désignation</Cell>
            </Row>
        </Head>
        <Body>
            {#await articlesPromise}
                <RowsPromise cellsWidth={[160, 62, 90, 92, 452]}></RowsPromise>
            {:then}
                {#each articles as article}
                    <Row style="text-align: left;">
                        <Cell>{article.provider.name}</Cell>
                        <Cell numeric>{article.ref}</Cell>
                        <Cell>{status[getStatus(article)]}</Cell>
                        {#if getStatus(article) == 1}<!--En vente -->
                            <Cell numeric>
                                
                                <input style="border: none; width: 60px; text-align: right;" type="text" bind:value={article.price} on:input={formatPrice}>
                                
                            </Cell>
                        {:else}
                            <Cell numeric>
                                {article.price.toFixed(2)}
                            </Cell>
                        {/if}
                        <Cell>{article.name}</Cell>
                    </Row>
                {/each}

                {#await moreArticlesPromise}
                    <RowsPromise rowsNumber={8} cellsWidth={[160, 62, 90, 92, 452]}></RowsPromise>
                {/await}

            {/await}
        </Body>       
    </DataTable>

</div>

<br>

{#if articles.length && !noMoreArticles}
    <div class="w3-center">
        <Button
        on:click={getMoreArticles}
        variant="outlined"
        color="secondary">
                Plus de résultats
        </Button>
    </div>
    <br><br><br><br><br><br>
{/if}

<style>
    
</style>