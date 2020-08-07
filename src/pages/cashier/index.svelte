<script>
    import { fade } from 'svelte/transition'
    import { params } from '@sveltech/routify'
    import Card from '@smui/card'

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

    let tabs = [
        {href: 'provide',	label: 'Fourni', 		icon: 'fas fa-sign-in-alt',     component: Provide},
		{href: 'recover',	label: 'Récupère', 		icon: 'fas fa-sign-out-alt',    component: Recover},
		{href: 'buy',		label: 'Achète', 		icon: 'fas fa-shopping-basket', component: Buy,         clientAnonymAutorised: true},
		{href: 'giveback',  label: 'Retourne', 		icon: 'fas fa-undo', 			component: Giveback,    clientAnonymAutorised: true},
		{href: 'resume',	label: 'Aperçu', 		icon: 'far fa-eye', 			component: Resume,      clientAnonymAutorised: true},
    ]

    let tabActived = tabs[tabs.map(t => t.href).indexOf($params.tab || 'resume')]

    let articleCreateDialog
    let tarifInfoDialog

    let filter = tab => tab.clientAnonymAutorised || $params.client != 'undefined'

</script>
<div class="simple-card">
    {#await $trocDetailsPromise}
        <div style="position: relative; height: 500px;">
            <Logo/>
        </div>
        
    {:then}
    {#if $trocDetails}
        <div in:fade|locale>
            <Swip tabs={tabs.filter(filter)} {tabActived} let:tab tabId="cashierTabs">
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
