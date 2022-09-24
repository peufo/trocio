<script lang="ts">
  import SubActivity from '$lib/sub/Activity.svelte'
  import EnsureSubscribe from '$lib/sub/EnsureSubscribe.svelte'
  import type { TrocLookup } from 'types'

  export let troc: TrocLookup
</script>

<EnsureSubscribe {troc}>
  <SubActivity
    subscribeId={troc.subscribe._id}
    createArticleDisabled={!troc.is_try && troc.isClosed}
  />
</EnsureSubscribe>
