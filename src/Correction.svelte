<script>
    import { onMount } from 'svelte'
    import Textfield from '@smui/textfield'
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table'
    import Checkbox from '@smui/checkbox'
    import Button from '@smui/button'
    import { formatPrice } from './utils'

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
        providersPromise = getProviders()
    })

    async function getProviders() {
        let res = await fetch(`/trocs/${troc}/providername`)
        let json = await res.json()
        if (Array.isArray(json)) {
            providers = json
        }
        return
    }

    function searchInputArticles() {
        skipArticles = 0
        if (waitArticles) clearTimeout(waitArticles)
        waitArticles = setTimeout(() => articlesPromise = getArticles(), 200)
    }

    function getMoreArticles() {
        skipArticles += limitArticles
        moreArticlesPromise = getArticles()
    }

    async function getArticles() {
    
        if (!selectedProvider.length) {
            articles = []
            return
        }

        let providersQuery = selectedProvider.map((p, i) => `provider[]=${p._id}`).join('&')

        let res = await fetch(`/articles/search?troc=${troc}&${providersQuery}&search=${searchArticles}&limit=${limitArticles}&skip=${skipArticles}`)
        let json = await res.json()
        if(res.ok) {

            if (json.length < limitArticles) noMoreArticles = true
            else noMoreArticles = false

            if (!!skipArticles) {
                articles = [...articles, ...json]
            }else{
                articles = json
            }

            /*
            searchProviders = ''
            let articlesProviderIds = articles.map(art => art.provider._id)
            let distinctIndex = articlesProviderIds.map((poviderId, i, self) => self.indexOf(poviderId)).filter((selfIndex, index) => selfIndex == index)
            providers = distinctIndex.map(index => articles[index].provider)
            console.log(providers)
            selectedProvider = [...providers]
            */

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

    function selectProvider() {
        setTimeout(() => articlesPromise = getArticles(), 50)
    }
    
    function filterProviderInput() {
        articles = []
        selectedProvider = []
        let reg = RegExp(searchProviders, 'gi')
        providers = providers.sort((a, b) => reg.test(b.name) - reg.test(a.name))
    }


</script>

<div class="w3-row" style="padding: 50px 0px 0px 50px;">

    <div class="w3-col m2">

        <Textfield
        on:input={filterProviderInput}
        bind:value={searchProviders}
        variant="outlined"
        label="Recherche fournisseurs"/>
        
        <br><br>
        {#await providersPromise}
            <span>Chargement</span>
        {:then}
            <DataTable>
                <Head>
                    <Row>
                        <Cell checkbox>
                            <Checkbox on:click={selectProvider}/>
                        </Cell>
                        <Cell>Fournisseur</Cell>
                    </Row>
                </Head>
                <Body>
                <!--
                
                    {#each providers as provider}
                        <Row>
                            <Cell checkbox >
                                <Checkbox 
                                on:click={selectProvider}
                                bind:group={selectedProvider}
                                value={provider}
                                valueKey={provider._id}/>
                            </Cell>
                            <Cell>{provider.name}</Cell>
                        </Row>
                    {/each}
                    
                -->
                </Body>
            </DataTable>
        {/await}

    </div>

    <div class="w3-col m10">

        <Textfield
        bind:value={searchArticles}
        on:input={searchInputArticles}
        variant="outlined"
        label="Recherche articles"/>
        
        <br><br>

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
                {#each articles as article}
                    <Row>
                        <Cell>{article.provider.name}</Cell>
                        <Cell>{article.ref}</Cell>
                        <Cell>{status[getStatus(article)]}</Cell>
                        {#if getStatus(article) == 2}<!--En vente -->
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

                {#if articles.length && !noMoreArticles}
                    <Button
                    on:click={getMoreArticles}
                    color="secondary">
                            Plus de résultats
                    </Button>
                {/if}

            </Body>
               
        </DataTable>

    </div>

</div>
