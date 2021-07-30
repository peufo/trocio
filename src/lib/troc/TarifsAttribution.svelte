<script lang="ts">
  import { params } from '@roxi/routify'
  import { Table, TextField } from 'svelte-materialify'
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
</script>

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
        <th class="clickable" style="text-align: center;">
          {tarif.name}
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each subscribes as subscribe (subscribe._id)}
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
            {#if tarif.apply?.map((u) => u._id).includes(subscribe.user._id)}
              <IconLink icon={faCheck} />
            {/if}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</Table>

<style>
  .row:hover {
    background: var(--theme-tables-active);
  }
  .clickable:hover {
    background: var(--theme-tables-hover);
  }
</style>
