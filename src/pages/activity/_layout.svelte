<script>
    import { goto } from '@sveltech/routify'
    import { layout, page } from '@sveltech/routify'

    import { onMount, onDestroy } from 'svelte'
    import { fade, fly } from 'svelte/transition'

    import Card, { Content as CardContent, Actions } from '@smui/card'
    import List, {Item, Text, PrimaryText, SecondaryText, Meta} from '@smui/list'
    import Button, { Label } from '@smui/button'
    
    import qs from 'qs'
    import { user, userPromise } from 'stores.js'

    let offsetWidth = 0
    let mobileDisplay = false
    let verySmallDisplay = false
    $: mobileDisplay = offsetWidth < 1100
    $: verySmallDisplay = offsetWidth < 500

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
            let index = $user.trocs.map(t => t._id).indexOf(troc)
            trocSelected = $user.trocs[index]
        }  
    }

    onMount(() => {
        updateTrocByQuery()
        addEventListener('locationchange', updateTrocByQuery)
    })

    onDestroy(() => {
        removeEventListener('locationchange', updateTrocByQuery)
    })


</script>

{#if $user === null}
    {$goto('/search')}
{:else if $user !== undefined}
    <div class="main-container" bind:offsetWidth>

        <div id="window" class:open={segment} class:mobileDisplay>
            {#if segment }
                <div class="item" class:simple-card={!mobileDisplay} class:no-margin-right={!mobileDisplay} in:fade|local={{delay: 200}}>
                    
                    <a class="w3-right w3-padding" href="/activity">
                        <i class="fa fa-times button-icon" title={segment.closeTitle}></i>
                    </a>

                    <slot scoped={{trocSelected}}/>

                </div>
            {/if}
        </div>
            

    
        {#if !mobileDisplay || !segment}
        <div class="right-container" class:mobileDisplay transition:fly|local={{ x: 500 }}>

            <!-- LISTE DES TROCS-->
            <div class="item">
                <div class:simple-card={!verySmallDisplay}>
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

                    <List twoLine avatarList singleSelection>
                        {#each $user.trocs as troc, i}
                            <a href={`/activity/detail?troc=${troc._id}`}>
                                <Item selected={trocSelected && trocSelected._id === troc._id} title={troc.address}>
                                
                                    <Text>
                                        <PrimaryText>{troc.name}</PrimaryText>
                                        <SecondaryText>{troc.description}</SecondaryText>
                                    </Text>
                                    <Meta>
                                        <!--
                                        <a href="{`/admin?troc=${troc._id}`}" title="Accéder à la page d'administration">
                                            <i class="fa fa-cog button-icon w3-large w3-padding"></i>
                                        </a>
                                        <a href="{`/cashier?troc=${troc._id}`}" title="Accéder à la caisse">
                                            <i class="fa fa-cash-register w3-large w3-padding"></i>
                                        </a>
                                        -->
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
                    </List>
                </div>
                
            </div>

            <!-- ACTIVITE -->
            <div class="item no-margin-top">
                <div class:simple-card={!verySmallDisplay}>
                    
                    <h3 class="mdc-typography--headline6" style="margin: 0;">Actualités</h3>

                    <List twoLine avatarList>
                        <Item>
                            <Text>
                                <PrimaryText>Vente de machin</PrimaryText>
                                <SecondaryText>Date et heure</SecondaryText>
                            </Text>
                            <Meta>
                                
                                <i class="fa fa-cog button-icon w3-large w3-padding"></i>
                                
                            </Meta>
                        </Item>
                    </List>
                </div>
            </div>
        </div>
        {/if}
    </div>
{/if}

<style>

    .simple-card {
		border: 1px solid #eee;
        border-radius: 4px;
        box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.1);
        padding: 16px;
    }

    .main-container {
        /*
        display: grid;
        grid-template-columns: auto minmax(360px, 500px);
        */
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
        flex-grow: 1;
    }

    .item {
        margin: 1em;
    }

    #window:not(.mobileDisplay) {
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

</style>
