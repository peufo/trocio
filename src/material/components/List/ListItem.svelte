<script>
  import { getContext } from 'svelte'
  import Ripple from '../../actions/Ripple'
  import Class from '../../internal/Class'

  const role = getContext('S_ListItemRole')
  const ITEM_GROUP = getContext('S_ListItemGroup')
  const DEFAULTS = {
    select: () => null,
    register: () => null,
    index: () => null,
    activeClass: 'active',
  }
  const ITEM = ITEM_GROUP ? getContext(ITEM_GROUP) : DEFAULTS

  let klass = ''
  export { klass as class }
  export let activeClass = ITEM.activeClass
  export let value = ITEM.index()
  export let active = false
  export let dense = false
  export let disabled = false
  export let multiline = false
  export let link = role
  export let selectable = !link
  export let ripple = getContext('S_ListItemRipple') || role || false
  export let style = ''
  export let href = ''
  export let target = ''

  ITEM.register((values) => {
    active = values.includes(value)
  })

  function click() {
    if (!disabled) ITEM.select(value)
  }
</script>

{#if href}
  <a {href} {target}>
    <div
      class="s-list-item {klass}"
      use:Class={[active && activeClass]}
      {role}
      tabindex={link ? 0 : -1}
      aria-selected={role === 'option' ? active : null}
      class:dense
      class:disabled
      class:multiline
      class:link
      class:selectable
      use:Ripple={ripple}
      on:click={click}
      on:click
      on:dblclick
      {style}
    >
      <slot name="prepend" />
      <div class="s-list-item__content">
        <div class="s-list-item__title">
          <slot />
        </div>
        <div class="s-list-item__subtitle">
          <slot name="subtitle" />
        </div>
      </div>
      <slot name="append" />
    </div>
  </a>
{:else}
  <div
    class="s-list-item {klass}"
    use:Class={[active && activeClass]}
    {role}
    tabindex={link ? 0 : -1}
    aria-selected={role === 'option' ? active : null}
    class:dense
    class:disabled
    class:multiline
    class:link
    class:selectable
    use:Ripple={ripple}
    on:click={click}
    on:click
    on:dblclick
    {style}
  >
    <slot name="prepend" />
    <div class="s-list-item__content">
      <div class="s-list-item__title">
        <slot />
      </div>
      <div class="s-list-item__subtitle">
        <slot name="subtitle" />
      </div>
    </div>
    <slot name="append" />
  </div>
{/if}

<style lang="scss" src="./ListItem.scss" global>
</style>
