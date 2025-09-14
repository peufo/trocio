<script lang="ts">
  import { onMount } from "svelte";
  import { Menu, ListItem } from "$lib/material";
  import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";

  import type { FieldInteface } from "$lib/types/magic";
  import SearchTextField from "$lib/util/SearchTextField.svelte";
  import IconLink from "$lib/util/IconLink.svelte";
  import { param, urlParam } from "$lib/param";
  import { goto } from "$app/navigation";

  export let field: Partial<FieldInteface>;
  let search = "";
  let queryKey =
    !field.key || field.key === "string"
      ? `or_search_${field.key}`
      : `user_search_${field.key}`;

  onMount(() => {
    search = $param.get(queryKey) || "";
  });

  function handleSearchEvent(event: CustomEvent<string>) {
    handleSearch(event.detail);
  }

  function handleSearch(value: string) {
    search = value;
    if (!search) {
      goto($urlParam.without(queryKey));
      return;
    }
    goto($urlParam.with({ [queryKey]: search }));
  }
</script>

<th>
  <Menu closeOnClick={false} style="width: 220px;">
    <span slot="activator" class="clickable">
      {field.label}
      {#if search}
        <span class="text-caption" style="white-space: pre;">
          <IconLink icon={faSearch} size="1em" />
          {search}
        </span>
      {/if}
    </span>

    <SearchTextField on:search={handleSearchEvent} clearable={false} />

    {#if search}
      <ListItem on:click={() => handleSearch("")} dense>
        <span slot="prepend">
          <IconLink icon={faTimes} />
        </span>
        Pas de recherche
      </ListItem>
    {/if}
  </Menu>
</th>
