<script lang="ts">
  import { onMount } from "svelte";
  import { Chip, Icon, Menu } from "$lib/material";

  import MagicSelect from "$lib/util/MagicSelect.svelte";
  import type { FieldInteface } from "$lib/types/magic";
  import { mdiClose } from "@mdi/js";
  import { param } from "$lib/param";
  import { goto } from "$app/navigation";

  export let field: Partial<FieldInteface>;
  export let queryParam: { [key: string]: any } = {};

  let key = `exact_${field.key}`;
  let inputElement: HTMLInputElement;
  let active = false;
  let filterLabel = "";

  onMount(() => {
    // Très chiant des récupérer un label à partir d'un id ...
    const queryValue = $param.get(key);
    if (queryValue) {
      filterLabel = "Filtre actif";
      queryParam[key] = queryValue;
    }
  });

  function handleOpen() {
    // Place directement le curseur dans la recherche
    setTimeout(() => {
      inputElement.focus();
    }, 200);
  }

  function handleSelect(item: any) {
    queryParam[key] = field.selectAsync?.getKey
      ? field.selectAsync?.getKey(item)
      : undefined;
    filterLabel = field.selectAsync?.getValue
      ? field.selectAsync?.getValue(item)
      : item["name"];
    active = false;
  }

  function handleClear(event: CustomEvent<PointerEvent>) {
    event.detail.stopPropagation();
    queryParam = {};
    filterLabel = "";
    active = false;
    goto($param.without(key));
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

    {#if field.selectAsync}
      <MagicSelect
        flatMode
        bind:inputElement
        on:select={({ detail }) => handleSelect(detail)}
        selectKey={key}
        {...field.selectAsync}
      />
    {/if}
  </Menu>
</th>
