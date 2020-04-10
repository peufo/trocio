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
    import SearchUser from './SearchUser.svelte'
    
    export let troc = ''

    let articles = []
    let articlesMatchCount = 0
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
        {label: '#',            checked: true,  typeMenu: 'search', dataName: 'ref',       dataType: 'string', cellWidth: 50,  disabled: true},
        {label: 'Désignation',  checked: true,  typeMenu: 'search', dataName: 'name',      dataType: 'string', cellWidth: 300, disabled: true},
        {label: 'Statut',       checked: true,  typeMenu: 'filter', dataName: 'statut',    dataType: 'string', cellWidth: 90,  options: statutFiltersOptions},
        {label: 'Création',     checked: false, typeMenu: 'sort',   dataName: 'createdAt', dataType: 'date',   cellWidth: 170},
        {label: 'Fournisseur',  checked: true,  typeMenu: 'user',   dataName: 'provider',  dataType: 'string', cellWidth: 70},
        {label: 'Validation',   checked: false, typeMenu: 'sort',   dataName: 'valided',   dataType: 'date',   cellWidth: 170},
        {label: 'Validateur',   checked: false, typeMenu: 'user',   dataName: 'validator', dataType: 'string', cellWidth: 50},
        {label: 'Vente',        checked: false, typeMenu: 'sort',   dataName: 'sold',      dataType: 'date',   cellWidth: 170},
        {label: 'Récupération', checked: false, typeMenu: 'sort',   dataName: 'recover',   dataType: 'date',   cellWidth: 170},
        {label: 'Caissier',     checked: false, typeMenu: 'user',   dataName: 'seller',    dataType: 'string', cellWidth: 50},
        {label: 'Prix',         checked: true,  typeMenu: 'sort',   dataName: 'price',     dataType: 'number', cellWidth: 150},
        {label: 'Frais',        checked: false, typeMenu: 'sort',   dataName: 'fee',       dataType: 'number', cellWidth: 50},
        {label: 'Marge',        checked: false, typeMenu: 'sort',   dataName: 'margin',    dataType: 'number', cellWidth: 50},
    ]
    fields = fields.map(field => {
        field.queryValue = ''
        field.queryLabel = ''
        field.queryIcon = ''
        if (field.typeMenu == 'sort') field.options = sortOptions
        if (field.typeMenu == 'user') field.queryIcon = '<i class="far fa-user"></i>'
        return field
    })

    onMount(() => {
        articlesPromise = getArticles()
    })

    function openMenu(field) {
        field.menu.setOpen(true)
        if (field.typeMenu == 'search') {
            setTimeout(() => document.querySelector(`#search${field.dataName}Input input`).focus(), 200)
        }else if (field.typeMenu == 'user') {
            console.log('prout')
            if (field.queryValue.length){//Reset selection
                field.queryValue = ''
                fields = fields
                reloadArticles()
            }
            //Focus
            setTimeout(() => document.getElementById(`searchUser${field.dataName}`).focus(), 200)
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
        fields = fields //Compute for display
        reloadArticles()
    }

    function selectUser(field, event) {
        field.queryValue = event.detail._id
        field.queryLabel = event.detail.name
        field.menu.setOpen(false)
        fields = fields //Compute for display
        reloadArticles()
    }

    function reloadArticles() {
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
            
            articlesMatchCount = json.articlesMatchCount
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
                                {:else if (field.typeMenu == 'filter'  || field.typeMenu == 'sort' || field.typeMenu == 'user') && field.queryValue.length}
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
                        {:else if field.typeMenu == 'user'}
                            <MenuSurface bind:this={field.menu} on:click={e => e.stopPropagation()} style="overflow: visible; min-width: 200px;">
                                <div style="margin: 1em;">
                                    <SearchUser
                                    id={field.dataName}
                                    on:select={e => selectUser(field, e)}
                                    placeholder={`Chercher un ${field.label.toLowerCase()}`}/>
                                </div>
                            </MenuSurface>
                        {/if}                  
                    </Cell>

                {/each}

            </Row>
        </Head>
        <Body>
            {#await articlesPromise}
                <RowsPromise cellsWidth={fields.filter(f => f.checked).map(f => f.cellWidth)}></RowsPromise>
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
                    <RowsPromise cellsWidth={fields.filter(f => f.checked).map(f => f.cellWidth)}></RowsPromise>
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
                Plus de résultats {articles.length} / {articlesMatchCount}
        </Button>
    {:else}
        {articles.length} / {articlesMatchCount}
    {/if}
    </div>
    <br><br><br><br><br><br>

<style>

</style>