<script lang="ts">
  import UserResum from '$lib/troc/UserResum.svelte'
  import { troc } from '$lib/troc/store'
</script>

<UserResum subscribeId={$troc.subscribe._id} />
