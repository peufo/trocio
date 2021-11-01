<script lang="ts">
  import { Button } from 'svelte-materialify'

  import { api } from '$lib/api'
</script>

<h3>Articles</h3>

<Button
  on:click={() =>
    api('/api/root/clean-up-articles', {
      method: 'post',
    })}
>
  Cleanup articles
</Button>
