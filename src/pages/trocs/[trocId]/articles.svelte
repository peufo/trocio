<script lang="ts">
  import { TextField, Icon } from 'svelte-materialify'

  import ArticleList from '$lib/article/List.svelte'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import { troc } from '$lib/troc/store'

  let search = ''
</script>

<div class="pa-2">
  <SearchTextField bind:search placeholder="Chercher un article" />
</div>

<ArticleList trocId={$troc._id} currency={$troc.currency} {search} />

<style>
  .container {
  }
</style>
