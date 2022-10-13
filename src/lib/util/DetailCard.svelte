<script lang="ts">
  /**
   * Carte avec entête syntétique
   * Peux se déployer pour révéler des détails
   */
  import { createEventDispatcher } from 'svelte'
  import { slide } from 'svelte/transition'
  import { Card, Button, Icon } from '$material'
  import { mdiChevronRight } from '@mdi/js'

  import { renderAmount } from '$lib/utils'

  export let count = 0
  export let title = ''
  export let sum = 0
  export let currency: string | undefined = undefined

  export let open = false

  let dispatch = createEventDispatcher()

  function handleOpen() {
    open = true
    dispatch('open')
  }

  function handleToggle() {
    open = !open
    if (open) dispatch('open')
    else dispatch('close')
  }
</script>

<Card outlined hover={!open}>
  <div
    on:click={handleOpen}
    class="pa-3 d-flex align-center {open ? '' : 'clickable'}"
  >
    <div on:click|stopPropagation>
      <Button on:click={handleToggle} text fab size="small" class="mr-3">
        <Icon path={mdiChevronRight} rotate={open ? 90 : 0} />
      </Button>
    </div>
    <h6>
      {count}
      {title}
    </h6>
    <div class="flex-grow-1 ml-4">
      <slot name="head" />
    </div>
    <div>
      {renderAmount(sum, currency)}
    </div>
  </div>

  {#if open}
    <div transition:slide|local>
      <slot />
    </div>
  {/if}
</Card>
