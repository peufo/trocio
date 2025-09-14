<script>
  import { Card } from "$lib/material";
  import { goto, afterNavigate } from "$app/navigation";

  import Login from "$lib/user/Login.svelte";
  import { user, userQuery } from "$lib/user/store";
  import { param } from "$lib/param";

  export let scoped;

  afterNavigate(async () => {
    await $userQuery;
    if (!!$user) {
      handleLoginDone();
    }
  });

  function handleLoginDone() {
    goto($param.get("callback") || "/");
  }
</script>

{#if !$user}
  <div
    class="d-flex align-center justify-center"
    style="min-height: {scoped.mainHeight}px;"
  >
    <Card class="pa-4">
      <Login on:done={handleLoginDone} />
    </Card>
  </div>
{/if}
