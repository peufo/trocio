<script lang="ts">
  import SubActivity from '$lib/sub/Activity.svelte'
  import { troc } from '$lib/troc/store'
</script>

<SubActivity subscribeId={$troc.subscribe._id} />
