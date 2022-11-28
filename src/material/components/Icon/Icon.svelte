<script lang="ts">
  import Style from '../../internal/Style'

  let klass = ''
  export { klass as class }
  export let size = '24px'
  export let width = size
  export let height = size
  export let viewWidth: string | number = '24'
  export let viewHeight: string | number = '24'
  export let rotate = 0
  export let spin = false
  export let disabled = false
  export let path = ''
  export let label = ''
  export let style = ''
  $: {
    width = size
    height = size
  }
</script>

<i
  aria-hidden="true"
  class="s-icon {klass}"
  class:spin
  aria-label={label}
  class:disabled
  use:Style={{ 'icon-size': size, 'icon-rotate': `${rotate}deg` }}
  aria-disabled={disabled}
  {style}
>
  {#if path}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {width}
      {height}
      viewBox="0 0 {viewWidth} {viewHeight}"
    >
      <path d={path}>
        {#if label}
          <title>{label}</title>
        {/if}
      </path>
    </svg>
  {/if}
  <slot />
</i>

<style type="scss" src="./Icon.scss" global>
</style>
