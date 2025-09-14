<script lang="ts">
  import SubPrint from "$lib/sub/Print.svelte";
  import { useApi } from "$lib/api";
  import Loader from "$lib/util/Loader.svelte";
  import { param } from "$lib/param";

  type ResumData = ConstructorParameters<typeof SubPrint>[0]["props"];

  $: query = useApi<{ subscribeId: string }, ResumData>({
    queryKey: [
      "subscribes/resum/fulldata",
      { subscribeId: $param.get("subscribeId") || "" },
    ],
  });
</script>

{#if $query.isError}
  <h3>ERROR</h3>
  <pre>{$query.error}</pre>
{:else if $query.isPending}
  <Loader />
{:else if $query.data}
  <SubPrint {...$query.data} />
{/if}
