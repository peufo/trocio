<script lang="ts">
  import { onMount } from 'svelte'
  import { ListItem, Menu } from 'svelte-materialify'
  import { goto, params, url } from '@roxi/routify'
  import { faTimes } from '@fortawesome/free-solid-svg-icons'

  import MagicSelect from '$lib/util/MagicSelect.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import type { FieldInteface } from 'types'
  export let field: Partial<FieldInteface>
  let inputElement: HTMLInputElement
  let active = false
  let filterLabel = ''

  onMount(() => {
    // Très chiant des récupérer un label à partir d'un id ...
    const queryValue = $params[`exact_${field.queryKey}`]
    if (queryValue) {
      filterLabel = 'Filtre actif'
    }
  })

  function handleOpen() {
    // Place directement le curseur dans la recherche
    setTimeout(() => {
      inputElement.focus()
    }, 200)
  }

  function handleSelect(item: any) {
    filterLabel = field.selectOption?.getValue
      ? field.selectOption?.getValue(item)
      : item['name']
    active = false
  }

  function handleClear() {
    const query = $params
    delete query[`exact_${field.queryKey}`]
    $goto($url(), query)
    filterLabel = ''
    active = false
  }
</script>

<th>
  <Menu closeOnClick={false} on:open={handleOpen} bind:active>
    <span slot="activator" class="clickable">
      {field.label}
      <span class="text-caption" style="white-space: pre;">
        {filterLabel}
      </span>
    </span>

    {#if filterLabel}
      <ListItem on:click={handleClear} dense>
        <span slot="prepend">
          <IconLink icon={faTimes} />
        </span>
        Pas de filtre
      </ListItem>
    {/if}

    {#if field.selectOption}
      <MagicSelect
        flatMode
        bind:inputElement
        on:select={({ detail }) => handleSelect(detail)}
        selectKey="exact_{field.queryKey}"
        {...field.selectOption}
      />
    {/if}
  </Menu>
</th>
