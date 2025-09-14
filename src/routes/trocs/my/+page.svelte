<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  import { user } from "$lib/user/store";
  import SubTrocsList from "$lib/sub/TrocsList.svelte";

  onMount(() => {
    if (!$user) goto(`/login?callback=${document.location.pathname}`);
  });
</script>

<div class="pa-3">
  <SubTrocsList listGap="1em" />
</div>
