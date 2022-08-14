<script lang="ts">
  import { onMount } from 'svelte'
  let x = 0
  let y = 0
  let z = 0

  const frequency = 10
  const reaction = 0.1

  let dot = {
    x: 0,
    y: 0,
    v: {
      x: 0,
      y: 0,
    },
  }

  onMount(() => {
    let acl = new Accelerometer({
      frequency,
    })

    function reading() {
      ;({ x, y, z } = acl)
      dot.v.x -= acl.x / (frequency / reaction)
      dot.v.y += acl.y / (frequency / reaction)

      dot.x += dot.v.x
      dot.y += dot.v.y
    }

    acl.addEventListener('reading', reading)
    acl.start()
    return () => {
      acl.removeEventListener('reading', reading)
    }
  })

  function handleReset() {
    dot = {
      x: 0,
      y: 0,
      v: {
        x: 0,
        y: 0,
      },
    }
  }
</script>

<div>
  <button on:click={handleReset}>reset</button>
  <span>x: {x.toFixed(3)}</span>
  <span>y: {y.toFixed(3)}</span>
  <span>z: {z.toFixed(3)}</span>
</div>

<div class="dot" style="transform: translate({dot.x}cm, {dot.y}cm);" />

<style>
  .dot {
    position: absolute;
    left: calc(50% - 10px);
    top: calc(50% - 10px);
    width: 20px;
    height: 20px;
    background: #9d9d9d;
    border-radius: 50%;
  }
</style>
