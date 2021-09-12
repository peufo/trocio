<script lang="ts">
  import { params, goto, url } from '@roxi/routify'
  import { TextField, Ripple, Button } from 'svelte-materialify'
  import debounce from 'debounce'
  import MagicTable from '$lib/util/MagicTable.svelte'

  import { layout } from '$lib/store/layout'
  import type { SubscribeLookup, ParamsAPI } from 'types'
  import IconLink from '$lib/util/IconLink.svelte'
  import { useInfinitApi } from '$lib/api'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import { troc, useAddApply } from '$lib/troc/store'
  import {
    faCheck,
    faEyeSlash,
    faEye,
    faSearch,
  } from '@fortawesome/free-solid-svg-icons'
  import notify from '$lib/notify'
  import qs from 'qs'

  let searchUserDebounced = ''

  const addApply = useAddApply()

  $: subscribesQuery = useInfinitApi<ParamsAPI, SubscribeLookup[]>([
    'subscribes',
    {
      trocId: $params.trocId,
      filtredTarifs: $params.filtredTarifs,
      q: searchUserDebounced,
    },
  ])

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

  const handleSearchSubscriber = debounce((event: any) => {
    searchUserDebounced = event.target.value
  }, 200)

  function handleClickFilter(event: PointerEvent, tarifId: string) {
    event.stopPropagation()
    const { filtredTarifs = [] } = $params
    const index = filtredTarifs.indexOf(tarifId)
    const query = {
      ...$params,
      filtredTarifs:
        index === -1
          ? [...filtredTarifs, tarifId]
          : [
              ...filtredTarifs.slice(0, index),
              ...filtredTarifs.slice(index + 1),
            ],
    }

    if (!query.filtredTarifs.length) {
      // @ts-ignore
      delete query.filtredTarifs
    }

    $goto('/admin', query)
  }
</script>

<div class="container">
  <h6 class="mb-5">Attribution des tarifs</h6>

  <MagicTable
    class="simple-card"
    query={subscribesQuery}
    style="max-height: {$layout.mainHeight - 94}px;"
  >
    <thead>
      <tr>
        <th style="padding-left: 0px; width: 340px;">
          <SearchTextField
            bind:search={searchUserDebounced}
            placeholder="Chercher un participant"
          />
        </th>
        {#each $troc.tarif as tarif}
          <th
            class="clickable"
            style="text-align: center;"
            on:click={() => {
              $goto('/admin/tarif_edition', {
                ...$params,
                tarif_selected: tarif._id,
                tab_admin: 'tarif_edition',
              })
            }}
          >
            {tarif.name}
            <IconLink
              icon={$params.filtredTarifs?.includes(tarif._id)
                ? faEyeSlash
                : faEye}
              size=".8em"
              class={$params.filtredTarifs?.includes(tarif._id)
                ? 'primary-text'
                : ''}
              clickable
              on:click={(event) => handleClickFilter(event, tarif._id)}
            />
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
  </MagicTable>
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
