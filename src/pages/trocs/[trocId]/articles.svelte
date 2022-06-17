<script lang="ts">
  import ArticleList from '$lib/article/List.svelte'
  import { troc } from '$lib/troc/store'
</script>

<ArticleList trocId={$troc._id} currency={$troc.currency} search={''} />
