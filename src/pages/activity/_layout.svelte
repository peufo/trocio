<script>
    import { page } from '@roxi/routify'
    import { onMount, onDestroy } from 'svelte'
    import { fade, fly } from 'svelte/transition'

    import { Button, List, ListItem } from 'svelte-materialify'

	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
    import 'dayjs/locale/fr'
    dayjs.locale('fr')
    dayjs.extend(relativeTime)

    import qs from 'qs'
    import notify from '$/notify.js'
    import { addIsClosed } from '$/utils.js'
    import { user, userPromise, subscribedTrocs} from '$/stores.js'
    import RowsPromise from '$/RowsPromise.svelte'
    import Login from '$/Login.svelte'
    
    let subscribedSkip = 0
    let subscribedLimit = 5
    let subscribedTrocsPromise
    let moreSubscribedTrocsPromise

    let offsetWidth = 0
    let smallDisplay = false
    $: smallDisplay = offsetWidth < 1300

    let rightMenuOpen = false

    let trocSelected = {}

    let segments = {
        create: {title: 'Organiser un troc', closeTitle: 'Fermer la création de troc'},
        search: {title: 'Trouver un troc',   closeTitle: 'Fermer la recherche de troc'},
        detail: {closeTitle: 'Fermer les détail du troc'}
    }

    let segment = undefined
    $: segment = segments[$page.title]

    //Juste pour ne pas attendre sur les détails
    async function updateTrocByQuery() {
        let { troc } = qs.parse(location.search.substr(1))
        if (!$user) await $userPromise
        if (troc && $user) {
            let index = $subscribedTrocs.map(t => t._id).indexOf(troc)
            trocSelected = $subscribedTrocs[index]
        }else if (!troc) {
            trocSelected = {}
        }
    }

    onMount(() => {
        //if (!!$user) initTrocsSubscribedList()
    })

    onDestroy(() => {
        removeEventListener('locationchange', updateTrocByQuery)
    })

    function initTrocsSubscribedList() {
        subscribedTrocsPromise = getSubscribedTrocs().then(() => {
            updateTrocByQuery()
            addEventListener('locationchange', updateTrocByQuery)
        })
    }

    async function getSubscribedTrocs() {
        try {
            let res = await fetch(`/__API__/subscribes/me?skip=${subscribedSkip}&limit=${subscribedLimit}`)
            let json = await res.json()
            if (json.error) throw json.message
            if (subscribedSkip == 0) $subscribedTrocs = addIsClosed(json)
            else $subscribedTrocs = [...$subscribedTrocs, ...addIsClosed(json)]
            return
        } catch(error) {
            notify.error(error)
        }
    }

    function clickMoreSubscribedTroc() {
        subscribedSkip += subscribedLimit
        moreSubscribedTrocsPromise = getSubscribedTrocs()
    }

</script>

{#if $user === null}
    <div class="login">
        <Login/>
    </div>
{:else if $user !== undefined}
    
    <span style="display: none;">{initTrocsSubscribedList()}</span>
    
    <div class="window" class:main-open={segment} bind:offsetWidth>

        <div class="main-container" class:open={segment} class:smallDisplay>
            {#if segment }
                <div class="item no-margin-right simple-card" class:no-margin={smallDisplay} in:fade|local={{delay: 200}}>
                    <!--
                        <a class="w3-right w3-padding" href="/activity">
                            <i class="fa fa-times button-icon" title={segment.closeTitle}></i>
                        </a>
                    -->
                    <slot/>

                </div>
            {/if}
        </div>
            

    
        {#if !smallDisplay || !segment}
        <div class="right-container" class:smallDisplay transition:fly|local={{ x: 500 }}>

            <!-- LISTE DES TROCS-->
            <div class="item" class:no-margin={smallDisplay}>
                <div class="simple-card">

                    <div class="header">
                        <span class="title">Mes trocs</span>
                        <div>
                            <a href="/activity/create">
                                <Button text>Organiser</Button>
                            </a>
                            <a href="/activity/search">
                                <Button text>Trouver</Button>
                            </a>
                        </div>
                    </div>

                    {#await subscribedTrocsPromise}
                        <List twoLine>
                            <RowsPromise listMode twoLine meta/>
                        </List>
                    {:then}
                        <List>
                            {#each $subscribedTrocs as troc, i}
                                <a href={`/activity/detail?troc=${troc._id}`}>
                                    <ListItem active={trocSelected && trocSelected._id === troc._id} title={troc.address}>
                                        {troc.name}
                                        {#if troc.is_try}<span class="warning">Troc d'entrainement</span>{/if}
                                        {#if troc.isClosed}<span class="warning">Ce troc est terminé</span>{/if}
                                        <span slot="subtitle">
                                            {dayjs(troc.schedule && troc.schedule[0] && troc.schedule[0].open).fromNow()}
                                            <br>
                                            {troc.description.slice(0, 124)}
                                        </span>
                                        <span slot="append">
                                            {#if troc.isAdmin}
                                                <a href="{`/admin?troc=${troc._id}`}" title="Accéder à la page d'administration">
                                                    <i class="fa fa-cog button-icon w3-large w3-padding"></i>
                                                </a>
                                            {:else if troc.isCashier}
                                                <a href="{`/cashier?troc=${troc._id}`}" title="Accéder à la caisse">
                                                    <i class="fa fa-cash-register w3-large w3-padding"></i>
                                                </a>
                                            {/if}
                                        </span>
                                        
                                    </ListItem>
                                </a>
                            {:else}
                                Vous n'avez pas encore de troc
                            {/each}  
                                                     
                            {#await moreSubscribedTrocsPromise}
                                <RowsPromise listMode twoLine meta/>
                            {/await}
                            
                        </List>
                        
                        {#if $subscribedTrocs.length == subscribedSkip + subscribedLimit}
                            <div class="w3-center">
                                <Button on:click={clickMoreSubscribedTroc}>
                                    Afficher plus
                                </Button>
                            </div>
                        {/if}

                    {/await}
                </div>
                
            </div>

            <!-- ACTIVITE -->
            <div class="item no-margin-top" class:no-margin={smallDisplay}>
                <div class="simple-card">
                    <div class="header">
                        <span class="title">Actualités</span>
                    </div>
                    <p>Aucune actualité</p>
                </div>
            </div>
        </div>
        {/if}
    </div>
{/if}

<svelte:head><style>body {background: #fafafa;}</style></svelte:head>
<style>

    .window {
        /*
        display: grid;
        grid-template-columns: auto minmax(360px, 500px);
        */
        margin: auto;
        max-width: 1500px;
        display: flex;
        justify-content: center;
    }

    .right-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        /*transition: width 1s ease;
        width: 100%;*/
        max-width: 700px;
        min-width: 400px;
    }
    .window.main-open .right-container {
        max-width: 500px;
    }
    .window.main-open .main-container {
        width: 100%;
    }
    .main-container:not(.smallDisplay) {
        width: 0%;
        transition: all .3s ease;
    }

    .item {
        margin: 1em;
    }
    .simple-card {
        padding: 16px;
    }
    .no-margin-top {
        margin-top: 0px;
    }

    .no-margin-right {
        margin-right: 0px;
    }

    .no-margin {
        margin: 0px;
    }

    .login {
        background: #fff;
        border-radius: 5px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .header {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #eee;
        padding-bottom: .7em;
    }

    :global(.theme--dark) .header {
        border-bottom: 1px solid #444;
    }

</style>
