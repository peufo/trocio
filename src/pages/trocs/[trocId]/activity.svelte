<script lang="ts">
  import { redirect } from '@roxi/routify'

  import { isMobile } from '$lib/store/layout'
  import SubActivityMobile from '$lib/sub/ActivityMobile.svelte'

  import { troc } from '$lib/troc/store'

  isMobile.subscribe((mobile) => {
    if (!mobile) $redirect('./')
  })
</script>

<SubActivityMobile
  subscribeId={$troc.subscribe._id}
  currency={$troc.currency}
/>

<slot />
