<script>
    import { me } from './stores'
    import EditForm from './EditForm.svelte'
	import Button from '@smui/Button'
    import Dialog, {Title, Content, Actions, InitialFocus} from '@smui/dialog';
    import List, {Item, Text, PrimaryText, SecondaryText, Meta} from '@smui/list';

    let dialogCreateTroc

    let trocSelectionIndex



</script>

{#if $me._id}
        <List class="demo-list" twoLine avatarList singleSelection bind:selectedIndex={trocSelectionIndex}>
        {#each $me.trocs as troc, i}
            <Item selected={trocSelectionIndex === i}>
                <Text>
                    <PrimaryText>{troc.name}</PrimaryText>
                    <SecondaryText>{troc.address}</SecondaryText>
                </Text>
                <Meta>
                    {#if troc.admin}
                        <a href="{`/admin#${troc._id}`}">
                            <i class="fa fa-cog button-icon w3-large w3-padding"></i>
                        </a>
                    {:else if troc.cashier}
                        <a href="{`/cashier#${troc._id}`}">
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
on:click="{() => dialogCreateTroc.open()}"
>
    Organiser mon troc
</Button>

<Dialog bind:this={dialogCreateTroc}>
	<EditForm createMode on:create="{() => dialogCreateTroc.close()}"/>
</Dialog>

<Button variant="outlined" color="secondary" class="w3-padding" href="/">
    Trouver un troc
</Button>