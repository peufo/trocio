<script>
  /**
   * Carte avec entête sytétique
   * Peux se déployer pour révéler des détails
   */
  import { createEventDispatcher } from 'svelte'
  import { slide } from 'svelte/transition'
  import { List, ListItem } from 'svelte-materialify'

  import { renderAmount } from '$lib/utils'

  export let count = 0
  export let title = ''
  export let sum = 0
  export let free = false
  export let show = false
  export let items = []
  export let nonInteractive = false

  let dispatch = createEventDispatcher()

  function clickHandler(e) {
    if (!e.target.classList.contains('clickHandler')) return
    show = !show
    if (show) dispatch('open')
    else dispatch('close')
  }
</script>

<div class="simple-card">
  <div on:click={clickHandler} class="clickable w3-row header clickHandler">
    <div
      class="w3-col s1 w3-right-align w3-large clickHandler"
      style="padding-right: 20px;"
    >
      {count}
    </div>
    <div class="w3-col s9 w3-large clickHandler">
      <i class="fas fa-chevron-right w3-opacity clickHandler" class:show />
      &nbsp;{title}

      <slot name="head" />
    </div>
    <span class="w3-col s2 w3-right-align w3-large clickHandler">
      {renderAmount(sum)}
    </span>
  </div>

  {#if show}
    <div transition:slide|local>
      {#if free}
        <slot />
      {:else if !items.length}
        <div class="text-center text--secondary pt-2 pb-5">Aucun élément</div>
      {:else if items.length}
        <List style="padding: 7px;" {nonInteractive}>
          {#each items as item}
            <ListItem style="padding: 0 6px">
              <span class="w3-col s1"><slot name="col-1" {item} /></span>
              <span class="w3-col s8"><slot name="col-2" {item} /></span>
              <span class="w3-col s3 w3-right-align"
                ><slot name="col-3" {item} /></span
              >
            </ListItem>
          {/each}
        </List>
      {/if}
    </div>
  {/if}
</div>

<style>
  .header {
    padding: 15px 7px;
    line-height: 32px;
  }

  .fa-chevron-right {
    transition: 0.2s;
  }

  .fa-chevron-right.show {
    transform: rotate(90deg);
  }
</style>
