<script lang="ts">
  import { params, goto } from '@roxi/routify'
  import { Table, TextField, Ripple } from 'svelte-materialify'
  import debounce from 'debounce'

  import type { SubscribeLookup } from 'types'
  import IconLink from '$lib/util/IconLink.svelte'
  import {
    troc,
    useSubscribes,
    useSubscribesOptions,
    useAddApply,
  } from '$lib/troc/store'
  import { faCheck, faSearch } from '@fortawesome/free-solid-svg-icons'
  import TarifInfoDialog from '$lib/info/TarifInfoDialog.svelte'
  import notify from '$lib/notify'

  const addApply = useAddApply()

  const subscribesQuery =
    $params.trocId && useSubscribes({ trocId: $params.trocId, q: '' })
  const handleSearchSubscriber = debounce((event: any) => {
    subscribesQuery.setOptions(
      useSubscribesOptions({ trocId: $params.trocId, q: event.target.value })
    )
  }, 200)
  let subscribes: SubscribeLookup[] = []
  $: subscribes = $subscribesQuery.data
    ? $subscribesQuery.data.pages.flat()
    : []

  $: tarifByDefaultId = $troc?.tarif.find((tarif) => tarif.bydefault)?._id
  $: attributed = subscribes.map((subscribe) => {
    const attribution = $troc.tarif.find((tarif) =>
      tarif.apply?.map((user) => user._id).includes(subscribe.user._id)
    )
    if (attribution) return attribution._id
    return tarifByDefaultId
  })
</script>

<div class="container">
  <h6 class="mb-5">Attribution des tarifs</h6>

  <Table class="simple-card">
    <thead>
      <tr>
        <th style="padding-left: 0px; width: 340px;">
          <TextField
            placeholder="Chercher un participant"
            clearable
            solo
            dense
            flat
            on:change={handleSearchSubscriber}
            on:input={handleSearchSubscriber}
            style="max-width: 400px;"
          >
            <div slot="prepend">
              <IconLink icon={faSearch} size="1.1em" />
            </div>
          </TextField>
        </th>
        {#each $troc.tarif as tarif}
          <th
            class="clickable"
            style="text-align: center;"
            on:click={() => {
              $goto('/admin', {
                ...$params,
                tarif_selected: tarif._id,
                tab_admin: 'tarif_edition',
              })
            }}
          >
            {tarif.name}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each subscribes as subscribe, subscribeIndex (subscribe._id)}
        <tr class="row">
          <td>
            {subscribe.user.name}
            <br />
            <span class="text-caption text--disabled">
              {subscribe.user.mail}
            </span>
          </td>

          {#each $troc.tarif as tarif (tarif._id)}
            <td
              class="clickable"
              style="text-align: center;"
              use:Ripple={{ centered: true }}
              on:click={() =>
                $addApply.mutate(
                  {
                    trocId: $troc._id,
                    tarifId: tarif._id,
                    userId: subscribe.user._id,
                  },
                  {
                    onSuccess: () => {
                      notify.success(
                        `${tarif.name} attribué à ${subscribe.user.name}`
                      )
                    },
                  }
                )}
            >
              {#if tarif._id === attributed[subscribeIndex]}
                <IconLink icon={faCheck} />
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </Table>
</div>

<style>
  .container {
    max-width: 1400px;
    margin: auto;
  }

  .row:hover {
    background: var(--theme-tables-active);
  }
  .clickable:hover {
    background: var(--theme-tables-hover);
  }
</style>
