<script>
  import { Card } from '$material'
  import { redirect, params, afterPageLoad } from '@roxi/routify'

  import Login from '$lib/user/Login.svelte'
  import { user, userQuery } from '$lib/user/store'

  export let scoped

  $afterPageLoad(async () => {
    await $userQuery
    if (!!$user) {
      $redirect($params.callback || '/')
    }
  })

  function handleLoginDone() {
    $redirect($params.callback || '/')
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
