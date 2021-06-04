<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { slide } from 'svelte/transition'
  import { Card, CardTitle, TextField } from 'svelte-materialify'
  import { faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons'

  export let title = 'Title'
  /**
   * Si controlled === true,
   * open est controllé par le composant parent grâce aux évenements on:open et on:close
   */
  export let controlled = false
  export let open = false
  export let searchValue = ''
  export let hasSearchInput = false

  import IconLink from '$lib/util/IconLink.svelte'

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
</script>

<Card outlined hover={!open}>
  <div on:click={handleOpen}>
    <CardTitle>
      <slot name="icon" />
      <span class="ml-3 text-uppercase">
        {title}
      </span>

      <div style="flex-grow: 1;" />

      {#if hasSearchInput}
        <div class="mr-5">
          <TextField clearable bind:value={searchValue} on:change on:input>
            <div slot="prepend">
              <IconLink icon={faSearch} size="1.1em" />
            </div>
            Recherche
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
    {#if open}
      <div transition:slide|local>
        <div class="pa-4">
          <slot />
        </div>
      </div>
    {/if}
  </div>
</Card>
