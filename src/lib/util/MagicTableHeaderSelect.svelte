<script lang="ts">
  import { onMount } from 'svelte'
  import { ListItem, Menu } from 'svelte-materialify'
  import { goto, params, url } from '@roxi/routify'
  import { faTimes } from '@fortawesome/free-solid-svg-icons'

  import MagicSelect from '$lib/util/MagicSelect.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import type { FieldInteface } from 'types'

  export let field: Partial<FieldInteface>
  export let queryParam: { [key: string]: any } = {}

  let key = `exact_${field.queryKey}`
  let inputElement: HTMLInputElement
  let active = false
  let filterLabel = ''

  onMount(() => {
    // Très chiant des récupérer un label à partir d'un id ...
    const queryValue = $params[key]
    if (queryValue) {
      filterLabel = 'Filtre actif'
      queryParam[key] = queryValue
    }
  })

  function handleOpen() {
    // Place directement le curseur dans la recherche
    setTimeout(() => {
      inputElement.focus()
    }, 200)
  }

  function handleSelect(item: any) {
    queryParam[key] = field.selectOption?.getKey
      ? field.selectOption?.getKey(item)
      : undefined
    filterLabel = field.selectOption?.getValue
      ? field.selectOption?.getValue(item)
      : item['name']
    active = false
  }

  function handleClear() {
    const query = $params
    delete query[key]
    $goto($url(), query)
    queryParam = {}
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
        selectKey={key}
        {...field.selectOption}
      />
    {/if}
  </Menu>
</th>
