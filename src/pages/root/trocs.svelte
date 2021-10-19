<script lang="ts">
  import { api } from '$lib/api'
  import notify from '$lib/notify'
  import { getHeader, syntaxHighlight } from '$lib/utils'
  import { Button } from 'svelte-materialify'
  import { slide } from 'svelte/transition'
  import type { Troc } from 'types'

  interface TrocShow extends Troc {
    show: boolean
  }

  let searchTroc = ''
  let trocs: TrocShow[] = []

  async function fetchTrocs() {
    try {
      let res = await fetch(`/api/root/trocs?${searchTroc}`)
      trocs = await res.json()
    } catch (error) {
      notify.error(error)
    }
  }

  async function removeTroc(troc: Troc) {
    if (prompt(`Tapez "${troc.name}" pour le supprimer`) === troc.name) {
      try {
        let res = await fetch(
          '/api/root/remove-troc',
          getHeader({ trocId: troc._id })
        )
        let json = await res.json()
        if (json.error) throw json.message
        notify.success(json.message)
      } catch (error) {
        notify.error(error)
      }
    } else {
      notify.warning('Nom incorrect')
    }
  }

  async function computeSubscriber(trocId: string) {
    try {
      let res = await fetch(
        '/api/root/compute-subscriber',
        getHeader({ trocId })
      )
      let json = await res.json()
      if (json.error) throw json.message
      notify.success(json.message)
    } catch (error) {
      notify.error(error)
    }
  }

  async function computeArticles(trocId: string) {
    try {
      let res = await fetch('/api/root/compute-articles', getHeader({ trocId }))
      let json = await res.json()
      if (json.error) throw json.message
      notify.success(json.message)
    } catch (error) {
      notify.error(error)
    }
  }

  function subscirbesMigration(trocId: string) {
    api('/api/root/subscribes-migration', {
      method: 'post',
      data: { trocId },
    })
      .then((res) => notify.success(res.message))
      .catch(notify.error)
  }
</script>

<div class="mt-8" style="width: 800px; margin: auto;">
  <h6>Trocs</h6>
  <div class="w3-row">
    <input bind:value={searchTroc} on:input={fetchTrocs} class="w3-input" />
    <br />
    {#each trocs as troc}
      <div class="simple-card mt-4 pa-2">
        <Button
          class="w3-margin-right"
          on:click={() => computeSubscriber(troc._id)}
        >
          Compter le nombre d'abonnement
        </Button>
        <Button
          class="w3-margin-right"
          on:click={() => computeArticles(troc._id)}
        >
          Compter le nombre d'articles
        </Button>
        <Button
          class="w3-margin-right"
          on:click={() => subscirbesMigration(troc._id)}
        >
          Migration des subscribes
        </Button>

        <Button class="w3-red" on:click={() => removeTroc(troc)}>
          Supprimer
        </Button>

        <h6 on:click={() => (troc.show = !troc.show)}>
          {troc.name}
        </h6>
        {#if troc.show}
          <pre
            transition:slide>
                {@html syntaxHighlight(JSON.stringify(troc, null, 2))}
          </pre>
        {/if}
      </div>
    {/each}
  </div>
</div>
