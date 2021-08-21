<script lang="ts">
  import {
    Button,
    Menu,
    List,
    ListItem,
    ListItemGroup,
    Checkbox,
  } from 'svelte-materialify'
  import type { FieldInteface } from 'types'

  export let fields: Partial<FieldInteface>[]

  let fieldsCheckeds = fields.filter((f) => f.checked).map((f) => f.label)
  $: fields = fields.map((field) => ({
    ...field,
    checked: fieldsCheckeds.includes(field.label),
  }))
</script>

<Menu closeOnClick={false} hover style="max-height: none;">
  <div slot="activator">
    <Button depressed>Choisir les champs visibles</Button>
  </div>
  <List>
    <ListItemGroup multiple bind:value={fieldsCheckeds} activeClass="">
      {#each fields as field}
        <ListItem value={field.label} disabled={field.disabled}>
          <span slot="prepend">
            <Checkbox
              style="margin-right: 0px;"
              checked={fieldsCheckeds.includes(field.label)}
              disabled={field.disabled}
            />
          </span>
          {field.label}
        </ListItem>
      {/each}
    </ListItemGroup>
  </List>
</Menu>
