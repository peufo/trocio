<script>
    import { onMount, createEventDispatcher } from 'svelte'
    const dispatch = createEventDispatcher()
    import Textfield from '@smui/textfield'
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table'
    import List, { Item, Text, PrimaryText, SecondaryText, Graphic } from '@smui/list'
    import FormField from '@smui/form-field'
    import Checkbox from '@smui/checkbox'
    import Button from '@smui/button'
    import Menu from '@smui/menu'
    import MenuSurface from '@smui/menu-surface'
    import Icon from '@smui/textfield/icon'
    
    import { addStatutField, getFields } from './utils'
    import RowsPromise from './RowsPromise.svelte'
    import SearchUser from './SearchUser.svelte'
    
    export let troc = ''
    export let title = ''
    export let baseURL = '/articles?'
    export let fields = getFields()
    export let showAllFields = false
    export let items = []
    export let preloaded = false
    export let selectedIndex = -1
    $: console.log({fields})

    let fieldsMenu
    let menus = {}

    let dataMatchCount = 0
    let dataPromise
    let moreDataPromise
    let noMoreData = false
    let limitData = 10
    let skipData = 0
    let waitData //Timeout

    onMount(() => {
        if (!preloaded) dataPromise = getData()
        else {
            dataMatchCount = items.length
            noMoreData = true
            dataPromise = Promise.resolve()
        }
    })

    function openMenu(field) {

        if (menus[field.dataName]) menus[field.dataName].setOpen(true)

        if (field.typeMenu == 'search' || field.typeMenu == 'or_search') {
            
            document.querySelector(`#search${field.dataName}Input`).focus()
        }else if (field.typeMenu == 'user') {
            if (field.queryValue.length){//Reset selection
                field.queryValue = ''
                fields = fields
                reloadData()
            }
            //Focus
            setTimeout(() => document.getElementById(`searchUser${field.dataName}`).focus(), 200)
        }
    }

    function searchInput() {
        //wait 200mm for executing getData()
        skipData = 0
        if (waitData) clearTimeout(waitData)
        waitData = setTimeout(() => dataPromise = getData(), 300)
    }

    function selectOption(field, selectedOption) {
        if (field.typeMenu == 'sort'){ //remove all sort
            fields.filter(f => f.typeMenu == 'sort').forEach(f => f.queryValue = '')
        }
        field.queryValue = field.options[selectedOption].queryValue
        field.queryLabel = field.options[selectedOption].label
        field.queryIcon = field.options[selectedOption].icon
        fields = fields //Compute for display
        reloadData()
    }

    function selectUser(field, event) {
        field.queryValue = event.detail._id
        field.queryLabel = event.detail.name
        field.menu.setOpen(false)
        fields = fields //Compute for display
        reloadData()
    }

    function reloadData() {
        skipData = 0
        dataPromise = getData()
    }

    function getMoreData() {
        skipData += limitData
        moreDataPromise = getData()
    }
    
    async function getData() {
        
        let req = `${baseURL}troc=${troc}&limit=${limitData}&skip=${skipData}`
        
        fields.filter(f => f.queryValue.length).forEach(f => {
            req += `&${f.typeMenu}_${f.dataName.split('.')[0]}=${f.queryValue}`
        })
        
        let res = await fetch(req)
        let json = await res.json()
        let newItems = []

        if(res.ok) {
            
            dataMatchCount = json.dataMatchCount
            newItems = addStatutField(json.data, '') // TODO: server-side

            if (!!skipData) {
                items = [...items, ...newItems]
            }else{
                items = newItems
            }

            noMoreData = items.length == dataMatchCount

        }else{
            item = []
        }
        return
    }

    function select(index) {
        selectedIndex = index
        dispatch('select', items[index])
    }

    let menu

</script>

