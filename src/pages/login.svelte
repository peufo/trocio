<!-- routify:options isFooterDisplay=true -->
<script>
  import { Button, Icon, Card } from 'svelte-materialify'
  import { redirect, params, afterPageLoad } from '@roxi/routify'

  import Login from '$lib/form/Login.svelte'
  import { user } from '$lib/store/user'

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
  <div class="container" style="height: {scoped.mainHeight}px;">
    <div class="half w3-center">
      <a href="/">
        <Button>
          <Icon class="fas fa-home" />&nbsp; Retour à l'acceuil
        </Button>
      </a>
      <br /><br /><br />
      <a href="/search">
        <Button>
          <Icon class="fas fa-search" />&nbsp; Chercher des Trocs
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
  .container {
    max-width: 1200px;
    margin: auto;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap-reverse;
  }
</style>
