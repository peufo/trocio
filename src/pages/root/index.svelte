<script lang="ts">
  import { Button } from 'svelte-materialify'

  import { api } from '$lib/api'
  import notify from '$lib/notify'
</script>

<h3>TODO: MONITORING 😎</h3>

<Button
  class="red white-text"
  on:click={() => {
    api('/api/root/migration', {
      method: 'post',
    }).then((res) => {
      notify.success(res.message)
    })
  }}
>
  Migration
</Button>
