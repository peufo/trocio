<script lang="ts">
  import { goto } from "$app/navigation";

  import { isMobile } from "$lib/store/layout";
  import ArticleList from "$lib/article/List.svelte";
  import { troc } from "$lib/troc/store";

  isMobile.subscribe((mobile) => {
    if (!mobile) goto("./");
  });
</script>

<ArticleList class="pa-2 mb-16" trocId={$troc._id} currency={$troc.currency} />
