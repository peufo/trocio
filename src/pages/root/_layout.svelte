<script lang="ts">
  import { onMount } from 'svelte'
  import { url, layout, isActive } from '@roxi/routify'
  import { NavigationDrawer, List, ListItem } from '$material'
  import { layout as lay } from '$lib/store/layout'

  let isRootUser = false

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
  <div class="d-flex">
    <NavigationDrawer style="height: {$lay.mainHeight}px;">
      <List nav>
        <a href={$layout.path}>
          <ListItem>
            {$layout.title}
          </ListItem>
        </a>
        {#each $layout.children as node}
          <a href={node.path}>
            <ListItem active={$isActive(node.path)}>
              {node.title}
            </ListItem>
          </a>
        {/each}
      </List>
    </NavigationDrawer>

    <div style="width: 100%;">
      <slot />
    </div>
  </div>
{/if}
