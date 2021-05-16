<script lang="ts">
  import { slide } from 'svelte/transition'
  import { Card, CardTitle } from 'svelte-materialify'
  import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
  import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'

  export let icon: IconDefinition | null = null
  export let title = 'Title'
  export let open = false

  import IconLink from '$lib/util/IconLink.svelte'

  function handleClickChevron(event) {
    event.stopPropagation()
    open = !open
  }
</script>

<Card outlined hover={!open}>
  <div on:click={() => (open = true)}>
    <CardTitle>
      {#if icon}
        <IconLink {icon} />
        &nbsp;&nbsp;
      {/if}
      {title}
      <div style="flex-grow: 1;" />
      <IconLink
        icon={faChevronDown}
        clickable
        rotate={open ? 0 : -90}
        style="opacity: .6;"
        on:click={handleClickChevron}
      />
    </CardTitle>
    {#if open}
      <div transition:slide|local>
        <slot />
      </div>
    {/if}
  </div>
</Card>
