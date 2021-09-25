<script lang="ts">
  import { onMount } from 'svelte'
  import { params, goto, url } from '@roxi/routify'
  import { List, ListItem, Menu, Divider, TextField } from 'svelte-materialify'
  import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
  import {
    faBars,
    faFilter,
    faSortAmountDown,
    faSortAmountDownAlt,
    faTimes,
  } from '@fortawesome/free-solid-svg-icons'

  import type { FieldInteface, EnumOption } from 'types'
  import IconLink from '$lib/util/IconLink.svelte'

  export let field: Partial<FieldInteface>
  export let active = false
  export let min = ''
  export let max = ''
  /** placement of menu*/
  export let isLast = false

  /** Actif query visibility */
  export let filterLabel = ''
  export let sortIcon: IconDefinition | undefined

  const sortOptions: EnumOption[] = [
    {
      icon: faBars,
      label: 'Non trié',
      queryValue: '',
    },
    {
      icon: faSortAmountDownAlt,
      label: field.format === 'date' ? `Plus vieux d'abord` : `Croissant`,
      queryValue: 1,
    },
    {
      icon: faSortAmountDown,
      label: field.format === 'date' ? `Plus récent d'abord` : `Décroissant`,
      queryValue: -1,
    },
  ]

  onMount(() => {
    const sortValue = Number($params[`sort_${field.queryKey}`])
    min = $params[`min_${field.queryKey}`] || ''
    max = $params[`max_${field.queryKey}`] || ''
    if (sortValue) {
      sortIcon = sortOptions.find((opt) => opt.queryValue === sortValue)?.icon
    }
    if (!min && !max) filterLabel = ''
    else filterLabel = `${min} - ${max}`
  })

  function handleClickSort(option: EnumOption) {
    active = false
    if (!field.queryKey) return
    const query = $params
    const keySort = `sort_${field.queryKey}`
    query[keySort] = option.queryValue
    if (!option.queryValue) {
      delete query[keySort]
      sortIcon = undefined
    } else {
      sortIcon = option.icon
    }
    $goto($url(), query)
  }

  function handleChangeFilter() {
    if (!field.queryKey) return
    const query = $params
    const keyMin = `min_${field.queryKey}`
    const keyMax = `max_${field.queryKey}`
    query[keyMin] = min
    query[keyMax] = max
    if (!min) delete query[keyMin]
    if (!max) delete query[keyMax]
    if (!min && !max) filterLabel = ''
    else filterLabel = `${min} - ${max}`
    $goto($url(), query)
  }

  function handleChangeMin() {
    if (min && max && +min > +max) max = `${+min}`
    handleChangeFilter()
  }
  function handleChangeMinDate() {
    const start = new Date(min).getTime()
    const end = new Date(max).getTime()
    if (start && end && start > end)
      max = new Date(start + 1000 * 60 * 10).toISOString().slice(0, -5)
    handleChangeFilter()
  }

  function handleChangeMax() {
    if (min && max && +min > +max) min = `${+max}`
    handleChangeFilter()
  }
  function handleChangeMaxDate() {
    const start = new Date(min).getTime()
    const end = new Date(max).getTime()
    if (start && end && start > end)
      min = new Date(end - 1000 * 60 * 10).toISOString().slice(0, -5)
    handleChangeFilter()
  }

  function handleClearFilter() {
    min = max = ''
    handleChangeFilter()
  }
</script>

<th>
  <Menu hover right={isLast} closeOnClick={false} bind:active>
    <span slot="activator">
      {field.label}

      {#if sortIcon}
        <IconLink icon={sortIcon} size="1em" />
      {/if}

      {#if filterLabel}
        <span class="text-caption">
          <IconLink icon={faFilter} size="1em" />
          {filterLabel}
        </span>
      {/if}
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

      {#if field.format == 'currency'}
        <TextField
          class="ma-4"
          bind:value={min}
          type="number"
          min={0}
          step={5}
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
          min={0}
          step={5}
          on:change={handleChangeMax}
        >
          <span slot="prepend">
            <IconLink icon={faFilter} size="20px" />
          </span>
          Maximum
        </TextField>
      {:else if field.format === 'date'}
        <TextField
          class="ma-4"
          bind:value={min}
          type="datetime-local"
          placeholder=" "
          min={0}
          step={5}
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
          min={0}
          step={5}
          on:change={handleChangeMaxDate}
          on:input={handleChangeMaxDate}
        >
          <span slot="prepend">
            <IconLink icon={faFilter} size="20px" />
          </span>
          Fin
        </TextField>
      {:else}
        Invalid format
      {/if}
      {#if min || max}
        <ListItem on:click={handleClearFilter}>
          <span slot="prepend">
            <IconLink icon={faTimes} />
          </span>
          Pas de filtre
        </ListItem>
      {/if}
    </List>
  </Menu>
</th>
