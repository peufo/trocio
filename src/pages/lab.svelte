<script>
  import { Button, Card } from 'svelte-materialify'
  import { notify } from '$lib/notify/index'

  const text = 'prout'
  const longText = new Array(10).fill(text).join(' ')
  const extraLongText = new Array(100).fill(text).join(' ')
</script>

<div class="pa-5">
  <Card class="pa-5">
    <Button on:click={() => notify(text, true)}>Prout persistent</Button>
    <Button on:click={() => notify(extraLongText, true)}>
      Extra long persistent
    </Button>
    <Button
      on:click={() => {
        notify(longText)
      }}
    >
      Long text
    </Button>
    <Button
      on:click={() => {
        notify(extraLongText)
      }}
    >
      Extra long text
    </Button>
  </Card>
</div>

<style>
</style>
