<script>
    import { me } from './stores'
    import EditForm from './EditForm.svelte'
	import Button from '@smui/button'
    import Dialog, {Title, Content} from '@smui/dialog';
    import List, {Item, Text, PrimaryText, SecondaryText, Meta} from '@smui/list';

    let dialogCreateTroc

    let trocSelectionIndex

</script>

{#if $me._id}
    <List twoLine avatarList singleSelection bind:selectedIndex={trocSelectionIndex}>
    {#each $me.trocs as troc, i}
        <Item selected={trocSelectionIndex === i}>
            <Text>
                <PrimaryText>{troc.name}</PrimaryText>
                <SecondaryText>{troc.address}</SecondaryText>
            </Text>
            <Meta>
                {#if troc.isAdmin}
                    <a href="{`/admin/${troc._id}`}">
                        <i class="fa fa-cog button-icon w3-large w3-padding"></i>
                    </a>
                {:else if troc.isCashier}
                    <a href="{`/cashier/${troc._id}`}">
                        <i class="fa fa-cash-register w3-large w3-padding"></i>
                    </a>
                {/if}
            </Meta>
        </Item>
    {:else}
        Vous n'avez encore rien vendu
    {/each}
    </List>
{/if}

<br><br>
<!-- Create troc EditForm -->
<Button
variant="outlined"
color="secondary"
class="w3-padding"
disabled={!$me.creditTroc}
on:click="{() => dialogCreateTroc.open()}"
>
    Organiser un troc
</Button>

<Dialog bind:this={dialogCreateTroc}>
    <Title>Nouveau troc</Title>
    <Content>
	    <EditForm createMode on:create="{() => dialogCreateTroc.close()}"/>
    </Content>
</Dialog>

<Button variant="outlined" color="secondary" class="w3-padding" href="/search">
    Trouver un troc
</Button>