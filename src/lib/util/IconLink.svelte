<script lang="ts">
  import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
  import { Button, Tooltip, Icon } from 'svelte-materialify'

  export let tip = ''
  export let href = ''
  export let icon: IconDefinition
  export let size = '32px'
</script>

{#if !!tip}
  {#if !!href}
    <Tooltip bottom>
      <span slot="tip">{tip}</span>
      <a {href}>
        <Button icon>
          <Icon
            path={icon.icon[4]}
            viewWidth={icon.icon[0]}
            viewHeight={icon.icon[1]}
            {size}
          />
        </Button>
      </a>
    </Tooltip>
  {:else}
    <Tooltip bottom>
      <span slot="tip">{tip}</span>
      <Button icon>
        <Icon
          path={icon.icon[4]}
          viewWidth={icon.icon[0]}
          viewHeight={icon.icon[1]}
          {size}
        />
      </Button>
    </Tooltip>
  {/if}
{:else if !!href}
  <a {href}>
    <Button icon>
      <Icon
        path={icon.icon[4]}
        viewWidth={icon.icon[0]}
        viewHeight={icon.icon[1]}
        {size}
      />
    </Button>
  </a>
{:else}
  <Button icon>
    <Icon
      path={icon.icon[4]}
      viewWidth={icon.icon[0]}
      viewHeight={icon.icon[1]}
      {size}
    />
  </Button>
{/if}
