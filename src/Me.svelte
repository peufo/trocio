
<script>
    import queryString from 'query-string'
    import { onMount } from 'svelte'
    import { me } from './stores'

    import Activity from './Activity.svelte'
    import Profile from './Profile.svelte'

    let tabSelected = 0
	let tabs = [
		{num: 0, name: 'Mes activités', icon: '<i class="far fa-star"></i>'},
		{num: 1, name: 'Mes informations', icon: '<i class="fas fa-info-circle"></i>'},
    ]

    let changePassword = false
    let oldPassword = ''
    let newPassword = ''
    let newPassword2 = ''


    let patchNamePromise
    let patchMailPromise
    let sendMailValidatorPromise
    let mailValidatorSent = false


    //NAVIGATION GESTION
    
    onMount(importHash)
    window.addEventListener("hashchange", importHash)

    function importHash() {
        let query = queryString.parse(location.hash)
        let num = query.tab
        if (isNaN(num)) num = 0
        else if (num < 0) num = 0
        else if (num >= tabs.length) num = tabs.length - 1
        tabSelected = num
    }

    function exportHash(num) {
        let query = queryString.parse(location.hash)
        query.tab = num
        location.hash = queryString.stringify(query)
    }

    function selectTab(num) {
        exportHash(num)
        tabSelected = num
    }

</script>


{#if !$me._id}

    <div class="w3-display-container" style="height: calc(100% - 96px);">
        <div class="w3-display-middle">
            <img src="/favicon.ico" alt="Logo trocio" class="w3-spin">
        </div>
    </div>

{:else}

    <div class="onglets">
        {#each tabs as tab}
            <div class="w3-padding underline-div onglet"
                on:click="{() => selectTab(tab.num)}"
                class:actived="{tabSelected == tab.num}">
                {@html tab.icon}
                <span class="underline-span">{tab.name}</span>
            </div>
        {/each}
    </div>

    <div class="tabs" style="height:  calc(100% - 96px);">

        <!-- Informations personel -->
        <div class="tab" class:center={tabSelected == 0} class:left={tabSelected > 0}>
            <Activity/>
        </div>

        <!-- Activités -->
        <div class="tab" class:center={tabSelected == 1} class:right={tabSelected < 1}>
            <Profile/>
        </div>

    </div>

{/if}



<svelt:head>
	<style>#waitLoaded { display: none; }</style>
</svelt:head>

<style>

</style>