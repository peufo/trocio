<script lang="ts">
  import { onMount } from 'svelte'
  import { url, layout } from '@roxi/routify'
  import { NavigationDrawer, List, ListItem, Divider } from '$material'
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
      <h5 class="pl-4 pt-2">Root control</h5>
      <Divider />
      <List nav>
        <a href={$layout.path}>
          <ListItem>
            {$layout.title}
          </ListItem>
        </a>
        {#each $layout.children as node}
          <a href={node.path}>
            <ListItem active={$url() === node.path}>
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
