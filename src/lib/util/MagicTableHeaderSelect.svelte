<script lang="ts">
  import { onMount } from 'svelte'
  import { Chip, Icon, Menu } from '$material'
  import { goto, params, url } from '@roxi/routify'

  import MagicSelect from '$lib/util/MagicSelect.svelte'
  import type { FieldInteface } from 'types'
  import { mdiClose } from '@mdi/js'

  export let field: Partial<FieldInteface>
  export let queryParam: { [key: string]: any } = {}

  let key = `exact_${field.key}`
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

  function handleClear(event: CustomEvent<PointerEvent>) {
    event.detail.stopPropagation()
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

      <Chip
        active={!!filterLabel}
        size="x-small"
        class="clickable"
        close
        on:close={handleClear}
      >
        <span>{filterLabel}</span>
        <span slot="close-icon">
          <Icon path={mdiClose} size="0.7em" />
        </span>
      </Chip>
    </span>

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
