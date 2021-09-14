<script lang="ts">
  import { params, goto, url } from '@roxi/routify'
  import { List, ListItem, Menu } from 'svelte-materialify'

  import IconLink from '$lib/util/IconLink.svelte'

  import type { FieldInteface, SelectOption } from 'types'

  export let field: Partial<FieldInteface>

  function handleClick(option: SelectOption) {
    if (!field.queryKey) return
    const key = `${field.typeMenu}_${field.queryKey}`
    const query = $params
    query[key] = option.queryValue
    if (!option.queryValue) delete query[key]
    $goto($url(), query)
  }
</script>

<!--
    TODO: regler la question des z-index
-->

<th style="z-index: 5;">
  <Menu hover>
    <span slot="activator">
      {field.label}
    </span>
    <List dense>
      {#if field.selectOptions}
        {#each field.selectOptions || [] as option}
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
