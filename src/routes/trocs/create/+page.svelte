<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { user } from "$lib/user/store";
  import TrocEdit from "$lib/troc/Edit.svelte";

  onMount(() => {
    if (!$user) goto(`/login?callback=${document.location.pathname}`);
  });
</script>

{#if !!$user}
  <div class="pa-2">
    <TrocEdit createMode />
  </div>
{/if}
