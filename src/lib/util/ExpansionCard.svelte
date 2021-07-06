<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { slide } from 'svelte/transition'
  import { Card, CardTitle, CardSubtitle, TextField } from 'svelte-materialify'
  import { faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons'

  import IconLink from '$lib/util/IconLink.svelte'

  export let title = 'Title'
  export let subtitle = ''
  /**
   * Si controlled === true,
   * open est controllé par le composant parent grâce aux évenements on:open et on:close
   */
  export let controlled = false
  export let open = false

  export let titleEditable = false

  export let searchValue = ''
  export let hasSearchInput = false
  export let inputElement: HTMLInputElement = null
  let isSearchActive = false

  const dispath = createEventDispatcher()

  function handleOpen(event) {
    if (!open) dispath('open')
    if (!controlled) open = true
  }

  function handleClose(event) {
    event.stopPropagation()
    if (!open) return handleOpen(event)
    if (!controlled) open = false
    dispath('close')
  }

  function handleClickSearch() {
    isSearchActive = true
    inputElement.focus()
  }

  function handleBlur(event) {
    if (event.target.value === '') isSearchActive = false
  }

  function handleTitleInput(event: any) {
    if (!titleEditable) return
    const { target } = event
    dispath('inputTitle', target.innerText)
  }
</script>

<Card outlined hover={!open}>
  <div on:click={handleOpen}>
    <CardTitle>
      <slot name="icon" />

      <span
        class="text-uppercase"
        contenteditable={titleEditable}
        style={titleEditable ? 'min-width: 100px;' : ''}
        on:input={handleTitleInput}
      >
        {title}
      </span>

      <div style="flex-grow: 1;" />

      {#if hasSearchInput}
        <div
          class="mr-5"
          on:click={handleClickSearch}
          class:clickable={!isSearchActive}
        >
          <TextField
            placeholder="Recherche"
            clearable
            solo
            dense
            flat={!isSearchActive}
            bind:inputElement
            bind:value={searchValue}
            on:change
            on:input
            on:blur={handleBlur}
            style="
              transition: width 300ms;
              width: {isSearchActive ? '240px' : '45px'};
            "
          >
            <div slot="prepend">
              <IconLink icon={faSearch} size="1.1em" />
            </div>
          </TextField>
        </div>
      {/if}
      <IconLink
        icon={faChevronDown}
        clickable
        rotate={open ? 0 : -90}
        opacity
        on:click={handleClose}
      />
    </CardTitle>

    {#if subtitle}
      <CardSubtitle>{subtitle}</CardSubtitle>
    {/if}

    {#if open}
      <div transition:slide|local>
        <div class="pa-4">
          <slot />
        </div>
      </div>
    {/if}
  </div>
</Card>
