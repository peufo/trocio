<script context="module">
    export async function preload(page, session) {
        let res = await this.fetch('/trocs/me', {credentials: 'include'})
        let trocs = await res.json()
        let trocSelected = trocs.find(troc => troc._id == page.query.troc)
        return { trocs, trocSelected }
    }
</script>

<script>
    import { onMount } from 'svelte'
    import { fade } from 'svelte/transition'
    import queryString from 'query-string'
    import Card, { Content as CardContent, Actions } from '@smui/card'
    import List, {Item, Text, PrimaryText, SecondaryText, Meta} from '@smui/list'
	import Button, { Label } from '@smui/button'

    //import EditForm from '../components/EditForm.svelte'
    //import Trocs from '../components/Trocs.svelte'
    //import Resume from '../components/Resume.svelte'
    import TrocInfo from '../../components/TrocInfo.svelte'

    export let segment = undefined
    export let trocs = []
    export let trocSelected = {}
    
    /*
    let segments = {
        create: {components: [{comp: EditForm,  getProps: ()=>{}}],    title: 'Organiser un troc', closeTitle: 'Fermer la création de troc'},
        search: {components: [{comp: Trocs,     getProps: ()=>{}}],    title: 'Trouver un troc',   closeTitle: 'Fermer la recherche de troc'},
        //detail: {components: [{comp: TrocInfo,  getProps: ()=>trocSelectedId}, {comp: Resume, getProps: getTrocInfo}], closeTitle: 'Fermer les détail du troc'}
        //detail: {components: [{comp: TrocInfo,  getProps: getTrocInfo}, {comp: Resume, getProps: ()=>trocSelectedId}], closeTitle: 'Fermer les détail du troc'}
        detail: {components: [{comp: Resume, getProps: ()=>{trocId: trocSelectedId}}], closeTitle: 'Fermer les détail du troc'}
    }
    */

    let segments = {
        create: {title: 'Organiser un troc', closeTitle: 'Fermer la création de troc'},
        search: {title: 'Trouver un troc',   closeTitle: 'Fermer la recherche de troc'},
        detail: {closeTitle: 'Fermer les détail du troc'}
    }

</script>


<div class="main-container">
    
    <div class="container">
        <!-- LISTE DES TROCS-->
        <Card style="width: 350px;">

            <div style="padding: 1rem; height: 66px;">
                <Actions class="w3-right" style="transform: translate(0px, -4px);">

                    <Button href="/activity/create" rel="prefetch">
                        <Label>Organiser</Label>
                    </Button>
                    
                    <Button href="/activity/search" rel="prefetch">
                        <Label>Trouver</Label>
                    </Button>
                    
                </Actions>
                <h3 class="mdc-typography--headline6" style="margin: 0;">Mes trocs</h3>
            </div>

            <CardContent component={List} twoLine avatarList singleSelection>
                
                {#each trocs as troc, i}
                    <a href={`/activity/detail?troc=${troc._id}`}>
                        <Item selected={trocSelected && trocSelected._id === troc._id} title={troc.address}>
                        
                            <Text>
                                <PrimaryText>{troc.name}</PrimaryText>
                                <SecondaryText>{troc.description}</SecondaryText>
                            </Text>
                            <Meta>
                                <a href="{`/admin?troc=${troc._id}`}" title="Accéder à la page d'administration">
                                    <i class="fa fa-cog button-icon w3-large w3-padding"></i>
                                </a>
                                <a href="{`/cashier?troc=${troc._id}`}" title="Accéder à la caisse">
                                    <i class="fa fa-cash-register w3-large w3-padding"></i>
                                </a>
                                <!--
                                {#if troc.isAdmin}
                                    <a href="{`/admin?troc=${troc._id}`}" title="Accéder à la page d'administration">
                                        <i class="fa fa-cog button-icon w3-large w3-padding"></i>
                                    </a>
                                {:else if troc.isCashier}
                                    <a href="{`/cashier?troc=${troc._id}`}" title="Accéder à la caisse">
                                        <i class="fa fa-cash-register w3-large w3-padding"></i>
                                    </a>
                                {/if}
                                -->
                            </Meta>
                        </Item>
                    </a>
                {:else}
                    Vous n'avez pas encore troqué
                {/each}
                    
            </CardContent>
        </Card>
    </div>

    {#if segment}
        <div class="container" transition:fade>
            <Card>
                <div class="w3-padding">
                    <a class="w3-right w3-padding" href="/activity">
                        <i class="fa fa-times button-icon" title={segments[segment].closeTitle}></i>
                    </a>
                    <h3 class="mdc-typography--headline6" style="margin: 0;">{segments[segment].title || trocSelected && trocSelected.name}</h3>
                </div>
                <CardContent id="sectionContent">
                    {#if segment === 'detail'}
                        <TrocInfo troc={trocSelected} />
                        <hr>
                    {/if}
                    <slot></slot>
                </CardContent>
            </Card>
        </div>
        
    {/if}

    <!-- ACTIVITE -->
    <div class="container">
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

    .main-container {
        display: flex;
    }

    .container {
        box-sizing: border-box;
        margin: 1em;
    }

</style>
