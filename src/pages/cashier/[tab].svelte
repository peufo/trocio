<!--
<script context="module">
    export async function preload(page, { user }) {
        let { tab } = page.params
        let baseUrl = tab ? page.path.replace(`/${tab}`, '') : page.path
        return {tab, baseUrl}
    }
</script>
-->
<script>    

    import Card     from '@smui/card'
    import Swip     from '../../components/Swip.svelte'
    import Provide  from '../../components/Provide.svelte'
    import Recover  from '../../components/Recover.svelte'
    import Buy      from '../../components/Buy.svelte'
    import Giveback from '../../components/Giveback.svelte'
    import Resume   from '../../components/Resume.svelte'

    export let tab = ''
    export let baseUrl = ''

    let tabs = [
        {href: 'provide',	label: 'Fournit', 		icon: 'fas fa-sign-in-alt',     component: Provide},
		{href: 'recover',	label: 'Récupère', 		icon: 'fas fa-sign-out-alt',    component: Recover},
		{href: 'buy',		label: 'Achète', 		icon: 'fas fa-shopping-basket', component: Buy,         clientAnonymAutorised: true},
		{href: 'giveback',  label: 'Retourne', 		icon: 'fas fa-undo', 			component: Giveback,    clientAnonymAutorised: true},
		{href: 'resume',	label: 'Aperçu', 		icon: 'far fa-eye', 			component: Resume,      clientAnonymAutorised: true},
    ]

    let tabActived = tabs[tabs.map(t => t.href).indexOf(tab)]

</script>

<Card class="w3-margin-top">

    <Swip {tabs} {tabActived} {baseUrl} let:tab >
        <svelte:component this={tab.component} ></svelte:component>
    </Swip>

    <!--
    <TabBar bind:active={tabActive}
    id="cashierTabs"
    tabs={actions.filter(a => !clientAnonym || a.clientAnonymAutorised)}
    let:tab
    style="border-radius: 4px 4px 0px 0px; border-bottom: 1px solid rgb(240, 240, 240);">
        <Tab {tab} on:click={() => selectTab(tab)} active={segment == tab.link} style="border-radius: 4px 4px 0px 0px;">
            <Icon class={tab.icon}></Icon>
            {#if !mobileDisplay}
                <Label>{tab.label}</Label>
            {/if}
        </Tab>
    </TabBar>

    <Content>
        <slot></slot>
        {#if segment == 'provide'}
            <Provide {provided} />
        {/if}

    </Content>
    -->

</Card>
