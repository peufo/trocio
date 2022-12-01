<script lang="ts">
  import { onMount } from 'svelte'
  import { layout, isActive } from '@roxi/routify'
  import { NavigationDrawer, List, ListItem } from '$material'
  import { layout as storeLayout } from '$lib/store/layout'

  let isRootUser = false
  let navigationWidth: string | undefined = undefined

  onMount(() => {
    fetch('/api/root')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          isRootUser = true
        }
      })
      .catch(console.trace)
  })
</script>

{#if !isRootUser}
  <h1 style="color: red;">Access denied</h1>
{:else}
  <NavigationDrawer
    bind:width={navigationWidth}
    style="
        position: fixed;
        top: 0px;
        height: {$storeLayout.innerHeight}px;
        padding-top: {$storeLayout.headerHeight}px;
        flex-shrink: 0;
    "
  >
    <List nav>
      <a href={$layout.path}>
        <ListItem>
          {$layout.title}
        </ListItem>
      </a>
      {#each $layout.children as node}
        <a href={node.path}>
          <ListItem active={$isActive(node.path)} activeClass="secondary-color">
            {node.title}
          </ListItem>
        </a>
      {/each}
    </List>
  </NavigationDrawer>

  <div style="padding-left: {navigationWidth};">
    <slot />
  </div>
{/if}
