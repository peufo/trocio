<script>
    import { layout, page } from '@sveltech/routify'
    import { onMount, onDestroy } from 'svelte'
    import { fade, fly } from 'svelte/transition'

    import Card, { Content as CardContent, Actions } from '@smui/card'
    import List, {Item, Text, PrimaryText, SecondaryText, Meta} from '@smui/list'
    import Button, { Label } from '@smui/button'

	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
    import 'dayjs/locale/fr'
    dayjs.locale('fr')
    dayjs.extend(relativeTime)
    
    import qs from 'qs'
    import { user, userPromise, subscribedTrocs} from 'stores.js'
    import RowsPromise from 'RowsPromise.svelte'
    import Login from 'Login.svelte'
    
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
            let res = await fetch(`__API__/subscribes/me?skip=${subscribedSkip}&limit=${subscribedLimit}`)
            let json = await res.json()
            if (json.error) return notify.error(json.message)
            if (subscribedSkip == 0) $subscribedTrocs = json
            else $subscribedTrocs = [...$subscribedTrocs, ...json]
            return
        } catch(error) {
            console.trace(error)
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
    
    <div class="main-container" bind:offsetWidth>

        <div id="window" class:open={segment} class:smallDisplay>
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
                    <div style="height: 66px;">

                        <div class="w3-right" style="transform: translate(0px, 4px);">
                            <Button href="/activity/create">
                                <Label>Organiser</Label>
                            </Button>
                            <Button href="/activity/search">
                                <Label>Trouver</Label>
                            </Button>
                        </div>

                        <h3 class="mdc-typography--headline6" style="margin: 0;">Mes trocs</h3>
                    </div>

                    {#await subscribedTrocsPromise}
                        <List twoLine>
                            <RowsPromise listMode twoLine meta/>
                        </List>
                    {:then}
                        <List threeLine avatarList singleSelection>
                            {#each $subscribedTrocs as troc, i}
                                <a href={`/activity/detail?troc=${troc._id}`}>
                                    <Item selected={trocSelected && trocSelected._id === troc._id} title={troc.address}>
                                        <Text>
                                            <PrimaryText>
                                                {troc.name}
                                                {#if troc.is_try}
                                                    <span class="warning">Entrainement</span>
                                                {/if}
                                            </PrimaryText>
                                            <SecondaryText>{dayjs(troc.schedule && troc.schedule[0] && troc.schedule[0].open).fromNow()}</SecondaryText>
                                            <SecondaryText>{troc.description.slice(0, 124)}</SecondaryText>
                                        </Text>
                                        <Meta>
                                            {#if troc.isAdmin}
                                                <a href="{`/admin?troc=${troc._id}`}" title="Accéder à la page d'administration">
                                                    <i class="fa fa-cog button-icon w3-large w3-padding"></i>
                                                </a>
                                            {:else if troc.isCashier}
                                                <a href="{`/cashier?troc=${troc._id}`}" title="Accéder à la caisse">
                                                    <i class="fa fa-cash-register w3-large w3-padding"></i>
                                                </a>
                                            {/if}
                                        </Meta>
                                    </Item>
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
                                <Button color="secondary" on:click={clickMoreSubscribedTroc}>
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
                    <h3 class="mdc-typography--headline6" style="margin: 0;">Actualités</h3>
                    <p>Aucune actualité</p>
                </div>
            </div>
        </div>
        {/if}
    </div>
{/if}

<svelte:head><style>body {background: #fafafa;}</style></svelte:head>
<style>

    .main-container {
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
        flex-grow: 1;
    }

    .item {
        margin: 1em;
        background: #fff;
    }
    .simple-card {
        padding: 16px;
    }

    #window:not(.smallDisplay) {
        width: 0%;
        transition: all .3s ease;
    }

    #window.open{
        width: 100%;
        flex-grow: 3;
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

</style>
