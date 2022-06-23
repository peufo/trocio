<script lang="ts">
  import { redirect } from '@roxi/routify'

  import { isMobile } from '$lib/store/layout'
  import SubActivity from '$lib/sub/Activity.svelte'
  import { troc } from '$lib/troc/store'

  isMobile.subscribe((mobile) => {
    if (!mobile) $redirect('./')
  })
</script>

<SubActivity subscribeId={$troc.subscribe._id} />
