<script>
    import { fade } from 'svelte/transition'
    import { redirect, params } from '@roxi/routify'
    import Card from '@smui/card'
    import { onMount, onDestroy } from 'svelte'

    import { trocDetails, trocDetailsPromise } from '$lib/stores.js'
    import Swip     from '$lib/Swip.svelte'
    import Provide  from '$lib/Provide.svelte'
    import Recover  from '$lib/Recover.svelte'
    import Buy      from '$lib/Buy.svelte'
    import Giveback from '$lib/Giveback.svelte'
    import Resume   from '$lib/Resume.svelte'
    import Logo     from '$lib/Logo.svelte'
    import ArticleCreateDialog from '$lib/ArticleCreateDialog.svelte'
    import TarifInfoDialog from '$lib/TarifInfoDialog.svelte'

    let swiper
    let tabs = [
        {ref: 'provide',	label: 'Fourni', 		icon: 'fas fa-sign-in-alt',     component: Provide},
		{ref: 'recover',	label: 'Récupère', 		icon: 'fas fa-sign-out-alt',    component: Recover},
		{ref: 'buy',		label: 'Achète', 		icon: 'fas fa-shopping-basket', component: Buy,         clientAnonymAutorised: true},
		{ref: 'giveback',   label: 'Retourne', 		icon: 'fas fa-undo', 			component: Giveback,    clientAnonymAutorised: true},
		{ref: 'resume',	    label: 'Aperçu', 		icon: 'far fa-eye', 			component: Resume,      clientAnonymAutorised: true},
    ]

    let filter = tab => tab.clientAnonymAutorised || $params.client != 'undefined'

    $: activeIndex = tabs.filter(filter).map(t => t.ref).indexOf($params.tab || 'resume')
    $: if ($params.client === 'undefined' && tabs.filter(filter).map(t => t.ref).indexOf($params.tab) === -1) {
        $redirect(document.pathname, {...$params, tab: 'buy'})
    }

    let articleCreateDialog
    let tarifInfoDialog

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

            if (tabIndex < 0) tabIndex = tabs.filter(filter).length -1
            else if (tabIndex >= tabs.filter(filter).length) tabIndex = 0

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
                    {activeIndex}
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
