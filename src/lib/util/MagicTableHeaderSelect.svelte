<script lang="ts">
  import { onMount } from 'svelte'
  import { params, goto, url } from '@roxi/routify'
  import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
  import { mdiClose } from '@mdi/js'

  import { List, ListItem, Menu, Chip, Icon } from '$material'
  import IconLink from '$lib/util/IconLink.svelte'
  import type { FieldInteface, Option } from 'types/magic'

  export let field: Partial<FieldInteface>
  export let queryParam: { [key: string]: any } = {}

  const key = `exact_${field.key}`
  let queryLabel = ''

  onMount(() => {
    // Charge le queryLabel
    let queryValue = $params[key]
    if (queryValue) {
      if (queryValue === 'true') queryValue = true
      if (queryValue === 'false') queryValue = false
      queryParam[key] = queryValue
      queryLabel =
        field.options?.find((opt) => opt.value === queryValue)?.label || ''
    }
  })

  function handleClick(option: Option) {
    if (!field.key) return

    const query = $params
    query[key] = option.value
    if (option.value === null) {
      delete query[key]
      queryLabel = ''
      queryParam = {}
    } else {
      queryLabel = option.label
      queryParam[key] = option.value
    }
    $goto($url(), query)
  }

  function clearSelection(event: CustomEvent<PointerEvent>) {
    event.detail.stopPropagation()
    handleClick({
      value: null,
      label: '',
    })
  }

  const booleanOptions = [
    { value: null, label: 'Tous' },
    {
      value: true,
      label: 'Oui',
      icon: faCheck,
      iconStyle: 'color: green;',
    },
    { value: false, label: 'Non', icon: faTimes, iconStyle: 'color: red;' },
  ]

  $: options = field.type === 'boolean' ? booleanOptions : field.options
</script>

<th>
  <Menu>
    <span slot="activator" class="clickable">
      {field.label}
      <Chip
        active={!!queryLabel}
        size="x-small"
        class="clickable"
        close
        on:close={clearSelection}
      >
        {queryLabel}
        <span slot="close-icon">
          <Icon path={mdiClose} size="0.7em" />
        </span>
      </Chip>
      <span class="text-caption" style="white-space: pre;" />
    </span>
    <List dense>
      {#each options || [] as option}
        <ListItem on:click={() => handleClick(option)}>
          <div slot="prepend">
            {#if option.icon}
              <IconLink
                icon={option.icon}
                style={option.iconStyle}
                size="1.1em"
                class="mr-2"
              />
            {/if}
          </div>
          {option.label}
        </ListItem>
      {:else}
        <ListItem>No option</ListItem>
      {/each}
    </List>
  </Menu>
</th>
