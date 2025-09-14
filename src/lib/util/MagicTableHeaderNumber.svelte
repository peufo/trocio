<script lang="ts">
  import { onMount } from "svelte";
  import {
    List,
    ListItem,
    Menu,
    Divider,
    TextField,
    Chip,
    Icon,
  } from "$lib/material";
  import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
  import {
    faBars,
    faFilter,
    faSortAmountDown,
    faSortAmountDownAlt,
    faTimes,
  } from "@fortawesome/free-solid-svg-icons";

  import type { FieldInteface, Option } from "$lib/types/magic";
  import IconLink from "$lib/util/IconLink.svelte";
  import { mdiClose } from "@mdi/js";
  import { param, urlParam } from "$lib/param";
  import { goto } from "$app/navigation";

  export let field: FieldInteface;
  export let active = false;
  export let min = "";
  export let max = "";
  /** placement of menu*/
  export let isLast = false;
  export let queryParam: { [key: string]: any } = {};

  /** Actif query visibility */
  export let filterLabel = "";
  export let sortIcon: IconDefinition | undefined;

  let keySort = `sort_${field.key}`;
  let keyMin = `min_${field.key}`;
  let keyMax = `max_${field.key}`;

  const sortOptions: Option[] = [
    {
      icon: faBars,
      label: "Non trié",
      value: "",
    },
    {
      icon: faSortAmountDownAlt,
      label: field.type === "date" ? `Plus vieux d'abord` : `Croissant`,
      value: 1,
    },
    {
      icon: faSortAmountDown,
      label: field.type === "date" ? `Plus récent d'abord` : `Décroissant`,
      value: -1,
    },
  ];

  onMount(() => {
    const sortValue = Number($param.get(keySort));
    min = $param.get(keyMin) || "";
    max = $param.get(keyMax) || "";
    if (sortValue) {
      sortIcon = sortOptions.find((opt) => opt.value === sortValue)?.icon;
      queryParam[keySort] = sortValue;
    }
    if (min) queryParam[keyMin] = min;
    if (max) queryParam[keyMax] = max;
    if (!min && !max) filterLabel = "";
    else filterLabel = `${min} - ${max}`;
  });

  function handleClickSort(option: Option) {
    active = false;
    if (!field.key) return;
    if (!option.value) {
      sortIcon = undefined;
      delete queryParam[keySort];
      goto($urlParam.without(keySort));
      return;
    }
    sortIcon = option.icon;
    queryParam[keySort] = option.value;
    goto($urlParam.with({ [keySort]: option.value }));
  }

  function handleChangeFilter() {
    if (!field.key) return;

    queryParam[keyMin] = min;
    queryParam[keyMax] = max;
    if (!min) delete queryParam[keyMin];
    if (!max) delete queryParam[keyMax];

    if (!min && !max) filterLabel = "";
    else filterLabel = `${min} - ${max}`;

    goto(
      $urlParam.with(
        { [keyMin]: min, [keyMax]: max },
        ...([!min && keyMin, !max && keyMax].filter(Boolean) as string[])
      )
    );
  }

  function handleChangeMin() {
    if (min && max && +min > +max) max = `${+min}`;
    handleChangeFilter();
  }
  function handleChangeMinDate() {
    const start = new Date(min).getTime();
    const end = new Date(max).getTime();
    if (start && end && start > end)
      max = new Date(start + 1000 * 60 * 10).toISOString().slice(0, -5);
    handleChangeFilter();
  }

  function handleChangeMax() {
    if (min && max && +min > +max) min = `${+max}`;
    handleChangeFilter();
  }
  function handleChangeMaxDate() {
    const start = new Date(min).getTime();
    const end = new Date(max).getTime();
    if (start && end && start > end)
      min = new Date(end - 1000 * 60 * 10).toISOString().slice(0, -5);
    handleChangeFilter();
  }

  function handleClearFilter(event?: CustomEvent<PointerEvent>) {
    if (event) event.detail.stopPropagation();
    min = "";
    max = "";
    handleChangeFilter();
  }
</script>

<th>
  <Menu right={isLast} closeOnClick={false} bind:active>
    <span slot="activator" class="clickable">
      {field.label}

      {#if sortIcon}
        <IconLink icon={sortIcon} size="1em" />
      {/if}

      <Chip
        active={!!filterLabel}
        size="x-small"
        class="clickable"
        close
        on:close={handleClearFilter}
      >
        <span>{filterLabel}</span>
        <span slot="close-icon">
          <Icon path={mdiClose} size="0.7em" />
        </span>
      </Chip>
    </span>
    <List dense>
      {#each sortOptions as option}
        <ListItem on:click={() => handleClickSort(option)}>
          <div slot="prepend">
            {#if option.icon}
              <IconLink icon={option.icon} style={option.iconStyle} />
            {/if}
          </div>
          {option.label}
        </ListItem>
      {/each}

      <Divider />

      {#if field.type == "number" || field.type == "currency"}
        <TextField
          class="ma-4"
          bind:value={min}
          type="number"
          min="0"
          step="5"
          on:change={handleChangeMin}
        >
          <span slot="prepend">
            <IconLink icon={faFilter} size="20px" />
          </span>
          Minimum
        </TextField>
        <TextField
          class="ma-4"
          bind:value={max}
          type="number"
          min="0"
          step="5"
          on:change={handleChangeMax}
        >
          <span slot="prepend">
            <IconLink icon={faFilter} size="20px" />
          </span>
          Maximum
        </TextField>
      {:else if field.type === "date"}
        <TextField
          class="ma-4"
          bind:value={min}
          type="datetime-local"
          placeholder=" "
          min="0"
          step="5"
          on:change={handleChangeMinDate}
          on:input={handleChangeMinDate}
        >
          <span slot="prepend">
            <IconLink icon={faFilter} size="20px" />
          </span>
          Début
        </TextField>
        <TextField
          class="ma-4"
          bind:value={max}
          type="datetime-local"
          placeholder=" "
          min="0"
          step="5"
          on:change={handleChangeMaxDate}
          on:input={handleChangeMaxDate}
        >
          <span slot="prepend">
            <IconLink icon={faFilter} size="20px" />
          </span>
          Fin
        </TextField>
      {:else}
        TODO 🥱
      {/if}
      {#if min || max}
        <ListItem on:click={() => handleClearFilter()}>
          <span slot="prepend">
            <IconLink icon={faTimes} />
          </span>
          Pas de filtre
        </ListItem>
      {/if}
    </List>
  </Menu>
</th>
