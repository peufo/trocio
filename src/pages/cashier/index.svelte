<script>
    import { params } from '@sveltech/routify'
    import { trocDetails } from 'stores.js'
    import Card     from '@smui/card'
    import Swip     from 'Swip.svelte'
    import Provide  from 'Provide.svelte'
    import Recover  from 'Recover.svelte'
    import Buy      from 'Buy.svelte'
    import Giveback from 'Giveback.svelte'
    import Resume   from 'Resume.svelte'


    let tabs = [
        {href: 'provide',	label: 'Fournit', 		icon: 'fas fa-sign-in-alt',     component: Provide},
		//{href: 'recover',	label: 'Récupère', 		icon: 'fas fa-sign-out-alt',    component: Recover},
		//{href: 'buy',		label: 'Achète', 		icon: 'fas fa-shopping-basket', component: Buy,         clientAnonymAutorised: true},
		//{href: 'giveback',  label: 'Retourne', 		icon: 'fas fa-undo', 			component: Giveback,    clientAnonymAutorised: true},
		{href: 'resume',	label: 'Aperçu', 		icon: 'far fa-eye', 			component: Resume,      clientAnonymAutorised: true},
    ]

    let tabActived = tabs[tabs.map(t => t.href).indexOf($params.tab || 'resume')]

</script>

<Swip {tabs} {tabActived} let:tab >
    {#if $trocDetails}
        <div style="padding: 16px;">
            <svelte:component this={tab.component}></svelte:component>
        </div>
    {/if}
</Swip>

