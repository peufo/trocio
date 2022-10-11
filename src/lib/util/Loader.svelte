<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  export let title = 'Chargement'
  export let maxDots = 4
  export let timeInterval = 400

  let dots = ''
  let interval: NodeJS.Timer

  onMount(() => {
    interval = setInterval(() => {
      dots += '.'
      if (dots.length >= maxDots) dots = ''
    }, timeInterval)
  })

  onDestroy(() => {
    clearInterval(interval)
  })
</script>

<span>
  {title}
  {dots}
</span>
