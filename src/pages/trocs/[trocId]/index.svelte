<script lang="ts">
  import { Card, CardActions, Button } from 'svelte-materialify'
  import { troc } from '$lib/troc/store'
  import TrocInfo from '$lib/troc/Info.svelte'
</script>

<div class="container" style="max-width: 1000px; margin: auto;">
  <Card class="ma-4 mb-6 pa-4">
    <TrocInfo troc={$troc} />

    <CardActions>
      <div class="flex-grow-1" />
      <Button>Prout</Button>
    </CardActions>
  </Card>
</div>

<style>
  .container {
    max-width: 850px;
    margin: auto;
  }
</style>
