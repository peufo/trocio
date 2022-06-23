<script lang="ts">
  import ArticleList from '$lib/article/List.svelte'

  import { troc } from '$lib/troc/store'
</script>

<ArticleList class="pa-2 mb-16" trocId={$troc._id} currency={$troc.currency} />
