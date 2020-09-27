<script>
    import { onMount } from 'svelte'
    import Button from '@smui/button'
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table'

    import { getHeader, syntaxHighlight } from 'utils.js'
    import notify from 'notify.js'
    import SearchUser from 'SearchUser.svelte'

    let isRootUser = false

    onMount(() => {
        fetch('/superadmin')
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

    async function selectUser(event){
        try {
            let res = await fetch(`/superadmin/users?_id=${event.detail._id}`)
            let json = await res.json()
            userSelected = json[0]
            return
        } catch(error) {
			console.trace(error)
		}
    }

    async function addCredit() {
        try {
            let res = await fetch(`/superadmin/addcredit`, getHeader({user: userSelected._id}))
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
            let res = await fetch('/superadmin/options')
            let json = await res.json()
            options = json
        } catch(error) {
			console.trace(error)
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
