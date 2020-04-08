<script>
    import { onMount } from 'svelte'
    import Textfield from '@smui/textfield'
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table'
    import List, { Item, Text, PrimaryText, SecondaryText, Graphic } from '@smui/list'
    import FormField from '@smui/form-field'
    import Checkbox from '@smui/checkbox'
    import Button from '@smui/button'
    import Menu from '@smui/menu'
    import MenuSurface from '@smui/menu-surface'
    import Icon from '@smui/textfield/icon'
    
    import { formatPrice, addStatutField } from './utils'
    import RowsPromise from './RowsPromise.svelte'
    
    export let troc = ''

    let articles = []
    let articlesInfo = []
    let articlesPromise
    let moreArticlesPromise
    let noMoreArticles = false
    let limitArticles = 10
    let skipArticles = 0
    let waitArticles //Timeout

    //Options
    const statutFiltersOptions = [
        {queryValue: '',         label: 'Tous',     icon: ''},
        {queryValue: 'proposed', label: 'Proposé',  icon: '<i class="fas fa-dot-circle w3-text-grey"></i>'},
        {queryValue: 'valided',  label: 'En vente', icon: '<i class="fas fa-dot-circle w3-text-blue"></i>'},
        {queryValue: 'sold',     label: 'Vendu',    icon: '<i class="fas fa-dot-circle w3-text-green"></i>'},
        {queryValue: 'recover',  label: 'Récupéré', icon: '<i class="fas fa-dot-circle w3-text-orange"></i>'},
    ]
    const sortOptions = [
        {queryValue: '',   label: 'Non trié',    icon: '<i class="fas fa-bars"></i>'},
        {queryValue: '1',  label: 'Croissant',   icon: '<i class="fas fa-sort-amount-down-alt"></i>'},
        {queryValue: '-1', label: 'Décroissant', icon: '<i class="fas fa-sort-amount-down"></i>'}
    ]

    //TODO: no big difference between sort and filter type ... this is options type
    //But, sort menu need a range filter
    let fieldsMenu
    let fields = [
        {label: '#',            checked: true,  typeMenu: 'search', queryName: 'searchref',       dataName: 'ref',       dataType: 'string', disabled: true},
        {label: 'Désignation',  checked: true,  typeMenu: 'search', queryName: 'searchname',      dataName: 'name',      dataType: 'string', disabled: true},
        {label: 'Statut',       checked: true,  typeMenu: 'filter', queryName: 'statut',          dataName: 'statut',    dataType: 'string', options: statutFiltersOptions},
        {label: 'Création',     checked: false, typeMenu: 'sort',   queryName: 'sortcreateAt',    dataName: 'createdAt', dataType: 'date'},
        {label: 'Fournisseur',  checked: true,  typeMenu: 'search', queryName: 'searchprovider',  dataName: 'provider',  dataType: 'string'},
        {label: 'Validation',   checked: false, typeMenu: 'sort',   queryName: 'sortvalided',     dataName: 'valided',   dataType: 'date'},
        {label: 'Validateur',   checked: false, typeMenu: 'search', queryName: 'searchvalidator', dataName: 'validator', dataType: 'string'},
        {label: 'Vente',        checked: false, typeMenu: 'sort',   queryName: 'sortsold',        dataName: 'sold',      dataType: 'date'},
        {label: 'Récupération', checked: false, typeMenu: 'sort',   queryName: 'sortrecover',     dataName: 'recover',   dataType: 'date'},
        {label: 'Caissier',     checked: false, typeMenu: 'search', queryName: 'searchcashier',   dataName: 'seller',    dataType: 'string'},
        {label: 'Prix',         checked: true,  typeMenu: 'sort',   queryName: 'sortprice',       dataName: 'price',     dataType: 'number'},
        {label: 'Frais',        checked: false, typeMenu: 'sort',   queryName: 'sortfee',         dataName: 'fee',       dataType: 'number'},
        {label: 'Marge',        checked: false, typeMenu: 'sort',   queryName: 'sortmargin',      dataName: 'margin',    dataType: 'number'},
    ]
    fields = fields.map(field => {
        field.queryValue = ''
        field.queryLabel = ''
        field.queryIcon = ''
        if (field.typeMenu == 'sort') field.options = sortOptions
        return field
    })

    onMount(() => {
        articlesPromise = getArticles()
    })

    function openMenu(field) {
        field.menu.setOpen(true)
        if (field.typeMenu == 'search') {
            setTimeout(() => document.querySelector(`#search${field.dataName}Input input`).focus(), 200)
        }
    }

    function searchInput() {
        //wait 200mm for executing getArticles()
        skipArticles = 0
        if (waitArticles) clearTimeout(waitArticles)
        waitArticles = setTimeout(() => articlesPromise = getArticles(), 300)
    }
    
    function selectOption(field, selectedOption) {
        if (field.typeMenu == 'sort'){ //remove all sort
            fields.filter(f => f.typeMenu == 'sort').forEach(f => f.queryValue = '')
        }
        field.queryValue = field.options[selectedOption].queryValue
        field.queryLabel = field.options[selectedOption].label
        field.queryIcon = field.options[selectedOption].icon
        fields = fields //Compute
        articles = []
        skipArticles = 0
        articlesPromise = getArticles()
    }

    function getMoreArticles() {
        skipArticles += limitArticles
        moreArticlesPromise = getArticles()
    }
    
    async function getArticles() {

        let req = `/articles/searchv2?troc=${troc}&limit=${limitArticles}&skip=${skipArticles}`
        fields.forEach(f => {
            if (f.queryValue.length) req += `&${f.typeMenu}_${f.dataName}=${f.queryValue}`
        })

        let res = await fetch(req)
        let json = await res.json()
        let newArticles = []

        if(res.ok) {
            
            articlesInfo = json.info[0] || {count: 0}
            newArticles = addStatutField(json.articles)

            noMoreArticles = newArticles.length < limitArticles

            if (!!skipArticles) {
                articles = [...articles, ...newArticles]
            }else{
                articles = newArticles
            }

        }else{
            articles = []
        }
        return
    }

