<script lang="ts">
  import type { TagInterface, Article } from 'types'
  import logo from '$assets/favicon.ico'

  export let article: Partial<Article> = {
    name: `Nom de l'article`,
    ref: 'ref',
    price: 99,
  }

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

<div
  class="tag"
  class:border={tag.border}
  class:useTagPrinter={tag.useTagPrinter}
  style={`
    color: black;
    background: white;
    width: ${tag.width}mm;
    height: ${tag.height}mm;
    padding: ${tag.padding}mm;
    font-size: ${tag.fontSize}px;
  `}
>
  <div class="d-flex flex-column" style="height: 100%;">
    <div class="flex-grow-1">
      <b class="mr-1">#{article.ref}</b>
      <span>{article.name}</span>
    </div>

    <div class="d-flex align-center">
      <img src={logo} alt="Logo trocio" height="30" width="30" />
      <div class="flex-grow-1" />
      <div>
        {article.price?.toFixed(2)}
      </div>
    </div>
  </div>
</div>

<style>
  .tag.useTagPrinter {
    page-break-before: always;
    overflow: hidden;
  }

  .tag.border {
    border: 2px solid #ccc;
    border-radius: 4px;
  }
</style>
