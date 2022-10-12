<script lang="ts">
  import printJS from 'print-js'
  import type { TagInterface, Article } from 'types'
  import Tag from './Tag.svelte'

  export let visible = false
  export let articles: Partial<Article>[] = []
  export let currency = ''
  export let tag: TagInterface = {
    width: 80,
    height: 22,
    padding: 2,
    fontSize: 16,
    border: false,
    useTagPrinter: false,
    useScanner: false,
  }
  export function print() {
    const options: printJS.Configuration = {
      printable,
      type: 'html',
      targetStyles: ['*'],
      font_size: undefined,
    }

    printJS(options)
  }

  let printable: HTMLDivElement
</script>

<div class:hide={!visible}>
  <div
    bind:this={printable}
    class:d-flex={!tag.useTagPrinter}
    class:flex-wrap={!tag.useTagPrinter}
  >
    {#each articles as article}
      <Tag {article} {tag} {currency} />
    {/each}
  </div>
</div>

<style>
  .hide {
    display: none;
  }
</style>
