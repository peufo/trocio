<script>
    import { onMount } from 'svelte'
    import Textfield from '@smui/textfield'
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table'
    import List, { Item, Text, PrimaryText, SecondaryText, Graphic } from '@smui/list'
    import Checkbox from '@smui/checkbox'
    import Button from '@smui/button'
    import Menu from '@smui/menu'
    import MenuSurface from '@smui/menu-surface'
    import Icon from '@smui/textfield/icon'
    
    import { formatPrice } from './utils'
    import RowsPromise from './RowsPromise.svelte'
    
    export let troc = ''

    let articles = []
    let articlesMatchCount = 0
    let articlesPromise
    let moreArticlesPromise
    let noMoreArticles = false
    let limitArticles = 10
    let skipArticles = 0
    let waitArticles //Timeout

    //Name and ref commande
    let searchNameMenu
    let searchName = ''

    //Statut commande
    let statutFilterMenu
    let status = [
        {filter: '', label: 'Tous'},
        {filter: 'proposed', label: 'Proposé'},
        {filter: 'valided', label: 'En vente'},
        {filter: 'sold', label: 'Vendu'},
        {filter: 'recover', label: 'Récupéré'},
    ]
    let statutFilter = status[0].filter
    let statutLabel = status[0].label

    //Price commande
    let priceSortMenu
    let priceSortMethodes = [
        {sort: '',  label: 'Non trié', icon: '<i class="fas fa-bars"></i>'},
        {sort: 1, label: 'Croissant', icon: '<i class="fas fa-sort-amount-down-alt"></i>'},
        {sort: -1, label: 'Décroissant', icon: '<i class="fas fa-sort-amount-down"></i>'}
    ]
    let priceSortIndex = 0

    //Provider commande
    let searchProviderMenu
    let searchProvider = ''

    onMount(() => {
        articlesPromise = getArticles()
    })

    function openSearchNameMenu() {
        searchNameMenu.setOpen(true)
        setTimeout(() => document.querySelector('#searchNameInput input').focus(), 200)
    }

    function openSearchProviderMenu() {
        searchProviderMenu.setOpen(true)
        setTimeout(() => document.querySelector('#searchProviderInput input').focus(), 200)
    }

    function filtreStatut(newStatutIndex) {
        statutFilter = status[newStatutIndex].filter
        statutLabel = status[newStatutIndex].label
        articles = []
        skipArticles = 0
        articlesPromise = getArticles()
    }

	function getStatus(art) {
		if (!art.valided) return 1
		if (art.sold) return 3
		if (art.recover) return 4
		return 2
    }

    function sortPrice(newSortIndex) {
        priceSortIndex = newSortIndex
        articles = []
        skipArticles = 0
        articlesPromise = getArticles()
    }

    function searchInput() {
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

        let req = `/articles/search?troc=${troc}&limit=${limitArticles}&skip=${skipArticles}`
        if (searchName.length)      req += `&search=${searchName}`
        if (statutFilter.length)    req += `&statut=${statutFilter}`
        if (priceSortIndex)         req += `&pricesort=${priceSortMethodes[priceSortIndex].sort}`
        if (searchProvider.length)  req += `&searchprovider=${searchProvider}`

        let res = await fetch(req)
        let json = await res.json()

        if(res.ok) {
            
            articlesMatchCount = json.articlesMatchCount

            noMoreArticles = json.articles.length < limitArticles

            if (!!skipArticles) {
                articles = [...articles, ...json.articles]
            }else{
                articles = json.articles
            }

        }else{
            articles = []
        }
        return
    }

</script>

        
<br>
<div style="text-align: center;">
    <DataTable class="clickable" style="min-width: 690px; overflow-x: visible;">
        <Head>
            <Row>
                <Cell class="headCell" on:click={openSearchNameMenu}>
                    <Text>
                        <PrimaryText>#</PrimaryText>
                        <SecondaryText></SecondaryText>
                    </Text>
                </Cell>

                <Cell class="headCell" on:click={openSearchNameMenu}>
                    <Text>
                        <PrimaryText>Désignation</PrimaryText>
                        <SecondaryText>
                            {#if searchName.length}
                                <i class="fas fa-search"></i>
                                {searchName}
                            {/if}
                        </SecondaryText>
                    </Text>
                    <MenuSurface bind:this={searchNameMenu}>
                        <div style="margin: 1em;">
                            <Textfield
                            on:input={searchInput}
                            id="searchNameInput"
                            bind:value={searchName}
                            label="Ref / désignation"
                            withLeadingIcon>
                                <Icon class="material-icons">search</Icon>
                            </Textfield>
                        </div>
                    </MenuSurface>
                </Cell>

                <Cell class="headCell" on:click={statutFilterMenu.setOpen(true)}>

                    <Text>
                        <PrimaryText>Status</PrimaryText>
                        <SecondaryText>
                            <i class="fas fa-filter"></i>
                            {statutLabel}
                        </SecondaryText>
                    </Text>
                    
                    <Menu bind:this={statutFilterMenu}>
                        <List>
                            {#each status as statut, i}
                                <Item on:click={() => filtreStatut(i)}><Text>{statut.label}</Text></Item>
                            {/each}
                        </List>
                    </Menu>

                </Cell>

                <Cell class="headCell" on:click={priceSortMenu.setOpen(true)}>
                    <Text>
                        <PrimaryText>Prix</PrimaryText>
                        <SecondaryText>
                            {@html priceSortMethodes[priceSortIndex].icon}
                            {priceSortMethodes[priceSortIndex].label}
                        </SecondaryText>
                    </Text>
                    <Menu bind:this={priceSortMenu}>
                        <List>
                            {#each priceSortMethodes as priceSortMethode, i}
                                <Item on:click={() => sortPrice(i)}>
                                    <Graphic>{@html priceSortMethode.icon}</Graphic>
                                    <Text>{priceSortMethode.label}</Text>
                                </Item>
                            {/each}
                        </List>
                    </Menu>
                </Cell>

                <Cell class="headCell" on:click={openSearchProviderMenu}>
                    <Text>
                        <PrimaryText>Fournisseur</PrimaryText>
                        <SecondaryText>
                        {#if searchProvider.length}
                            <i class="fas fa-search"></i>
                            {searchProvider}
                        {/if}
                        </SecondaryText>
                    </Text>
                    <MenuSurface bind:this={searchProviderMenu}>
                        <div style="margin: 1em;">
                            <Textfield
                            on:input={searchInput}
                            id="searchProviderInput"
                            bind:value={searchProvider}
                            label="Fournisseur"
                            withLeadingIcon>
                                <Icon class="material-icons">search</Icon>
                            </Textfield>
                        </div>
                    </MenuSurface>
                </Cell>

            </Row>
        </Head>
        <Body>
            {#await articlesPromise}
                <RowsPromise cellsWidth={[47, 300, 85, 65, 150]}></RowsPromise>
            {:then}
                {#each articles as article}
                    <Row style="text-align: left;">
                        <Cell numeric>{article.ref}</Cell>
                        <Cell>{article.name}</Cell>
                        <Cell>{status[getStatus(article)].label}</Cell>
                        <Cell numeric>
                            {article.price.toFixed(2)}
                        </Cell>
                        <Cell>{article.provider.name}</Cell>
                    </Row>
                {/each}

                {#await moreArticlesPromise}
                    <RowsPromise cellsWidth={[47, 300, 85, 65, 150]}></RowsPromise>
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