<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { slide } from 'svelte/transition'
  import { Card, CardTitle } from 'svelte-materialify'
  import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

  export let title = 'Title'
  /**
   * Si controlled === true,
   * open est controllé par le composant parent grâce aux évenements on:open et on:close
   */
  export let controlled = false
  export let open = false

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
    <CardTitle class="text-uppercase">
      <slot name="icon" />
      &nbsp;&nbsp;
      {title}
      <div style="flex-grow: 1;" />
      <IconLink
        icon={faChevronDown}
        clickable
        rotate={open ? 0 : -90}
        style="opacity: .6;"
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