</script>

<br>
<div style="text-align: center;">

    <div class="w3-right w3-margin-right w3-margin-bottom">
        <Button on:click={() => fieldsMenu.setOpen(true)} variant="outlined" color="secondary">
            Champs
        </Button>
        <MenuSurface bind:this={fieldsMenu}>
            <div style="margin: 1em;">
                {#each fields as {label, checked, disabled}}
                    <FormField style="display: flex;">
                        <Checkbox bind:checked={checked} bind:disabled={disabled}/>
                        <span slot="label">{label}</span>
                    </FormField>
                {/each}
            </div>
        </MenuSurface>
    </div>

    <DataTable class="clickable" style="min-width: 690px; overflow-x: visible;">
        <Head>
            <Row>
                {#each fields.filter(f => f.checked) as field}
                    <Cell class="headCell" on:click={() => openMenu(field)}>
                        <Text>
                            <PrimaryText>{field.label}</PrimaryText>
                            <SecondaryText>
                                {#if field.typeMenu == 'search' && field.queryValue.length}
                                    <i class="fas fa-search"></i>
                                    {field.queryValue}
                                {:else if (field.typeMenu == 'filter'  || field.typeMenu == 'sort') && field.queryValue.length}
                                    {@html field.queryIcon}
                                    {field.queryLabel}
                                {/if}
                            </SecondaryText>
                        </Text>
                        {#if field.typeMenu == 'search'}
                            <MenuSurface bind:this={field.menu} style="min-width: 140px;">
                                <div style="margin: 1em;">
                                    <Textfield id={`search${field.dataName}Input`} on:input={searchInput} bind:value={field.queryValue} label={field.label} withLeadingIcon>
                                        <Icon class="material-icons">search</Icon>
                                    </Textfield>
                                </div>
                            </MenuSurface>
                        {:else if field.typeMenu == 'sort' || field.typeMenu == 'filter'}
                            <Menu bind:this={field.menu}>
                                <List>
                                    {#each field.options as option, i}
                                        <Item on:click={() => selectOption(field, i)}>
                                            <Graphic>{@html option.icon}</Graphic>
                                            <Text>{option.label}</Text>
                                        </Item>
                                    {/each}
                                </List>
                            </Menu>
                        {/if}                  
                    </Cell>

                {/each}

            </Row>
        </Head>
        <Body>
            {#await articlesPromise}
                <RowsPromise cellsWidth={[47, 300, 85, 65, 150]}></RowsPromise>
            {:then}
                {#each articles as article}
                    <Row style="text-align: left;">
                        {#each fields.filter(f => f.checked) as field}
                            <Cell numeric={field.dataType == 'number'}>
                                {#if !article[field.dataName]}
                                    -
                                {:else if field.dataType == 'date'}
                                    {new Date(article[field.dataName]).toLocaleString()}
                                {:else if field.dataType == 'number'}
                                    {article[field.dataName].toFixed(2)}
                                {:else}
                                    {article[field.dataName]}
                                {/if}
                            </Cell>
                        {/each}
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

<div class="w3-center">
    {#if articles.length && !noMoreArticles}
        <Button
        on:click={getMoreArticles}
        variant="outlined"
        color="secondary">
                Plus de résultats {articles.length} / {articlesInfo.count}
        </Button>
    {:else}
        {articles.length} / {articlesInfo.count}
    {/if}
    </div>
    <br><br><br><br><br><br>

<style>

</style>