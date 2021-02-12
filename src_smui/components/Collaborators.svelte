<script>
    import List, { Item, Text, Meta, PrimaryText, SecondaryText } from '@smui/list'
    import Dialog, { Title, Content } from '@smui/dialog'
    import TextField from '@smui/textfield'
    import Button from '@smui/button'
    
    import { troc } from './stores'
    import SearchUser from './SearchUser.svelte'
    import UserLi from './UserLi.svelte'
    import { getHeader, updateTroc } from './utils'
    import { user } from './stores'

    let selectedTrader = -1
    let selectedTraderName = ''
    let selectedTraderPrefix = ''
    let traderPrefixDialog
    let changePrefixPromise

    function findNewPrefix() {
        let prefixs = $troc.trader.map(t => t.prefix)
        let char = ''
        for(let i = 65; i < 91; i++) {
            char = String.fromCharCode(i)
            if (prefixs.indexOf(char) == -1) break
        }
        return char
    }

    function normalizePrefix() {
        selectedTraderPrefix = selectedTraderPrefix.slice(selectedTraderPrefix.length - 1, selectedTraderPrefix.length).toLocaleUpperCase()
        if (selectedTraderPrefix.charCodeAt() < 65 || selectedTraderPrefix.charCodeAt() > 90) {
            selectedTraderPrefix = findNewPrefix()
        }
    }

    function clickTrader(e, index) {
        if (e.target.classList.contains('remove-icon')) {
            removeTrader($troc.trader[index].user._id)
        }else{
            selectedTrader = index
            selectedTraderName = $troc.trader[index].user.name
            selectedTraderPrefix = $troc.trader[index].prefix
            traderPrefixDialog.open()
        }
    }

    async function changePrefix(){
        try {
            let res = await fetch(`/__API__/trocs/${$troc._id}/trader/prefix`, getHeader({trader: $troc.trader[selectedTrader].user._id, prefix: selectedTraderPrefix}))
            let json = await res.json()
            if (json.success) $troc.trader[selectedTrader].prefix = selectedTraderPrefix
            else alert(json.message)
            setTimeout(() => traderPrefixDialog.close(), 0)
            return
        } catch(error) {
            console.trace(error)
        }
    }

	function addAdmin(e) {
		fetch(`/__API__/trocs/${$troc._id}/admin`, getHeader({admin: e.detail._id}))
		.then(res => res.json())
        .then(updateTroc)
        .catch(console.trace)
	}

	function addCashier(e) {
		fetch(`/__API__/trocs/${$troc._id}/cashier`, getHeader({cashier: e.detail._id}))
		.then(res => res.json())
        .then(updateTroc)
        .catch(console.trace)
    }

	function addTrader(e) {
		fetch(`/__API__/trocs/${$troc._id}/trader`, getHeader({trader: e.detail._id, prefix: findNewPrefix()}))
		.then(res => res.json())
        .then(updateTroc)
        .catch(console.trace)
	}

	function removeAdmin(userId) {
		fetch(`/__API__/trocs/${$troc._id}/admin/remove`, getHeader({admin: userId}))
		.then(res => res.json())
        .then(updateTroc)
        .catch(console.trace)
	}

	function removeCashier(userId) {
		fetch(`/__API__/trocs/${$troc._id}/cashier/remove`, getHeader({cashier: userId}))
		.then(res => res.json())
        .then(updateTroc)
        .catch(console.trace)
    }

    function removeTrader(userId) {
		fetch(`/__API__/trocs/${$troc._id}/trader/remove`, getHeader({trader: userId}))
		.then(res => res.json())
        .then(updateTroc)
        .catch(console.trace)
    }

</script>

        <!-- Administrateurs -->

<div class="w3-padding w3-card w3-round" style="max-width: 850px; margin: auto;">
    
    <h3 class="w3-center">Administrateurs</h3>

    <List twoLine nonInteractive style="width: 480px; min-width: 200px; margin: auto;">

        {#each $troc.admin as admin}
            <Item>
                <Text>
                    <PrimaryText>{admin.name}</PrimaryText>
                    <SecondaryText>{admin.mail}</SecondaryText>
                </Text>
                {#if admin._id != $troc.creator._id && admin._id != $user._id}
                    <Meta class="material-icons clickable" on:click={() => removeAdmin(admin._id)}>clear</Meta>
                {/if}
            </Item>
        {/each}
        
        <br>

        <SearchUser
        id="NewAdmin"
        placeholder="Nouvel administrateur"
        exepted={$troc.admin}
        on:select={addAdmin}/>

    </List>

    <br>

</div>

<br>    <!-- Caissiers-->

<div class="w3-padding w3-card w3-round" style="max-width: 850px; margin: auto;">
    
    <h3 class="w3-center">Caissiers</h3>

    <List twoLine nonInteractive style="width: 480px; min-width: 200px; margin: auto;">

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

        <SearchUser id="Newcashier" placeholder="Nouveau caissier" exepted={$troc.cashier} on:select={addCashier}/>

    </List>

    <br>

</div>

<br>    <!-- Commercant -->

<div class="w3-padding w3-card w3-round" style="max-width: 850px; margin: auto;">

    <h3 class="w3-center">Commerçants</h3>

    <List twoLine style="width: 480px; min-width: 200px; margin: auto;">
        {#if $troc.trader}
        {#each $troc.trader as trader, i}
            <Item on:click={e => clickTrader(e, i)}>
                <Text>
                    <PrimaryText>
                        <b>{trader.prefix}</b> 
                        &nbsp; <i class="fas fa-arrow-right w3-opacity"></i>&nbsp;
                        {trader.user.name}
                    </PrimaryText>
                    <SecondaryText>{trader.user.mail}</SecondaryText>
                </Text>
                <Meta class="material-icons clickable remove-icon">clear</Meta>
            </Item>
        {/each}
        {/if}
        
        <br>

        <SearchUser id="NewTrader" placeholder="Nouveau commerçant" exepted={$troc.trader.map(t => t.user)} on:select={addTrader}/>

    </List>

    <br>

</div>

<Dialog bind:this={traderPrefixDialog}>
    <Title>Edition du préfixe utilisé par {selectedTraderName}</Title>
    <Content>
    
        <TextField
        bind:value="{selectedTraderPrefix}"
        on:input={normalizePrefix}
        class="shaped-outlined w3-margin-top"
        label="Nouveau préfixe"
        variant="outlined"
        style="width: 100%;"/>
    
        {#await changePrefixPromise}
            <Button
            variant="raised"
            color="secondary"
            class="w3-right w3-margin-top">
                <i class="fas fa-circle-notch w3-spin"></i>&nbsp;Validation...
            </Button>
        {:then}
            <Button
            on:click="{() => changePrefixPromise = changePrefix()}"
            variant="raised"
            style="color: white;"
            disabled={!selectedTraderPrefix || $troc.trader.map(t => t.prefix).indexOf(selectedTraderPrefix) != -1}
            class="w3-right w3-margin-top">
                Valider
            </Button>
        {/await}


    </Content>
</Dialog>

<br><br>