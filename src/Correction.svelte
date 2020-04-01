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
    let articlesPromise
    let moreArticlesPromise
    let noMoreArticles = false
    let limitArticles = 10
    let skipArticles = 0
    let waitArticles //Timeout

    //Name commande
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

    onMount(() => {
        articlesPromise = getArticles()
    })

    function openSearchNameMenu() {
        searchNameMenu.setOpen(true)
        setTimeout(() => document.querySelector('#searchNameInput input').focus(), 200)
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

    function searchNameInput() {
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
        req += `&search=${searchName}`
        req += `&statut=${statutFilter}`
        req += `&pricesort=${priceSortMethodes[priceSortIndex].sort}`

        let res = await fetch(req)
        let json = await res.json()

        if(res.ok) {

            noMoreArticles = json.length < limitArticles

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

</script>

        
<br>
<div style="text-align: center;">
    <DataTable class="clickable">
        <Head>
            <Row>

                <Cell class="headCell">
                    <span>#</span><br>

                </Cell>

                <Cell class="headCell" on:click={openSearchNameMenu}>
                    <Text>
                        <PrimaryText>Désignation</PrimaryText>
                        <SecondaryText>
                            <i class="fas fa-search"></i>
                            {searchName}
                        </SecondaryText>
                    </Text>
                    <MenuSurface bind:this={searchNameMenu}>
                        <div style="margin: 1em;">
                            <Textfield
                            on:input={searchNameInput}
                            id="searchNameInput"
                            bind:value={searchName}
                            label="Désignation"
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

                <Cell class="headCell">
                    <span>Fournisseur</span><br>
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