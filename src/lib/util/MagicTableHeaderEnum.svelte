<script lang="ts">
  import { onMount } from 'svelte'
  import { params, goto, url } from '@roxi/routify'
  import { List, ListItem, Menu } from 'svelte-materialify'

  import IconLink from '$lib/util/IconLink.svelte'

  import type { FieldInteface, EnumOption } from 'types'

  export let field: Partial<FieldInteface>
  export let queryParam: { [key: string]: any } = {}

  const key = `exact_${field.queryKey}`
  let queryLabel = ''

  onMount(() => {
    // Charge le queryLabel
    const queryValue = $params[key]
    if (queryValue) {
      queryParam[key] = queryValue
      queryLabel =
        field.enumOptions?.find((opt) => opt.queryValue === queryValue)
          ?.label || ''
    }
  })

  function handleClick(option: EnumOption) {
    if (!field.queryKey) return
    // const key = `exact_${field.queryKey}`
    const query = $params
    query[key] = option.queryValue
    if (!option.queryValue) {
      delete query[key]
      queryLabel = ''
      queryParam = {}
    } else {
      queryLabel = option.label
      queryParam[key] = option.queryValue
    }
    $goto($url(), query)
  }
</script>

<th>
  <Menu>
    <span slot="activator" class="clickable">
      {field.label}
      <span class="text-caption" style="white-space: pre;">
        {queryLabel}
      </span>
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
