<script lang="ts">
  import { redirect } from '@roxi/routify'

  import { isMobile } from '$lib/store/layout'
  import SubActivityLean from '$lib/sub/ActivityLean.svelte'

  import { troc } from '$lib/troc/store'

  isMobile.subscribe((mobile) => {
    if (!mobile) $redirect('./')
  })
</script>

<SubActivityLean subscribeId={$troc.subscribe._id} currency={$troc.currency} />
