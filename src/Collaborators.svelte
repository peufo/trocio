<script>
    import List, {Item, Text, Meta, PrimaryText, SecondaryText} from '@smui/list'
    import { me, troc } from './stores'
    import SearchUser from './SearchUser.svelte'
    import UserLi from './UserLi.svelte'
    import { getHeader, updateTroc } from './utils'

	function addAdmin(e) {
		fetch(`/trocs/${$troc._id}/admin`, getHeader({admin: e.detail._id}))
		.then(res => res.json())
		.then(updateTroc)
	}

	function addCashier(e) {
		fetch(`/trocs/${$troc._id}/cashier`, getHeader({cashier: e.detail._id}))
		.then(res => res.json())
		.then(updateTroc)
    }

	function addTrader(e) {
        /*
		fetch(`/trocs/${$troc._id}/cashier`, getHeader({cashier: e.detail._id}))
		.then(res => res.json())
        .then(updateTroc)
        */
	}

	function removeAdmin(userId) {
		fetch(`/trocs/${$troc._id}/admin/remove`, getHeader({admin: userId}))
		.then(res => res.json())
		.then(updateTroc)
	}

	function removeCashier(userId) {
		fetch(`/trocs/${$troc._id}/cashier/remove`, getHeader({cashier: userId}))
		.then(res => res.json())
		.then(updateTroc)
    }

    function removeTrader(userId) {
        /*
		fetch(`/trocs/${$troc._id}/cashier/remove`, getHeader({cashier: userId}))
		.then(res => res.json())
        .then(updateTroc)
        */
    }
    
</script>

        <!-- Administrateurs -->

<div class="w3-padding w3-card w3-round" style="max-width: 850px; margin: auto;">
    
    <h3 class="w3-center">Administrateurs</h3>

    <List twoLine nonInteractive style="width: 60%; min-width: 200px; margin: auto;">

        {#each $troc.admin as admin}
            <Item>
                <Text>
                    <PrimaryText>{admin.name}</PrimaryText>
                    <SecondaryText>{admin.mail}</SecondaryText>
                </Text>
                {#if admin._id != $troc.creator._id && admin._id != $me._id}
                    <Meta class="material-icons clickable" on:click={() => removeAdmin(admin._id)}>clear</Meta>
                {/if}
            </Item>
        {/each}
        
        <br>

        <SearchUser
        placeholder="Nouvel administrateur"
        exepted={$troc.admin}
        on:select={addAdmin}/>

    </List>

    <br>

</div>

<br>    <!-- Caissiers-->

<div class="w3-padding w3-card w3-round" style="max-width: 850px; margin: auto;">
    
    <h3 class="w3-center">Caissiers</h3>

    <List twoLine nonInteractive dense style="width: 60%; min-width: 200px; margin: auto;">

        {#each $troc.trader as trader}
            <Item>
                <Text>
                    <PrimaryText>{trader.name}</PrimaryText>
                    <SecondaryText>{trader.mail}</SecondaryText>
                </Text>
                <Meta class="material-icons clickable" on:click={() => removeTrader(trader._id)}>clear</Meta>
            </Item>
        {/each}
        
        <br>

        <SearchUser
        placeholder="Nouveau caissier"
        exepted={[]}
        on:select={addTrader}/>

    </List>

</div>

<br>    <!-- Commercant -->

<div class="w3-padding w3-card w3-round" style="max-width: 850px; margin: auto;">

    <h3 class="w3-center">Commerçants</h3>

    <List twoLine nonInteractive dense style="width: 60%; min-width: 200px; margin: auto;">

        {#each $troc.cashier as cashier}
            <Item>
                <Text>
                    <PrimaryText>{cashier.name}</PrimaryText>
                    <SecondaryText>{cashier.mail}</SecondaryText>
                </Text>
                <Meta class="material-icons clickable" on:click={() => removeCashier(cashier._id)}>clear</Meta>
            </Item>
        {/each}
        
        <br>

        <SearchUser
        placeholder="Nouveau caissier"
        exepted="{[...$troc.cashier, $troc.creator]}"
        on:select={addCashier}/>

    </List>

</div>