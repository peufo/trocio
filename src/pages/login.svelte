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
    class="d-flex flex-wrap justify-space-around align-center"
    style="height: {scoped.mainHeight}px;"
  >
    <div class="text-center">
      <a href="/" class="mr-2">
        <Button>
          <Icon class="fas fa-home mr-2" />
          accueil
        </Button>
      </a>

      <a href="/trocs">
        <Button>
          <Icon class="fas fa-search mr-2" />
          Trocs
        </Button>
      </a>
    </div>

    <div class="half">
      <Card class="pa-4">
        <Login on:done={handleLoginDone} />
      </Card>
    </div>
  </div>
{/if}

<style>
</style>
