<script lang="ts">
  import { onMount } from "svelte";
  import { isDarkTheme } from "$lib/store/layout";

  export let number = 40;

  const WIDTH = 540;
  const HEIGHT = 540;
  const LINE_WIDTH = 5;

  let angles: number[] = [];
  onMount(() => {
    //Desable SSR
    if (!navigator.userAgent.includes("jsdom")) {
      angles = Array(number)
        .fill(0)
        .map((n, i) => {
          return i * (360 / number);
        });
    }
  });
</script>

<div class="container">
  <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop
          offset="0%"
          stop-color={$isDarkTheme ? "#eee" : "#ccc"}
          stop-opacity="1"
        />

        <stop
          offset="100%"
          stop-color={$isDarkTheme ? "#eee" : "#ccc"}
          stop-opacity="0"
        />
      </linearGradient>
    </defs>
    {#each angles as angle, i}
      <rect
        x={WIDTH / 2}
        y={HEIGHT / 2 - LINE_WIDTH / 2}
        width={50 + Math.random() * 600}
        height={LINE_WIDTH}
        fill="url(#gradient)"
        style={`--rotate-angle: ${angle}deg; --show-delay: ${
          Math.random() * 1000 + 300
        }ms`}
      />
    {/each}
  </svg>
</div>

<style>
  .container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  svg {
    width: 100%;
    overflow: visible;
  }

  rect {
    transform: rotate(var(--rotate-angle)) scaleX(0);
    transform-origin: center;
    animation-name: showLine;
    animation-duration: 5s;
    animation-delay: var(--show-delay);
    animation-fill-mode: forwards;
  }

  @keyframes showLine {
    from {
      transform: rotate(var(--rotate-angle)) scaleX(0);
    }
    to {
      transform: rotate(var(--rotate-angle)) scaleX(1);
    }
  }
</style>
