<script>
    import { me, troc } from './stores'
    import SearchUser from './SearchUser.svelte'
    import UserLi from './UserLi.svelte'
    import { getHeader, updateTroc } from './utils'


	function addAdmin(e) {
        console.log(e)
		fetch(`/trocs/${$troc._id}/admin`, getHeader({admin: e.detail._id}))
		.then(res => res.json())
		.then(updateTroc)
	}

	function addCashier(e) {
		fetch(`/trocs/${$troc._id}/cashier`, getHeader({cashier: e.detail._id}))
		.then(res => res.json())
		.then(updateTroc)
	}

	function removeAdmin(e) {
		fetch(`/trocs/${$troc._id}/admin/remove`, getHeader({admin: e.detail._id}))
		.then(res => res.json())
		.then(updateTroc)
	}

	function removeCashier(e) {
		fetch(`/trocs/${$troc._id}/cashier/remove`, getHeader({cashier: e.detail._id}))
		.then(res => res.json())
		.then(updateTroc)
    }
    
</script>

<div class="w3-padding w3-card w3-round w3-row" style="max-width: 850px; margin: auto;">
    <div class="w3-padding w3-col m6" >
        <h3 class="w3-center">Administrateurs</h3>
        <ul class="w3-ul">
        {#each $troc.admin as admin}
            <UserLi user={admin} 
                    on:remove="{removeAdmin}"
                    cantRemove="{admin._id == $troc.creator._id || admin._id == $me._id}"/>
        {/each}
            <li>
                <SearchUser placeholder="Nouvel administrateur"
                            bind:exepted="{$troc.admin}"
                            on:select={addAdmin}/>
            </li>
        </ul>
    </div>

    <div class="w3-padding w3-border-left w3-col m6" >
        <h3 class="w3-center">Caissiers</h3>
        <ul class="w3-ul">
        {#each $troc.cashier as cashier}
            <UserLi user={cashier}
                    on:remove="{removeCashier}"/>
        {/each}
            <li>
                <SearchUser placeholder="Nouveau caissier"
                            exepted="{[...$troc.cashier, $troc.creator]}" 
                            on:select={addCashier}/>
            </li>
        </ul>
    </div>
</div>