<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade, type FadeParams } from "svelte/transition";
  import { debounce } from "debounce";

  import { Dialog } from "$lib/material";

  import { isMobile } from "$lib/store/layout";

  export let active = false;
  export let persistent = true;
  export let fadeParamsIn: FadeParams = { duration: 150 };
  export let fadeParamsOut: FadeParams = { duration: 150 };

  const dispatch = createEventDispatcher<{ open: void; close: void }>();

  type Position = { x: number; y: number };
  let position: Position = { x: 0, y: 0 };
  let mouseHover = false;
  let menuHeight = 0;

  export function open(_position?: Position) {
    persistent = !_position;
    if (_position) {
      position = { x: _position.x - 92, y: _position.y - 20 };
    }
    active = true;
    dispatch("open");
  }

  export function close() {
    active = false;
    dispatch("close");
  }

  const handleMouseLeave = debounce(() => {
    if (persistent) return;
    mouseHover || close();
  }, 400);

  $: {
    const { offsetHeight } = document.body;
    if (position.y + menuHeight > offsetHeight) {
      position.y = offsetHeight - menuHeight - 10;
    }
  }
</script>

{#if $isMobile}
  <Dialog bind:active>
    <slot />
  </Dialog>
{:else if active}
  <div
    role="menu"
    tabindex="0"
    class="s-menu"
    class:persistent
    bind:offsetHeight={menuHeight}
    in:fade|local={fadeParamsIn}
    out:fade|local={fadeParamsOut}
    on:mouseenter={() => (mouseHover = true)}
    on:mouseleave={() => {
      mouseHover = false;
      handleMouseLeave();
    }}
    style="left: {position.x}px; top: {position.y}px;"
  >
    <slot />
  </div>
{/if}

<style>
  .s-menu {
    overflow-x: hidden;
    max-height: 400px;
    z-index: 50;
  }
  .s-menu:not(.persistent) {
    position: fixed;
  }
</style>
