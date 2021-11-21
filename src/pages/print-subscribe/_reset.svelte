<script lang="ts">
  import { params } from '@roxi/routify'

  import ResumPrint from '$lib/sub/ResumPrint.svelte'
  import { useApi } from '$lib/api'
  import Loader from '$lib/util/Loader.svelte'

  type ResumData = ConstructorParameters<typeof ResumPrint>[0]['props']

  $: query = useApi<{ subscribeId: string }, ResumData>({
    queryKey: [
      'subscribes/resum/printdata',
      { subscribeId: $params.subscribeId },
    ],
    onSuccess: () => {
      // setTimeout(() => window.print(), 200)
    },
  })
</script>

{#if $query.isError}
  <h3>ERROR</h3>
  <pre>{$query.error}</pre>
{:else if $query.isLoading}
  <Loader />
{:else if $query.data}
  <ResumPrint {...$query.data} />
{/if}
