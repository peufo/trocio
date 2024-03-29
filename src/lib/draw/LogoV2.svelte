<script>
  import { onMount, onDestroy } from 'svelte'
  import { fade } from 'svelte/transition'

  export let duration = 3 // SECONDS
  export let cubeSize = 50 // %

  const WIDTH = 200
  const HEIGHT = 200
  const FREQUENCE = 20 // image/second
  const OX = WIDTH / 2
  const OY = HEIGHT / 2

  const R = 30
  const RD = (2 * R ** 2) ** 0.5
  const AY = Math.atan(R / RD)
  let aX = 0

  let phase = 0

  $: phase = Math.floor((aX % (Math.PI * 2)) / (Math.PI / 2))

  let surfaces = [
    [0, 1, 2, 3],
    [3, 2, 6, 7],
    [7, 6, 5, 4],
    [0, 1, 5, 4],
  ]

  let cube = {
    nodes: [
      { x: -R, y: -R, z: R },
      { x: R, y: -R, z: R },
      { x: R, y: R, z: R },
      { x: -R, y: R, z: R },
      { x: -R, y: -R, z: -R },
      { x: R, y: -R, z: -R },
      { x: R, y: R, z: -R },
      { x: -R, y: R, z: -R },
    ],
    writeCord: function (nodesIndex) {
      //Rotation Y de 35.2634° de la projection
      let sinTheta = Math.sin(AY)
      let cosTheta = Math.cos(AY)
      return nodesIndex
        .map((i) => {
          let { x, z } = this.nodes[i]
          x = x * cosTheta + z * sinTheta
          return `${OX + x},${OY + this.nodes[i].y}`
        })
        .join(' ')
    },
    rotateX3D: function (theta) {
      theta = (theta / 180) * Math.PI
      aX += theta
      let sinTheta = Math.sin(theta)
      let cosTheta = Math.cos(theta)
      this.nodes = this.nodes.map((node) => {
        let { y, z } = node
        node.y = y * cosTheta - z * sinTheta
        node.z = z * cosTheta + y * sinTheta
        return node
      })
      cube = cube
    },
    rotateY3D: function (theta) {
      theta = (theta / 180) * Math.PI
      aY += theta
      let sinTheta = Math.sin(theta)
      let cosTheta = Math.cos(theta)
      this.nodes = this.nodes.map((node) => {
        let { x, z } = node
        node.x = x * cosTheta + z * sinTheta
        node.z = z * cosTheta - x * sinTheta
        return node
      })
      cube = cube
    },
    rotateZ3D: function (theta) {
      theta = (theta / 180) * Math.PI
      aZ += theta
      let sinTheta = Math.sin(theta)
      let cosTheta = Math.cos(theta)
      this.nodes = this.nodes.map((node) => {
        let { x, y } = node
        node.x = x * cosTheta - y * sinTheta
        node.y = y * cosTheta + x * sinTheta
        return node
      })
      cube = cube
    },
  }

  let animation

  onMount(() => {
    animation = setInterval(() => {
      cube.rotateX3D(360 / FREQUENCE / duration)
    }, 1000 / FREQUENCE)
  })

  onDestroy(() => {
    clearInterval(animation)
  })
</script>

<div
  class="container-logo"
  in:fade|local
  style={`--duration-rotation-logo: ${
    duration / 4
  }s; --cube-size: ${cubeSize}%;`}
>
  <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
    {#if phase === 0}
      <polygon points={cube.writeCord(surfaces[0])} class="up" />
      <polygon points={cube.writeCord(surfaces[1])} class="down" />
    {:else if phase === 1}
      <polygon points={cube.writeCord(surfaces[1])} class="up" />
      <polygon points={cube.writeCord(surfaces[2])} class="down" />
    {:else if phase === 2}
      <polygon points={cube.writeCord(surfaces[2])} class="up" />
      <polygon points={cube.writeCord(surfaces[3])} class="down" />
    {:else if phase === 3}
      <polygon points={cube.writeCord(surfaces[3])} class="up" />
      <polygon points={cube.writeCord(surfaces[0])} class="down" />
    {/if}

    <!-- Face gauche-->
    <polygon points={cube.writeCord([4, 0, 3, 7])} class="left" />
  </svg>
</div>

<style>
  .container-logo {
    max-width: 400px;
    width: var(--cube-size);
    margin: auto;
    --light: rgb(240, 240, 240);
    --medium: rgb(216, 216, 216);
    --dark: rgb(168, 168, 168);
  }

  :global(.theme--dark .container-logo) {
    --light: rgb(102, 102, 102);
    --medium: rgb(75, 75, 75);
    --dark: rgb(33, 33, 33);
  }

  .left {
    fill: var(--medium);
  }
  .down {
    animation: darkToMedium var(--duration-rotation-logo) linear;
    fill: var(--medium);
  }
  .up {
    animation: mediumToLight var(--duration-rotation-logo) linear;
    fill: var(--medium);
  }

  @keyframes darkToMedium {
    from {
      fill: var(--dark);
    }
    to {
      fill: var(--medium);
    }
  }

  @keyframes mediumToLight {
    from {
      fill: var(--medium);
    }
    to {
      fill: var(--light);
    }
  }

  svg {
    animation-name: scaleIn;
    animation-duration: 6s;
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.6);
    }
    to {
      transform: scale(1);
    }
  }
</style>
