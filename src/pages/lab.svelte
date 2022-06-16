<script>
  import { Button, Card } from 'svelte-materialify'
  import { notify, success, info, warning, error } from '$lib/notify/index'

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
        notify({ message: longText, message: 'Long text', type: 'success' })
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
    <br />
    <Button on:click={() => success('YOLO')}>Success</Button>
    <Button on:click={() => info('asd')}>Info</Button>
    <Button on:click={() => warning('YOLO')}>warning</Button>
    <Button on:click={() => error('YOLO')}>error</Button>
  </Card>
</div>

<style>
</style>
