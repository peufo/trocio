<script lang="ts">
  import type { TagInterface, Article } from 'types'
  import Tag from './Tag.svelte'

  export let id = 'tagsPrint'
  export let visible = false
  export let articles: Partial<Article>[] = []
  export let tag: TagInterface = {
    width: 80,
    height: 22,
    padding: 2,
    fontSize: 16,
    border: false,
    useTagPrinter: false,
    useScanner: false,
  }
</script>

<div class:hide={!visible}>
  <div
    {id}
    class:d-flex={!tag.useTagPrinter}
    class:flex-wrap={!tag.useTagPrinter}
  >
    {#each articles as article}
      <Tag {article} {tag} />
    {/each}
  </div>
</div>

<style>
  .hide {
    display: none;
  }
</style>
