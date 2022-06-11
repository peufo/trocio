<!-- routify:options isFooterDisplay=true -->
<script>
  import { Button, Icon, Card } from 'svelte-materialify'
  import { redirect, params, afterPageLoad } from '@roxi/routify'

  import Login from '$lib/user/Login.svelte'
  import { user } from '$lib/user/store'

  export let scoped

  $afterPageLoad(() => {
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

<style>
</style>
