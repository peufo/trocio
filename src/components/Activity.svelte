<script>
    import { onMount } from 'svelte'
    import { scale } from 'svelte/transition'
    import queryString from 'query-string'
    import Card, { Content as CardContent, Actions } from '@smui/card'
    import List, {Item, Text, PrimaryText, SecondaryText, Meta} from '@smui/list'
	import Button, { Label } from '@smui/button'

    import { me } from './stores'
    import EditForm from './EditForm.svelte'
    import Trocs from './Trocs.svelte'
    import Resume from './Resume.svelte'
    import TrocInfo from './TrocInfo.svelte'
    import AppLink from './AppLink.svelte'
    import { getSection } from '../routes/utils.js'

    let section = getSection()
    let setSection = e => {
        section = getSection(e)
        trocSelectedId = queryString.parse(location.search).troc
    }

    $: console.log(trocSelectedId)

    let sections = {
        create: {components: [{comp: EditForm,  getProps: ()=>{}}],    title: 'Organiser un troc', closeTitle: 'Fermer la création de troc'},
        search: {components: [{comp: Trocs,     getProps: ()=>{}}],    title: 'Trouver un troc',   closeTitle: 'Fermer la recherche de troc'},
        //detail: {components: [{comp: TrocInfo,  getProps: ()=>trocSelectedId}, {comp: Resume, getProps: getTrocInfo}], closeTitle: 'Fermer les détail du troc'}
        //detail: {components: [{comp: TrocInfo,  getProps: getTrocInfo}, {comp: Resume, getProps: ()=>trocSelectedId}], closeTitle: 'Fermer les détail du troc'}
        detail: {components: [{comp: Resume, getProps: ()=>{trocId: trocSelectedId}}], closeTitle: 'Fermer les détail du troc'}
    }


    function getTrocInfo() {
        let troc = $me.trocs.filter(t => t._id === trocSelectedId)[0]
        return { troc }
    }

    let trocSelectedId = ''

    onMount(() => {
        trocSelectedId = queryString.parse(location.search).troc
    })

</script>


<div class="container">
    {#if $me._id}
    <div class="item">
        <!-- LISTE DES TROCS-->
        <Card style="width: 350px;">

            <div style="padding: 1rem; height: 66px;">
                <Actions class="w3-right" style="transform: translate(0px, -4px);">

                    <Button href="/activity/create" on:click={setSection}>
                        <Label>Organiser</Label>
                    </Button>
                    
                    <Button href="/activity/search" on:click={setSection}>
                        <Label>Trouver</Label>
                    </Button>
                    
                </Actions>
                <h3 class="mdc-typography--headline6" style="margin: 0;">Mes trocs</h3>
            </div>

            <CardContent component={List} twoLine avatarList singleSelection>
                
                {#each $me.trocs as troc, i}
                    <a href={`/activity/detail?troc=${troc._id}`} on:click={setSection}>
                        <Item selected={trocSelectedId === troc._id} title={troc.description}>
                        
                            <Text>
                                <PrimaryText>{troc.name}</PrimaryText>
                                <SecondaryText>{troc.address}</SecondaryText>
                            </Text>
                            <Meta>
                                {#if troc.isAdmin}
                                    <AppLink href="{`/admin?troc=${troc._id}`}" title="Accéder à la page d'administration">
                                        <i class="fa fa-cog button-icon w3-large w3-padding"></i>
                                    </AppLink>
                                {:else if troc.isCashier}
                                    <AppLink href="{`/cashier?troc=${troc._id}`}" title="Accéder à la caisse">
                                        <i class="fa fa-cash-register w3-large w3-padding"></i>
                                    </AppLink>
                                {/if}
                            </Meta>
                        </Item>
                    </a>
                {:else}
                    Vous n'avez pas encore de troc
                {/each}
                    
            </CardContent>
        </Card>
    </div>

    {/if}

    {#if section.length}
        <div class="item">
            <Card>
                <div class="w3-padding">
                    <a class="w3-right w3-padding" href="/activity" on:click={setSection}>
                        <i class="fa fa-times button-icon" title={sections[section].closeTitle}></i>
                    </a>
                    {#if sections[section].title}
                        <h3 class="mdc-typography--headline6" style="margin: 0;">{sections[section].title}</h3>
                    {/if}
                </div>
                <CardContent id="sectionContent">
                    {#each sections[section].components as {comp, getProps}, i}
                        <svelte:component this={comp} {...getProps()}></svelte:component>
                        <hr class:w3-hide={i == sections[section].components.length - 1}>
                    {/each}
                </CardContent>
            </Card>
        </div>
        
    {/if}


<!--
    {#if section === 'create'}
        <div class="item">
            <Card>
                <a style="padding: 1rem;" href="/activity" on:click={setSection}>
                    <i class="fa fa-times w3-right w3-padding button-icon" title="Fermer la création de troc"></i>
                    <h3 class="mdc-typography--headline6" style="margin: 0;">Organiser un troc</h3>
                </a>
                <CardContent>
                    <EditForm createMode on:create="{() => {}}"/>
                </CardContent>
            </Card>
        </div>
    {:else if section === 'search'}
        <div class="item">
            <Card>
                <a style="padding: 1rem;" href="/activity" on:click={setSection}>
                    <i on:click={() => searchTrocOpen = false } class="fa fa-times w3-right w3-padding button-icon" title="Fermer la recherche d'un troc"></i>
                    <h3 class="mdc-typography--headline6" style="margin: 0;">Trouver un troc</h3>
                </a>
                <CardContent>
                    <Trocs/>
                </CardContent>
            </Card>
        </div>
    {:else if section === 'detail'}
        <div class="item">
            <Card>
                <div style="padding: 1rem;">
                    <i on:click={() => detailTrocOpen = false } class="fa fa-times w3-right w3-padding button-icon" title="Fermer le résumé du troc"></i>
                    <h3 class="mdc-typography--headline6" style="margin: 0;">
                        {$me.trocs[trocSelectedIndex].name}
                    </h3>
                </div>
                <CardContent>
                    <TrocInfo troc={$me.trocs[trocSelectedIndex]}/>
                    <hr>
                    <Resume userId={$me._id} trocId={$me.trocs[trocSelectedIndex]._id}/>
                </CardContent>
            </Card>
        </div>
    {/if}
-->


    <!-- ACTIVITE -->
    <div class="item">
        <Card>
            <div style="padding: 1rem;">
                <h3 class="mdc-typography--headline6" style="margin: 0;">Actualités</h3>
            </div>

            <CardContent component={List} twoLine avatarList>
                <Item>
                    <Text>
                        <PrimaryText>Vente de machin</PrimaryText>
                        <SecondaryText>Date et heure</SecondaryText>
                    </Text>
                    <Meta>
                        
                        <i class="fa fa-cog button-icon w3-large w3-padding"></i>
                        
                    </Meta>
                </Item>
            </CardContent>
        </Card>
    </div>


</div>



<style>

    .container {
        display: flex;
    }

    .item {
        box-sizing: border-box;
        margin: 1em;
    }

</style>
