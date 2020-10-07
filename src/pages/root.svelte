<script>
    import { onMount } from 'svelte'
    import { slide } from 'svelte/transition'
    import Button from '@smui/button'
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table'

    import { getHeader, syntaxHighlight } from 'utils.js'
    import notify from 'notify.js'
    import SearchUser from 'SearchUser.svelte'

    let isRootUser = false

    onMount(() => {
        fetch('__API__/superadmin')
        .then(res => res.json())
        .then(json => {
            if (json.success) {
               isRootUser = true
               getOptions()
            }
        })
        .catch(console.trace)
    })
    

    let userSelected = {}
    let userSelectedPromise
    let addCreditPromise

    let options = []

    let searchTroc = ''
    let trocs = []

    async function selectUser(event){
        try {
            let res = await fetch(`__API__/superadmin/users?_id=${event.detail._id}`)
            let json = await res.json()
            userSelected = json[0]
            return
        } catch(error) {
			console.trace(error)
		}
    }

    async function addCredit() {
        try {
            let res = await fetch(`__API__/superadmin/addcredit`, getHeader({user: userSelected._id}))
            let json = await res.json()
            if (json.error) return notify.error(json.message)
            userSelected.creditTroc++
            return notify.success(json.message)
        } catch(error) {
			console.trace(error)
		}
    }

    async function getOptions() {
        try {
            let res = await fetch('__API__/superadmin/options')
            let json = await res.json()
            options = json
        } catch(error) {
			console.trace(error)
		}
    }

    async function fetchTrocs() {
        try {
            let res = await fetch(`__API__/superadmin/trocs?${searchTroc}`)
            trocs = await res.json()
        } catch (error) {
            notify.error(error)
        }
    }

    async function subcribeAllUsers(troc) {
        try {
            let res = await fetch('__API__/superadmin/subscribe-all-users', getHeader({troc}))
            let json = await res.json()
            if (json.error) throw json.message
            notify.success(json.message)
        } catch (error) {
            notify.error(error)
        }
    }

    async function removeTroc(troc) {
        try {
            let res = await fetch('__API__/superadmin/remove-troc', getHeader({troc}))
            let json = await res.json()
            if (json.error) throw json.message
            notify.success(json.message)
        } catch (error) {
            notify.error(error)
        }
    }

</script>

{#if !isRootUser}
    <h1 style="color: red;">Access denied</h1>
{:else}
    <div class="main">

        <div class="simple-card">
            <h3>Options globals</h3>
            
            <DataTable>
                <Head>
                    <Row>
                        <Cell>Name</Cell>
                        <Cell>Value</Cell>
                    </Row>
                </Head>
                <Body>
                    {#each options as option}
                        <Row>
                            <Cell>{option.name}</Cell>
                            <Cell>{option.value}</Cell>
                        </Row>
                    {/each}
                </Body>
            </DataTable>

        </div>

        <div class="simple-card">
            <h3>Utilisateurs</h3>
            <div class="w3-row">
                <div class="w3-col s6">
                    <SearchUser modeSelect on:select={e => userSelectedPromise = selectUser(e)}/>
                    {#await userSelectedPromise}
                        Chargement des détails
                    {:then}
                        <pre>
                            {@html syntaxHighlight(JSON.stringify(userSelected, null, 2))}
                        </pre>
                    {/await}
                </div>
                <div class="w3-col s6">
                    {#await addCreditPromise}
                        en cours...
                    {:then}
                        <Button on:click={() => addCreditPromise = addCredit()} class="w3-right">
                            +1 crédit
                        </Button>
                    {/await}
                </div>
            </div>
        </div>

        <div class="simple-card">
            <h3>Trocs</h3>
            <div class="w3-row">
                
                <input bind:value={searchTroc} on:input={fetchTrocs} class="w3-input">
                <br>
                {#each trocs as troc}
                    <div class="simple-card">
                        <Button class="w3-right w3-red"  on:click={() => removeTroc(troc._id)}>
                            Supprimer
                        </Button>
                        <Button class="w3-right w3-margin-right" on:click={() => subcribeAllUsers(troc._id)}>
                            Abonner tous les utilisateurs
                        </Button>

                        <h3 on:click={() => troc.show = !troc.show}>
                            {troc.name}
                        </h3>
                        <span>{troc._id}</span>
                        {#if troc.show}
                            <pre transition:slide>
                                {@html syntaxHighlight(JSON.stringify(troc, null, 2))}
                            </pre>
                        {/if}

                    </div>
                    
                {/each}
            </div>
        </div>

    </div>

{/if}

<style>

    .main {
        max-width: 800px;
        margin: auto;
        margin-top: 20px;
    }

    .simple-card {
        padding: 16px;
        margin-bottom: 20px;
    }

</style>
