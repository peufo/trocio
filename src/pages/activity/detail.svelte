<script>
    import { onMount } from 'svelte'
    import { user, subscribedTrocs, trocDetailsPromise, troc, trocPromise } from 'stores.js'
    import { getHeader } from 'utils.js'
    import notify from 'notify.js'
    import TrocInfo from 'TrocInfo.svelte'
    import Logo from 'Logo.svelte'
    import Resume from 'Resume.svelte'
    import ArticleCreateDialog from 'ArticleCreateDialog.svelte'
    import TarifInfoDialog from 'TarifInfoDialog.svelte'

    let articleCreateDialog
    let tarifInfoDialog

    onMount(() => {
        $trocPromise.then(() => {
            if (!$troc.isSubscribed) subcribe($troc._id)
        })
    })

	async function subcribe(trocId) {
        try {
            let res = await fetch('__API__/subscribes', getHeader({troc: trocId}))
            let json = await res.json()
            if (json.error) throw json.message || 'Not found'
            notify.success('Vous participez à un nouveau troc')
            $troc.subscriber++
            $troc.isSubscribed = true
            $subscribedTrocs = [$troc, ...$subscribedTrocs]

        } catch(error) {
            notify.error(error)
        }
    }

</script>

<div style="max-width: 800px; margin: auto;">

    {#await $trocPromise}
        <Logo/>
    {:then}
        <TrocInfo troc={$troc} displayGetActivity={false}/>
    {/await}

    <br>
    
    <div style="position: relative; min-height: 250px;">
        {#await $trocDetailsPromise}
            <Logo/>
        {:then}
            <Resume on:openCreateDialog={articleCreateDialog.open} on:openTarifDialog={tarifInfoDialog.open}/>
        {/await}
    </div>
    <ArticleCreateDialog bind:dialog={articleCreateDialog}/>

    <TarifInfoDialog bind:dialog={tarifInfoDialog}/>

</div>
