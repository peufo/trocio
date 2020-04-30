<script>
    import { scale } from 'svelte/transition'
    
    import Card, { Content as CardContent, Actions } from '@smui/card'
    import List, {Item, Text, PrimaryText, SecondaryText, Meta} from '@smui/list'
	import Button, { Label } from '@smui/button'

    import { me } from './stores'
    import EditForm from './EditForm.svelte'
    import Trocs from './Trocs.svelte'
    import Resume from './Resume.svelte'

    let createTrocOpen = false
    let searchTrocOpen = false
    let trocSelectedIndex = -1
    let detailTrocOpen = false

    function openCreateTroc() {
        createTrocOpen = true
        searchTrocOpen = false
        trocSelectedIndex = -1
        detailTrocOpen = false
    }

    function openSearchTroc() {
        createTrocOpen = false
        searchTrocOpen = true
        trocSelectedIndex = -1
        detailTrocOpen = false
    }

    function openResumeTroc(index) {
        createTrocOpen = false
        searchTrocOpen = false
        trocSelectedIndex = index
        detailTrocOpen = true
    }

    $: console.log(trocSelectedIndex)

</script>


<div class="container">
    {#if $me._id}
    <div class="item">
        <!-- LISTE DES TROCS-->
        <Card style="width: 350px;">

            <div style="padding: 1rem;">
                <Actions class="w3-right" style="transform: translate(0px, -4px);">
                    <Button on:click={openCreateTroc}>
                        <Label>Organiser</Label>
                    </Button>

                    <Button on:click={openSearchTroc}>
                        <Label>Trouver</Label>
                    </Button>
                </Actions>
                <h3 class="mdc-typography--headline6" style="margin: 0;">Mes trocs</h3>
            </div>

            <CardContent component={List} twoLine avatarList singleSelection>
                
                {#each $me.trocs as troc, i}
                    <Item on:click={() => openResumeTroc(i)} selected={trocSelectedIndex === i} title={troc.description}>
                        <Text>
                            <PrimaryText>{troc.name}</PrimaryText>
                            <SecondaryText>{troc.address}</SecondaryText>
                        </Text>
                        <Meta>
                            {#if troc.isAdmin}
                                <a href="{`/admin/${troc._id}`}" title="Accéder à la page d'administration">
                                    <i class="fa fa-cog button-icon w3-large w3-padding"></i>
                                </a>
                            {:else if troc.isCashier}
                                <a href="{`/cashier/${troc._id}`}" title="Accéder à la caisse">
                                    <i class="fa fa-cash-register w3-large w3-padding"></i>
                                </a>
                            {/if}
                        </Meta>
                    </Item>
                {:else}
                    Vous n'avez pas encore troqué
                {/each}
                    
            </CardContent>
        </Card>
    </div>

    {/if}

    {#if createTrocOpen}
        <div class="item">
            <Card>
                <div style="padding: 1rem;">
                    <i on:click={() => createTrocOpen = false } class="fa fa-times w3-right w3-padding button-icon" title="Abandonner la création de troc"></i>
                    <h3 class="mdc-typography--headline6" style="margin: 0;">Organiser un troc</h3>
                </div>
                <CardContent>
                    <EditForm createMode on:create="{() => {}}"/>
                </CardContent>
            </Card>
        </div>
    {:else if searchTrocOpen}
        <div class="item">
            <Card>
                <div style="padding: 1rem;">
                    <i on:click={() => searchTrocOpen = false } class="fa fa-times w3-right w3-padding button-icon" title="Arreter la recherche d'un troc"></i>
                    <h3 class="mdc-typography--headline6" style="margin: 0;">Trouver un troc</h3>
                </div>
                <CardContent>
                    <Trocs/>
                </CardContent>
            </Card>
        </div>

    {:else if detailTrocOpen}
        <div class="item">
            <Card>
                <div style="padding: 1rem;">
                    <i on:click={() => detailTrocOpen = false } class="fa fa-times w3-right w3-padding button-icon" title="Fermer le résumé du troc"></i>
                    <h3 class="mdc-typography--headline6" style="margin: 0;">
                    Détail de {$me.trocs[trocSelectedIndex].name}
                    </h3>
                </div>
                <CardContent>
                    <Resume userId={$me._id} trocId={$me.trocs[trocSelectedIndex]._id}/>
                </CardContent>
            </Card>
        </div>

    {/if}


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
