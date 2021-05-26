<script>
  import TrocResult from '$lib/troc/Result.svelte'
  import { params } from '@roxi/routify'
</script>

<div>
  {JSON.stringify($params, null, 2)}
</div>

<TrocResult />
