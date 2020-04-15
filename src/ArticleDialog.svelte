<script>

    import { me } from './stores'


    import Dialog, { Title, Content, Actions } from '@smui/dialog'
    import Button, { Label } from '@smui/button'
    import List, { Item, Graphic, Meta, Text, PrimaryText, SecondaryText} from '@smui/list'

    export let dialog
    export let article = {}

    function acceptValidation() {
        article.valided = new Date()
        article.refused = undefined
        article.validator = {_id: $me._id, name: $me.name}
    }

    function refuseValidation() {
        article.valided = undefined
        article.refused = new Date()
        article.validator = {_id: $me._id, name: $me.name}
    }

    function sold() {
        article.sold = new Date()
        article.recover = undefined
        article.seller = {_id: $me._id, name: $me.name}
    }

    function recover() {
        article.sold = undefined
        article.recover = new Date()
        article.seller = {_id: $me._id, name: $me.name}
    }

    function removeValidation() {
        article.refused = undefined
        article.valided = undefined
        article.validator = undefined
    }

    function removeSold() {
        article.sold = undefined
        article.recover = undefined
        article.seller = undefined
    }

</script>


<Dialog bind:this={dialog}>
    <Title>
        <i>#{article.ref}</i>&nbsp;&nbsp;
        <span>{article.name}</span>
    </Title>
    <Content style="min-width: 500px;">

        <List twoLine nonInteractive avatarList style="width: 320px;" class="w3-right">
            <Item>
                <Graphic>Proposé</Graphic>
                <Text>
                    <PrimaryText>Par {article.provider && article.provider.name}</PrimaryText>
                    <SecondaryText>{new Date(article.createdAt).toLocaleString()}</SecondaryText>
                </Text>
            </Item>

            {#if article.valided || article.refused}

                <Item>
                    <Graphic class={article.valided ? 'w3-text-blue' : 'w3-text-red'}>
                        {article.valided ? 'Validé' : 'Refusé'}
                    </Graphic>
                    <Text>
                        <PrimaryText>Par {article.validator.name}</PrimaryText>
                        <SecondaryText>{new Date(article.valided || article.refused).toLocaleString()}</SecondaryText>
                    </Text>

                    {#if !article.sold && !article.recover}
                        <Meta on:click={removeValidation} title={article.valided ? 'Annuler la validation' : 'Annuler le refus'}>
                            <i class="far fa-trash-alt w3-large button-icon"></i>
                        </Meta>
                    {/if}
                </Item>
            
            {/if}

            {#if article.valided}

                <Item>
                    {#if article.sold}
                        <Graphic class="w3-text-green">Vendu</Graphic>
                        <Text>
                            <PrimaryText>Par {article.seller.name}</PrimaryText>
                            <SecondaryText>{new Date(article.sold).toLocaleString()}</SecondaryText>
                        </Text>
                        <Meta on:click={removeSold} title="Annuler la vente">
                            <i class="far fa-trash-alt w3-large button-icon"></i>
                        </Meta>
                        
                    {:else if article.recover}
                        <Graphic class="w3-text-orange">Rendu</Graphic>
                        <Text>
                            <PrimaryText>Par {article.seller.name}</PrimaryText>
                            <SecondaryText>{new Date(article.recover).toLocaleString()}</SecondaryText>
                        </Text>
                        <Meta on:click={removeSold} title="Annuler la récupération">
                            <i class="far fa-trash-alt w3-large button-icon"></i>
                        </Meta>
                        
                    {:else}
                        <Graphic>Caisse</Graphic>
                        <Button on:click={recover} color="secondary" title="Rendre l'article à son propriétaire">
                            <Label><i class="fas fa-undo"></i> Rendre</Label>
                        </Button>
                        <Button on:click={sold} title="Vendre l'artice à un client">
                            <Label><i class="fas fa-shopping-cart"></i> Vendre</Label>
                        </Button>

                    {/if}
                </Item>


            {:else}
                <Item>
                    <Graphic>Validation</Graphic>
                    <Button color="secondary">
                        <Label><i class="fa fa-times"></i> Refuser</Label>
                    </Button>
                    <Button on:click={acceptValidation}>
                        <Label><i class="fa fa-check"></i> Valider</Label>
                    </Button>
                </Item>
            {/if}

        </List>
        <div >
            <br>
            <span>Prix: {article.price && article.price.toFixed(2)}</span><br>
            <span>Frais: {article.fee && article.fee.toFixed(2)}</span><br>
            <span>Marge: {article.margin && article.margin.toFixed(2)}</span>
        </div>
    </Content>
    
    <Actions>
        <Button color="secondary">
            <Label><i class="fa fa-times"></i> Annuler</Label>
        </Button>
        <Button>
            <Label><i class="fa fa-check"></i> Sauvegarder</Label>
        </Button>
    </Actions>

</Dialog>