<br>
<div style="display: flex; justify-content: center; flex-wrap: wrap-reverse;">
    <div style="display: flex; flex-direction: column;">
        <span class="w3-large">{title}</span>
        <DataTable class="clickable" style="min-width: 690px; overflow-x: visible; border: none;">
            <Head>
                <Row>
                    {#each fields.filter(f => showAllFields || f.checked) as field}
                        <Cell class="headCell" on:click={() => openMenu(field)}  style={`width: ${field.cellWidth}px;`}>
                            <Text>
                                <PrimaryText>{field.label}</PrimaryText>
                                <SecondaryText>
                                    
                                    {#if field.typeMenu == 'search'  || field.typeMenu == 'or_search'}

                                        {#if field.queryValue.length || field.isFocus}
                                            <i class="fas fa-search"></i>
                                        {/if}

                                        <input
                                        id={`search${field.dataName}Input`}
                                        class="searchInput"
                                        type="text"
                                        on:input={searchInput}
                                        on:focus={() => field.isFocus = true}
                                        on:blur={() => field.isFocus = false}
                                        bind:value={field.queryValue}>

                                    {:else if field.queryValue.length && (field.typeMenu == 'filter'  || field.typeMenu == 'sort' || field.typeMenu == 'user')}
                                        {@html field.queryIcon}
                                        {field.queryLabel}
                                    {/if}
                                    
                                </SecondaryText>
                            </Text>
                            <!--
                            {#if field.typeMenu == 'search' || field.typeMenu === 'or_search'}
                                <MenuSurface bind:this={menus[field.dataName]} style="min-width: 140px;">
                                    <div style="margin: 1em;">
                                        
                                        <Textfield 
                                        id={`search${field.dataName}Input`}
                                        on:input={searchInput}
                                        bind:value={field.queryValue}
                                        label={field.label}
                                        withLeadingIcon>
                                            <Icon class="material-icons">search</Icon>
                                        </Textfield>
                                        
                                    </div>
                                </MenuSurface>
                            -->
                            {#if field.typeMenu == 'sort' || field.typeMenu == 'filter'}
                                <Menu bind:this={menus[field.dataName]}>
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
                                <MenuSurface bind:this={menus[field.dataName]} on:click={e => e.stopPropagation()} style="overflow: visible; min-width: 200px;">
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
                {#await dataPromise}
                    <RowsPromise cellsWidth={fields.filter(f => showAllFields || f.checked).map(f => f.cellWidth)}></RowsPromise>
                {:then}
                    {#each items as item, index}
                        <Row style="text-align: left; border: none;" on:click={() => select(index)} class={selectedIndex == index ? 'row-selected' : ''}>
                            {#each fields.filter(f => showAllFields || f.checked) as field}
                                <Cell numeric={field.dataType == 'number'}>
                                    {#if field.dataName.indexOf('.') === -1}

                                        {#if !item[field.dataName]}
                                            -
                                        {:else if field.dataType == 'date'}
                                            {new Date(item[field.dataName]).toLocaleString()}
                                        {:else if field.dataType == 'number'}
                                            {item[field.dataName].toFixed(2)}
                                        {:else}
                                            {item[field.dataName]}
                                        {/if}

                                    {:else} <!-- Deux dimensions (Object)-->
            
                                        {#if !item[field.dataName.split('.')[0]] || !item[field.dataName.split('.')[0]][field.dataName.split('.')[1]]}
                                            -
                                        {:else if field.dataType == 'date'}
                                            {new Date(item[field.dataName.split('.')[0]][field.dataName.split('.')[1]]).toLocaleString()}
                                        {:else if field.dataType == 'number'}
                                            {item[field.dataName.split('.')[0]][field.dataName.split('.')[1]].toFixed(2)}
                                        {:else}
                                            {item[field.dataName.split('.')[0]][field.dataName.split('.')[1]]}
                                        {/if}

                                    {/if}
                                </Cell>
                            {/each}
                        </Row>
                    {/each}

                    {#await moreDataPromise}
                        <RowsPromise cellsWidth={fields.filter(f => showAllFields || f.checked).map(f => f.cellWidth)}></RowsPromise>
                    {/await}

                {/await}
            </Body> 
            
        </DataTable>

        <div style="align-self: flex-end;" class="w3-margin-top">

            {#if items.length && !noMoreData}
                <Button
                on:click={getMoreData}
                variant="outlined"
                color="secondary">
                        Plus de résultats 
                </Button>
            {/if}
            
            {items.length} / {dataMatchCount}

        </div>
        <br><br><br>

    </div>

    {#if !showAllFields}
        <div class="w3-margin-left w3-margin-bottom" style="align-self: flex-end; transform: translate(0px, 26.67px);">
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
    {/if}

</div>
<br>

<style>

    .searchInput {
        width: calc(100% - 20px);
        min-width: 40px;
        border: none;
    }

    .searchInput:focus {
        outline: none;
    }

</style>
