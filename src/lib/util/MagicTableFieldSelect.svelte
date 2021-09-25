<script lang="ts">
  import { params, goto, url } from '@roxi/routify'
  import { onMount } from 'svelte'
  import { Button, Menu, List, ListItem, Checkbox } from 'svelte-materialify'
  import type { FieldInteface } from 'types'

  export let fields: Partial<FieldInteface>[]

  onMount(() => {
    // show fields if query exist in url
    const queryKeyRegexps = fields.map(
      ({ queryKey }) => new RegExp(`${queryKey}$`)
    )
    for (const queryKey in $params) {
      queryKeyRegexps.forEach((regex, index) => {
        if (queryKey.match(regex)) fields[index].visible = true
      })
    }
  })

  function handleClick(index: number) {
    const field = fields[index]
    fields[index].visible = !field.visible

    // Disable filters and sort if field is hidden
    if (!field.visible) {
      const query = $params
      const regexp = new RegExp(`${field.queryKey}$`)
      for (const queryKey in query) {
        if (queryKey.match(regexp)) delete query[queryKey]
      }
      $goto($url(), query)
    }
  }
</script>

<Menu closeOnClick={false} hover style="max-height: none;">
  <div slot="activator">
    <Button depressed>Choisir les champs visibles</Button>
  </div>
  <List>
    {#each fields as field, index}
      <ListItem disabled={field.disabled} on:click={() => handleClick(index)}>
        <span slot="prepend">
          <Checkbox
            style="margin-right: 0px;"
            disabled={field.disabled}
            checked={field.visible}
          />
        </span>
        {field.label}
      </ListItem>
    {/each}
  </List>
</Menu>
