<script lang="ts">
  import { goto } from "$app/navigation";

  import { isMobile } from "$lib/store/layout";
  import EnsureSubscribe from "$lib/sub/EnsureSubscribe.svelte";
  import SubActivityMobile from "$lib/sub/ActivityMobile.svelte";

  import { troc } from "$lib/troc/store";

  isMobile.subscribe((mobile) => {
    if (!mobile) goto("./");
  });
</script>

<EnsureSubscribe troc={$troc}>
  <SubActivityMobile
    subscribeId={$troc.subscribe._id}
    currency={$troc.currency}
    createArticleDisabled={$troc.isClosed}
  />
</EnsureSubscribe>

<slot />
