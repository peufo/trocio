<script lang="ts">
  import { Button } from '$material'

  import { api } from '$lib/api'
  import notify from '$lib/notify'
</script>

<h3>Articles</h3>

<Button
  class="deep-purple white-text"
  on:click={() => {
    api('/api/root/cleanUpArticlesMargin', {
      method: 'post',
    }).then((res) => {
      notify.success(res.message)
    })
  }}
>
  Recalcule des marges
</Button>
