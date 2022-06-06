<script>
  /**
   * Same of import { NavigationDrawer } from 'svelte-materialify'
   * Exept line 31 : transition:transition|local={transitionOpts}
   *                                       ^^^^^
   */

  import { fade } from 'svelte/transition'
  import Style from '../../../node_modules/svelte-materialify/src/internal/Style'

  let klass = ''
  export { klass as class }
  export let width = '256px'
  export let active = true
  export let fixed = false
  export let absolute = false
  export let right = false
  export let mini = false
  export let clipped = false
  export let borderless = false
  export let miniWidth = '56px'
  export let clippedHeight = '56px'
  export let transition = fade
  export let transitionOpts = {}
  export let index = 4
  export let style = ''
</script>

<aside
  class="s-navigation-drawer {klass}"
  transition:transition|local={transitionOpts}
  on:introstart
  on:outrostart
  on:introend
  on:outroend
  class:active
  class:fixed
  class:absolute
  class:right
  class:mini
  class:clipped
  on:hover
  use:Style={{
    'nav-width': width,
    'nav-min-width': miniWidth,
    'nav-clipped-height': clippedHeight,
  }}
  style="z-index:{index};{style}"
>
  <slot name="prepend" />
  <div class="s-navigation-drawer__content">
    <slot />
  </div>
  <slot name="append" />
  {#if !borderless}
    <div class="s-navigation-drawer__border" />
  {/if}
</aside>

<style lang="scss" global>
  :global(.s-navigation-drawer__border) {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 1px;
    background-color: var(--theme-dividers);
  }
  :global(.s-navigation-drawer__content) {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
  :global(.s-navigation-drawer) {
    background-color: var(--theme-navigation-drawer);
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
    left: 0;
    max-width: 100%;
    width: var(--s-nav-width);
    height: 100%;
    overflow: hidden;
    pointer-events: auto;
    top: 0;
    /* transition-duration: 0.2s; */
    /* transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);*/
    /*transition-property: transform, visibility, width;*/
    will-change: transform;
  }
  :global(.s-navigation-drawer:not(.active)) {
    transform: translateX(-100%);
  }
  :global(.s-navigation-drawer.fixed) {
    position: fixed;
  }
  :global(.s-navigation-drawer.absolute) {
    position: absolute;
  }
  :global(.s-navigation-drawer.right) {
    left: auto;
    right: 0;
  }
  :global(.s-navigation-drawer.right:after) {
    left: 0;
    right: auto;
  }
  :global(.s-navigation-drawer.right:not(.active)) {
    transform: translate(100%);
  }
  :global(.s-navigation-drawer.right) :global(.s-navigation-drawer__border) {
    right: auto;
    left: 0;
  }
  :global(.s-navigation-drawer.clipped) {
    top: var(--s-nav-clipped-height);
    max-height: calc(100% - var(--s-nav-clipped-height));
  }
  :global(.s-navigation-drawer.mini) {
    width: var(--s-nav-min-width);
    overflow: hidden;
  }
  :global(.s-navigation-drawer.mini)
    :global(.s-list-item)
    > :global(:first-child) {
    margin-left: 0;
    margin-right: 0;
  }
  :global(.s-navigation-drawer.mini)
    :global(.s-list-item)
    > :global(:not(:first-child)) {
    display: none;
  }
</style>
