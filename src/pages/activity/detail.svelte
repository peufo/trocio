<script>
    import { onMount } from 'svelte'

    import { Dialog } from 'svelte-materialify'

    import { subscribedTrocs, trocDetailsPromise, troc, trocPromise } from '$/stores.js'
    import { getHeader } from '$/utils.js'
    import notify from '$/notify.js'
    import TrocInfo from '$/TrocInfo.svelte'
    import Logo from '$/Logo.svelte'
    import Resume from '$/Resume.svelte'
    import ArticleCreateDialog from '$/ArticleCreateDialog.svelte'
    import TarifInfoDialog from '$/TarifInfoDialog.svelte'
    import Articles from '$/Articles.svelte'

    let articleCreateDialogActive
    let tarifInfoDialogActive
    let dialogArticlesActive

    onMount(() => {
        $trocPromise.then(() => {
            if (!$troc.isSubscribed) subcribe($troc._id)
        })
    })

	async function subcribe(trocId) {
        try {
            let res = await fetch('/__API__/subscribes', getHeader({troc: trocId}))
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

    {#if !!$troc}
        <TrocInfo troc={$troc} displayGetActivity={false} on:clickArticles={() => dialogArticlesActive = true}/>
    {/if}

    <br>
    
    <div style="position: relative; min-height: 250px;">
        {#await $trocDetailsPromise}
            <Logo/>
        {:then}
            <Resume
                on:articlesImported={e => $troc.articles += e.detail.nbArticles}
                on:openCreateDialog={() => articleCreateDialogActive = true}
                on:openTarifDialog={() => tarifInfoDialogActive = true}/>
        {/await}
    </div>
    <ArticleCreateDialog bind:dialogActive={articleCreateDialogActive} on:articleCreated={() => $troc.articles++}/>

    <TarifInfoDialog bind:dialog={tarifInfoDialogActive}/>

</div>

{#if !!$troc}
    <Dialog bind:active={dialogArticlesActive} style="min-height: 430px;" class="pa-4">
        <h5>Fouiller les articles dans <i>{$troc.name}</i></h5>
        <Articles troc={$troc._id}/>
    </Dialog>
{/if}
