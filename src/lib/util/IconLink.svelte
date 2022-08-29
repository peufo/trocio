<script lang="ts">
  import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
  import { Button, Tooltip, Icon } from 'svelte-materialify'

  let klass = ''
  export { klass as class }
  export let tip = ''
  export let href = ''
  export let clickable = false
  export let icon: IconDefinition
  export let size = '24px'
  export let rotate = 0
  export let spin = false
  export let disabled = false
  export let opacity = false
  export let style = ''
  export let target = '_self'
  export let title = ''

  $: style = opacity
    ? style + 'opacity: 0.5;'
    : style.replace('opacity: 0.5;', '')
</script>

{#if !!tip}
  {#if !!href}
    <Tooltip bottom>
      <span slot="tip" {title}>{tip}</span>
      <a {href} {target} {title}>
        <Button icon on:click>
          <Icon
            path={icon.icon[4]}
            viewWidth={icon.icon[0]}
            viewHeight={icon.icon[1]}
            {size}
            {rotate}
            {spin}
            {disabled}
            {style}
            class={klass}
            {...$$restProps}
          />
        </Button>
      </a>
    </Tooltip>
  {:else}
    <Tooltip bottom>
      <span slot="tip" {title}>{tip}</span>
      <Button icon on:click>
        <Icon
          path={icon.icon[4]}
          viewWidth={icon.icon[0]}
          viewHeight={icon.icon[1]}
          {size}
          {rotate}
          {spin}
          {disabled}
          {style}
          class={klass}
          {...$$restProps}
        />
      </Button>
    </Tooltip>
  {/if}
{:else if !!href}
  <a {href} {target} {title}>
    <Button icon on:click>
      <Icon
        path={icon.icon[4]}
        viewWidth={icon.icon[0]}
        viewHeight={icon.icon[1]}
        {size}
        {rotate}
        {spin}
        {disabled}
        {style}
        class={klass}
        {...$$restProps}
      />
    </Button>
  </a>
{:else if clickable}
  <Button icon on:click>
    <Icon
      path={icon.icon[4]}
      viewWidth={icon.icon[0]}
      viewHeight={icon.icon[1]}
      {size}
      {rotate}
      {spin}
      {disabled}
      {style}
      class={klass}
      {...$$restProps}
    />
  </Button>
{:else}
  <Icon
    path={icon.icon[4]}
    viewWidth={icon.icon[0]}
    viewHeight={icon.icon[1]}
    {size}
    {rotate}
    {spin}
    {disabled}
    {style}
    class={klass}
    {...$$restProps}
  />
{/if}
