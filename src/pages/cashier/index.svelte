<script>
    import { fade } from 'svelte/transition'
    import { redirect, params } from '@sveltech/routify'
    import Card from '@smui/card'
    import { onMount, onDestroy } from 'svelte'

    import { trocDetails, trocDetailsPromise } from 'stores.js'
    import Swip     from 'Swip.svelte'
    import Provide  from 'Provide.svelte'
    import Recover  from 'Recover.svelte'
    import Buy      from 'Buy.svelte'
    import Giveback from 'Giveback.svelte'
    import Resume   from 'Resume.svelte'
    import Logo     from 'Logo.svelte'
    import ArticleCreateDialog from 'ArticleCreateDialog.svelte'
    import TarifInfoDialog from 'TarifInfoDialog.svelte'

    let swiper
    let tabs = [
        {ref: 'provide',	label: 'Fourni', 		icon: 'fas fa-sign-in-alt',     component: Provide},
		{ref: 'recover',	label: 'Récupère', 		icon: 'fas fa-sign-out-alt',    component: Recover},
		{ref: 'buy',		label: 'Achète', 		icon: 'fas fa-shopping-basket', component: Buy,         clientAnonymAutorised: true},
		{ref: 'giveback',   label: 'Retourne', 		icon: 'fas fa-undo', 			component: Giveback,    clientAnonymAutorised: true},
		{ref: 'resume',	    label: 'Aperçu', 		icon: 'far fa-eye', 			component: Resume,      clientAnonymAutorised: true},
    ]

    let tabActived = tabs[tabs.map(t => t.ref).indexOf($params.tab || 'resume')]

    let articleCreateDialog
    let tarifInfoDialog

    let filter = tab => tab.clientAnonymAutorised || $params.client != 'undefined'

    onMount(() => document.addEventListener('keyup', shortcut))
    onDestroy(() => document.removeEventListener('keyup', shortcut))

    function shortcut(e) {
        if (e.ctrlKey &&
            !document.activeElement.classList.contains('mdc-tab') &&
            (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
        ){
            let tabIndex = tabs.filter(filter).map(t => t.ref).indexOf($params.tab)
            if (e.key === 'ArrowLeft') tabIndex--
            else tabIndex++

            if (tabIndex < 0) tabIndex = tabs.length -1
            else if (tabIndex >= tabs.length) tabIndex = 0

            swiper.slideTo(tabIndex)
	
        }        
    }

</script>
<div class="simple-card">
    {#await $trocDetailsPromise}
        <div style="position: relative; height: 500px;">
            <Logo/>
        </div>
        
    {:then}
        {#if $trocDetails}
            <div in:fade|locale>
                <Swip
                    bind:swiper
                    tabs={tabs.filter(filter)}
                    {tabActived}
                    let:tab
                    tabId="cashierTabs">
                    <div style="padding: 16px; min-height: 450px;">
                        <svelte:component
                        this={tab.component}
                        on:openCreateDialog={articleCreateDialog.open}
                        on:openTarifDialog={tarifInfoDialog.open}
                        ></svelte:component>
                    </div>
                </Swip>
            </div>
        {/if}
    {/await}
</div>
<ArticleCreateDialog bind:dialog={articleCreateDialog}/>

<TarifInfoDialog bind:dialog={tarifInfoDialog}/>
