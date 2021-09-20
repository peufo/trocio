<script lang="ts">
  import { onMount } from 'svelte'
  import { params, goto, url } from '@roxi/routify'
  import { List, ListItem, Menu } from 'svelte-materialify'

  import IconLink from '$lib/util/IconLink.svelte'

  import type { FieldInteface, EnumOption } from 'types'

  export let field: Partial<FieldInteface>

  let queryLabel = ''

  onMount(() => {
    // Charge le queryLabel
    const queryValue = $params[`exact_${field.queryKey}`]
    if (queryValue) {
      queryLabel =
        field.enumOptions?.find((opt) => opt.queryValue === queryValue)
          ?.label || ''
    }
  })

  function handleClick(option: EnumOption) {
    if (!field.queryKey) return
    const key = `exact_${field.queryKey}`
    const query = $params
    query[key] = option.queryValue
    if (!option.queryValue) {
      delete query[key]
      queryLabel = ''
    } else {
      queryLabel = option.label
    }
    $goto($url(), query)
  }
</script>

<th>
  <Menu hover>
    <span slot="activator">
      {field.label}
      <span class="text-caption">{queryLabel}</span>
    </span>
    <List dense>
      {#if field.enumOptions}
        {#each field.enumOptions || [] as option}
          <ListItem on:click={() => handleClick(option)}>
            <div slot="prepend">
              {#if option.icon}
                <IconLink icon={option.icon} style={option.iconStyle} />
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
