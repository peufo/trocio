<script>
    import { redirect, params } from '@sveltech/routify'
	import { onMount } from 'svelte'
	import { troc, trocPromise } from 'stores.js'
    import { fade } from 'svelte/transition'
	import Tab, { Label, Icon } from '@smui/tab'
	import TabBar from '@smui/tab-bar'
    
    import Logo from 'Logo.svelte'
	import EditForm from 'EditForm.svelte'
	import SearchUser from 'SearchUser.svelte'
	import AutoPatch from 'AutoPatch.svelte'
	import UserLi from 'UserLi.svelte'
	import Collaborators from 'Collaborators.svelte'
	import Tarif from 'Tarif.svelte'
	import Correction from 'Correction.svelte'
	import Stats from 'Stats.svelte'
    import TagEdit from 'TagEdit.svelte'
	import Cashier from '../cashier/_layout.svelte'
	import CashierIndex from '../cashier/index.svelte'
    import { getHeader, updateTroc } from 'utils.js'
    import { user } from 'stores.js'
    
    let maxWidthToShowLabel = 1150
    let offsetWidth

    let tabs = [
        {ref: 'info',	    label: 'Informations', 	    icon: 'fas fa-info-circle'},
		{ref: 'collab',	    label: 'Collaborateurs',    icon: 'fas fa-users'},
		{ref: 'tarif',		label: 'Tarifications',     icon: 'fas fa-coins'},
		{ref: 'tag',        label: 'Etiquetage', 	    icon: 'fas fa-tag'},
		{ref: 'statistic',	label: 'Statistique', 	    icon: 'fas fa-chart-pie'},
		{ref: 'managment',	label: 'Gestion', 		    icon: 'fas fa-eraser'},
		{ref: 'cashier',	label: 'Caisse', 		    icon: 'fas fa-cash-register'},
    ]
    let tabActived = tabs[tabs.map(t => t.ref).indexOf($params.tab_admin || 'info')]

	onMount(() => {
		//let query = queryString.parse(location.search)
		//troc.find(query.troc)
	})

	function saveMeta(e) {
		fetch(`__API__/trocs/${$troc._id}`, getHeader(e.detail, 'PATCH'))
		.then(res => res.json())
        .then(updateTroc)
        .catch(console.trace)
	}

	function removeTarif(i) {
        $troc.tarif = [...$troc.tarif.slice(0, i), ...$troc.tarif.slice(i + 1)]
        changeFlag = true
	}

	let changeFlag = false //For SearchUser to AutoPatch 
    let tag = {} // For tag edit
    
	function activeTab(index) {
		tabActived = tabs[index]
		console.log('Active Tab redirect')
		$redirect(location.pathname, {...$params, tab_admin: tabActived.ref})
    }

</script>

<!-- Check if all is OK ! -->
{#await $trocPromise}
    <Logo/>
{:then}
    {#if $troc === null && $user === null}
        {$redirect('/')}
    {:else if $troc === null}
        {$redirect('/activity')}
    {:else if $troc.failed}
        <div class="w3-display-container">
            <div class="w3-display-middle w3-red w3-padding w3-round w3-large w3-center">
                <i class="fas fa-bug"></i> Oups ! <br>
                {#if $troc.reason == 'Not found'}
                    <span>Ce troc n'éxiste pas !</span>
                {:else if $troc.reason == 'Bad request'}
                    <span>La requête n'est pas valide !</span>
                {:else}
                    <span>Vous n'avez pas accès à la page administrateur de ce troc !</span>
                {/if}
            </div>
        </div>
    {:else}
        
        <div bind:offsetWidth>

            <TabBar {tabs} let:tab
                active={tabActived}
                on:MDCTabBar:activated={e => activeTab(e.detail.index)}
                style="border-bottom: 1px #eee solid; max-width: 1400px; margin: auto;">
                <Tab {tab} >
                    {#if offsetWidth > maxWidthToShowLabel}
                        <Icon class={tab.icon}></Icon>
                        <Label>{tab.label}</Label>
                    {:else}
                        <Icon class={`${tab.icon} w3-large`}></Icon>
                    {/if}
                </Tab>
            </TabBar>

            <br>

            {#if tabActived.ref === 'info'}
                <div in:fade class="w3-padding w3-card w3-round" style="max-width: 1200px; margin: auto;">
                    <EditForm {...$troc}/>
                </div>

            {:else if tabActived.ref === 'collab'}
                <div in:fade>
                    <Collaborators />
                </div>

            {:else if tabActived.ref === 'tarif'}
                <AutoPatch source="editTarif" body={{tarif: $troc.tarif}} path={`/trocs/${$troc._id}`} bind:changeFlag={changeFlag} trocRefresh/>
                <div id="editTarif" in:fade>
                    {#each $troc.tarif as tarif, i}
                        <Tarif 	index={i}
                                bind:name={tarif.name}
                                bind:apply={tarif.apply}
                                bind:margin={tarif.margin}
                                bind:fee={tarif.fee}
                                bind:maxarticles={tarif.maxarticles}
                                bind:bydefault={tarif.bydefault}
                                on:remove={() => removeTarif(i)}
                                on:selectUser={() => changeFlag = true}
                                on:removeUser={() => changeFlag = true}/>
                    {/each}
                    <div id="addTarif">
                        <div on:click={() => $troc.tarif = [...$troc.tarif, {fee: [], apply: []}]}
                            class="patchButton w3-button w3-border w3-round w3-right">
                            +1 tarif
                        </div>
                    </div>
                </div>

            {:else if tabActived.ref === 'tag'}
                <AutoPatch source="tagEdit" body="{{tag: $troc.tag}}" path="{`/trocs/${$troc._id}`}" trocRefresh/>
                <div id="tagEdit" in:fade>
                    <TagEdit bind:width={$troc.tag.width} bind:height={$troc.tag.height} bind:padding={$troc.tag.padding} bind:border={$troc.tag.border}/>
                </div>

            {:else if tabActived.ref === 'statistic'}
                <div in:fade>
                    <Stats/>
                </div>

            {:else if tabActived.ref === 'managment'}
                <div in:fade>
                    <Correction/>
                </div>

            {:else if tabActived.ref === 'cashier'}
                <div in:fade>
                    <Cashier adminIntegration>
                        <CashierIndex/>
                    </Cashier>
                </div>
            
            {/if}
        </div>
    {/if}
{/await}

<svelt:head>
	<style>#waitLoaded { display: none; }</style>
</svelt:head>

<style>

	#addTarif {
		max-width: 850px;
		margin: auto;
	}

	.w3-display-container {
		height: calc(100% - 57px);
	}

</style>
