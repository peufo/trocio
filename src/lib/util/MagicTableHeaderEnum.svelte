<script lang="ts">
  import { onMount } from 'svelte'
  import { params, goto, url } from '@roxi/routify'
  import { List, ListItem, Menu, Chip, Icon } from 'svelte-materialify'

  import IconLink from '$lib/util/IconLink.svelte'

  import type { FieldInteface, EnumOption } from 'types'
  import { mdiClose } from '@mdi/js'

  export let field: Partial<FieldInteface>
  export let queryParam: { [key: string]: any } = {}

  const key = `exact_${field.queryKey}`
  let queryLabel = ''

  onMount(() => {
    // Charge le queryLabel
    let queryValue = $params[key]
    if (queryValue) {
      if (queryValue === 'true') queryValue = true
      if (queryValue === 'false') queryValue = false
      queryParam[key] = queryValue
      queryLabel =
        field.enumOptions?.find((opt) => opt.key === queryValue)?.label || ''
    }
  })

  function handleClick(option: EnumOption) {
    if (!field.queryKey) return
    // const key = `exact_${field.queryKey}`
    const query = $params
    query[key] = option.key
    if (option.key === null) {
      delete query[key]
      queryLabel = ''
      queryParam = {}
    } else {
      queryLabel = option.label
      queryParam[key] = option.key
    }
    $goto($url(), query)
  }

  function clearSelection(event: CustomEvent<PointerEvent>) {
    event.detail.stopPropagation()
    handleClick({
      key: null,
      label: '',
    })
  }
</script>

<th>
  <Menu>
    <span slot="activator" class="clickable">
      {field.label}
      <Chip
        active={!!queryLabel}
        size="x-small"
        class="clickable"
        close
        on:close={clearSelection}
      >
        {queryLabel}
        <span slot="close-icon">
          <Icon path={mdiClose} size="0.7em" />
        </span>
      </Chip>
      <span class="text-caption" style="white-space: pre;" />
    </span>
    <List dense>
      {#if field.enumOptions}
        {#each field.enumOptions || [] as option}
          <ListItem on:click={() => handleClick(option)}>
            <div slot="prepend">
              {#if option.icon}
                <IconLink
                  icon={option.icon}
                  style={option.iconStyle}
                  size="1.1em"
                  class="mr-2"
                />
              {/if}
            </div>
            {option.label}
          </ListItem>
        {/each}
      {:else}
        <ListItem>No option</ListItem>
      {/if}
    </List>
  </Menu>
</th>
