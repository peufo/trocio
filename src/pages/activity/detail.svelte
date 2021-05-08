<script>
  import { onMount } from 'svelte'

  import { Dialog } from 'svelte-materialify'

  import {
    subscribedTrocs,
    trocDetailsPromise,
    troc,
    trocPromise,
  } from '$lib/stores.js'
  import { getHeader } from '$lib/utils.js'
  import notify from '$lib/notify'

  import TrocInfo from '$lib/info/TrocInfo.svelte'
  import Resume from '$lib/info/UserResume.svelte'
  import TarifInfoDialog from '$lib/info/TarifInfoDialog.svelte'
  import Articles from '$lib/info/Articles.svelte'

  import ArticleCreateDialog from '$lib/form/ArticleCreateDialog.svelte'

  import Logo from '$lib/draw/Logo.svelte'

  let articleCreateDialogActive
  let tarifInfoDialogActive
  let dialogArticlesActive

  onMount(() => {
    $trocPromise.then(() => {
      if (!$troc?.isSubscribed) subcribe($troc._id)
    })
  })

  async function subcribe(trocId) {
    try {
      let res = await fetch('/api/subscribes', getHeader({ troc: trocId }))
      let json = await res.json()
      if (json.error) throw json.message || 'Not found'
      notify.success('Vous participez à un nouveau troc')
      $troc.subscriber++
      $troc.isSubscribed = true
      $subscribedTrocs = [$troc, ...$subscribedTrocs]
    } catch (error) {
      notify.error(error)
    }
  }
</script>

<div style="max-width: 800px; margin: auto;">
  {#if !!$troc}
    <TrocInfo
      troc={$troc}
      displayGetActivity={false}
      on:clickArticles={() => (dialogArticlesActive = true)}
    />
  {/if}

  <br />

  <div style="position: relative; min-height: 250px;">
    {#await $trocDetailsPromise}
      <Logo />
    {:then}
      <Resume
        on:articlesImported={(e) => ($troc.articles += e.detail.nbArticles)}
        on:openCreateDialog={() => (articleCreateDialogActive = true)}
        on:openTarifDialog={() => (tarifInfoDialogActive = true)}
      />
    {/await}
  </div>
  <ArticleCreateDialog
    bind:dialogActive={articleCreateDialogActive}
    on:articleCreated={() => $troc.articles++}
  />

  <TarifInfoDialog bind:dialog={tarifInfoDialogActive} />
</div>

{#if !!$troc}
  <Dialog
    bind:active={dialogArticlesActive}
    style="min-height: 430px;"
    class="pa-4"
  >
    <h5>Fouiller les articles dans <i>{$troc.name}</i></h5>
    <Articles troc={$troc._id} />
  </Dialog>
{/if}
