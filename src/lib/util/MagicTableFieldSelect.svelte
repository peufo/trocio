<script lang="ts">
  import { params, goto, url } from '@roxi/routify'

  import { onMount } from 'svelte'
  import { isMobile } from '$lib/store/layout'
  import { Button, Menu, List, ListItem, Checkbox } from '$material'
  import type { FieldInteface } from 'types'

  export let fields: Partial<FieldInteface>[]
  export let style = ''

  onMount(() => {
    // show fields if query exist in url
    const queryKeyRegexps = fields.map(
      ({ queryKey }) => new RegExp(`${queryKey}$`)
    )
    for (const queryKey in $params) {
      queryKeyRegexps.forEach((regex, index) => {
        if (queryKey.match(regex)) fields[index].hidden = false
      })
    }
  })

  function handleClick(index: number) {
    const field = fields[index]
    fields[index].hidden = !field.hidden

    // Disable filters and sort if field is hidden
    if (field.hidden) {
      const query = $params
      const regexp = new RegExp(`${field.queryKey}$`)
      for (const queryKey in query) {
        if (queryKey.match(regexp)) delete query[queryKey]
      }
      $goto($url(), query)
    }
  }
</script>

<Menu closeOnClick={$isMobile} right style="max-height: none; {style}">
  <div slot="activator">
    <Button depressed>Champs visibles</Button>
  </div>
  <List dense>
    {#each fields as field, index}
      <ListItem disabled={field.disabled} on:click={() => handleClick(index)}>
        <span slot="prepend">
          <Checkbox
            style="margin-right: 0px;"
            disabled={field.disabled}
            checked={!field.hidden}
          />
        </span>
        {field.label}
      </ListItem>
    {/each}
  </List>
</Menu>
