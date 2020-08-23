<script>
    import { ready } from '@sveltech/routify'
    import Button from '@smui/button'

    import { getHeader, syntaxHighlight } from 'utils.js'
    import notify from 'notify.js'
    import SearchUser from 'SearchUser.svelte'

    let isRootUser = false
    fetch('/superadmin')
    .then(res => res.json())
    .then(json => {isRootUser = json.success})
    .then($ready)

    let userSelected = {}
    let userSelectedPromise
    let addCreditPromise

    async function selectUser(event){
        let res = await fetch(`/superadmin/users?_id=${event.detail._id}`)
        let json = await res.json()
        userSelected = json[0]
        return
    }

    async function addCredit() {
        let res = await fetch(`/superadmin/addcredit`, getHeader({user: userSelected._id}))
        let json = await res.json()
        if (json.error) return notify.error(json.message)
        userSelected.creditTroc++
        return notify.success(json.message)
    }

</script>

{#if !isRootUser}
    <h1 style="color: red;">Access denied</h1>
{:else}
    <div class="main">
        <div class="simple-card">
            <h3>Ajouter un crédit de création de troc</h3>
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
    }

</style>
