<script lang="ts">
  import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
  import { Button, Tooltip, Icon } from '$material'

  let klass = ''
  export { klass as class }
  export let buttonClass = ''
  export let tip = ''
  export let href = ''
  export let clickable = false
  export let icon: IconDefinition | string
  export let size = '24px'
  export let rotate = 0
  export let spin = false
  export let disabled = false
  export let opacity = false
  export let style = ''
  export let target = '_self'
  export let title = ''
  export let fab = false

  $: style = opacity
    ? style + 'opacity: 0.5;'
    : style.replace('opacity: 0.5;', '')

  let path: string | string[] = ''
  let viewWidth = 24
  let viewHeight = 24

  $: {
    if (typeof icon === 'string') {
      path = icon
      viewWidth = 24
      viewHeight = 24
    } else {
      path = icon.icon[4]
      viewWidth = icon.icon[0]
      viewHeight = icon.icon[1]
    }
  }
</script>

{#if !!tip}
  {#if !!href}
    <Tooltip bottom>
      <span slot="tip" {title}>{tip}</span>
      <a {href} {target} {title}>
        <Button icon={!fab} {fab} on:click depressed class={buttonClass}>
          <Icon
            {path}
            {viewWidth}
            {viewHeight}
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
      <Button icon={!fab} {fab} depressed on:click class={buttonClass}>
        <Icon
          {path}
          {viewWidth}
          {viewHeight}
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
    <Button icon={!fab} {fab} depressed on:click class={buttonClass}>
      <Icon
        {path}
        {viewWidth}
        {viewHeight}
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
  <Button icon={!fab} {fab} depressed on:click class={buttonClass}>
    <Icon
      {path}
      {viewWidth}
      {viewHeight}
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
    {path}
    {viewWidth}
    {viewHeight}
    {size}
    {rotate}
    {spin}
    {disabled}
    {style}
    class={klass}
    {...$$restProps}
  />
{/if}

<style global>
  .s-list-item.primary-color > span > i.s-icon,
  .s-list-item.secondary-color > span > i.s-icon {
    color: white;
  }
</style>
