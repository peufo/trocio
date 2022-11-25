<script lang="ts">
  import { onMount } from 'svelte'
  import { params, goto, url } from '@roxi/routify'
  import {
    List,
    ListItem,
    Menu,
    Divider,
    TextField,
    Chip,
    Icon,
  } from '$material'
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
  import { mdiClose } from '@mdi/js'

  export let field: FieldInteface
  export let active = false
  export let min = ''
  export let max = ''
  /** placement of menu*/
  export let isLast = false
  export let queryParam: { [key: string]: any } = {}

  /** Actif query visibility */
  export let filterLabel = ''
  export let sortIcon: IconDefinition | undefined

  let keySort = `sort_${field.queryKey}`
  let keyMin = `min_${field.queryKey}`
  let keyMax = `max_${field.queryKey}`

  const sortOptions: EnumOption[] = [
    {
      icon: faBars,
      label: 'Non trié',
      key: '',
    },
    {
      icon: faSortAmountDownAlt,
      label: field.format === 'date' ? `Plus vieux d'abord` : `Croissant`,
      key: 1,
    },
    {
      icon: faSortAmountDown,
      label: field.format === 'date' ? `Plus récent d'abord` : `Décroissant`,
      key: -1,
    },
  ]

  onMount(() => {
    const sortValue = Number($params[keySort])
    min = $params[keyMin] || ''
    max = $params[keyMax] || ''
    if (sortValue) {
      sortIcon = sortOptions.find((opt) => opt.key === sortValue)?.icon
      queryParam[keySort] = sortValue
    }
    if (min) queryParam[keyMin] = min
    if (max) queryParam[keyMax] = max
    if (!min && !max) filterLabel = ''
    else filterLabel = `${min} - ${max}`
  })

  function handleClickSort(option: EnumOption) {
    active = false
    if (!field.queryKey) return
    const query = $params
    query[keySort] = option.key
    console.log({ queryParam })
    queryParam[keySort] = option.key
    if (!option.key) {
      delete query[keySort]
      delete queryParam[keySort]
      sortIcon = undefined
    } else {
      sortIcon = option.icon
    }
    $goto($url(), query)
  }

  function handleChangeFilter() {
    if (!field.queryKey) return
    const query = $params

    query[keyMin] = min
    query[keyMax] = max
    if (!min) delete query[keyMin]
    if (!max) delete query[keyMax]

    queryParam[keyMin] = min
    queryParam[keyMax] = max
    if (!min) delete queryParam[keyMin]
    if (!max) delete queryParam[keyMax]

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

  function handleClearFilter(event?: CustomEvent<PointerEvent>) {
    if (event) event.detail.stopPropagation()
    min = ''
    max = ''
    handleChangeFilter()
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

      {#if field.format == 'number' || field.format == 'currency'}
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
      {:else if field.format === 'date'}
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
