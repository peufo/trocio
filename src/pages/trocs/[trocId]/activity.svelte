<script lang="ts">
  import { redirect } from '@roxi/routify'

  import { isMobile } from '$lib/store/layout'
  import EnsureSubscribe from '$lib/sub/EnsureSubscribe.svelte'
  import SubActivityMobile from '$lib/sub/ActivityMobile.svelte'

  import { troc } from '$lib/troc/store'

  isMobile.subscribe((mobile) => {
    if (!mobile) $redirect('./')
  })
</script>

<EnsureSubscribe troc={$troc}>
  <SubActivityMobile
    subscribeId={$troc.subscribe._id}
    currency={$troc.currency}
    createArticleDisabled={$troc.isClosed}
  />
</EnsureSubscribe>

<slot />
