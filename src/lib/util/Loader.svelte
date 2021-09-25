<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  export let title = 'Chargement'

  let dots = ''
  let interval: NodeJS.Timer

  onMount(() => {
    interval = setInterval(() => {
      dots += '.'
      if (dots.length > 8) dots = ''
    }, 200)
  })

  onDestroy(() => {
    clearInterval(interval)
  })
</script>

<span>
  {title}
  {dots}
</span>
