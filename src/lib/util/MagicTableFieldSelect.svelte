<script lang="ts">
  import { onMount } from "svelte";
  import { isMobile } from "$lib/store/layout";
  import { Button, Menu, List, ListItem, Checkbox } from "$lib/material";
  import type { FieldInteface } from "$lib/types/magic";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { urlParam } from "$lib/param";

  export let fields: Partial<FieldInteface>[];
  export let style = "";
  export let searchColSpan = 0;

  onMount(() => {
    // show fields if query exist in url
    const queryKeyRegexps = fields.map(({ key }) => new RegExp(`${key}$`));

    for (const queryKey of page.url.searchParams.keys()) {
      queryKeyRegexps.forEach((regex, index) => {
        if (queryKey.match(regex)) fields[index].hidden = false;
      });
    }
  });

  function handleClick(index: number) {
    const field = fields[index];
    fields[index].hidden = !field.hidden;

    // Disable filters and sort if field is hidden
    if (field.hidden) {
      const keysToRemove: string[] = [];
      const regexp = new RegExp(`${field.key}$`);
      for (const queryKey of page.url.searchParams.keys()) {
        if (queryKey.match(regexp)) keysToRemove.push(queryKey);
      }
      goto($urlParam.without(...keysToRemove));
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
            disabled={field.disabled || index < searchColSpan}
            checked={!field.hidden}
          />
        </span>
        {field.label}
      </ListItem>
    {/each}
  </List>
</Menu>
