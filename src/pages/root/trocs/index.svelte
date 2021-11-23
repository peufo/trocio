<script lang="ts">
  import { useInfinitApi } from '$lib/api'
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

  $: query = useInfinitApi<{}, TrocShow[]>([`root/trocs?${searchTroc}`, {}])
  $: trocs = $query.data?.pages.flat() || []

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
</script>

<div class="pt-8" style="width: 800px; margin: auto;">
  <h6>Trocs</h6>
  <div class="w3-row">
    <input bind:value={searchTroc} class="w3-input" />
    <br />
    {#each trocs as troc}
      <div class="simple-card mt-4 pa-2">
        <Button class="w3-red" on:click={() => removeTroc(troc)}>
          Supprimer
        </Button>
        <a href="trocs/subscribes?trocId={troc._id}">
          <Button>Subscribes</Button>
        </a>

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
