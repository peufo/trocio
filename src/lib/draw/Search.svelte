<script>
  import { onMount, onDestroy } from 'svelte'

  import { isDarkTheme } from '$lib/stores.js'

  import marker from '$assets/images/marker-icon-2x.png'

  const WRITE_WAIT = 200
  const ERASE_WAIT = 100
  const WORDS = ['Ski de rando', 'Légo en vrac', 'Vélo enduro']
  let text = ''
  let wordIndex = 0
  let writeIndex = 0

  let icons = []
  let showIcon = false

  let interval

  onMount(() => {
    interval = setInterval(write, WRITE_WAIT)
  })

  onDestroy(() => {
    clearInterval(interval)
  })

  function write() {
    text += WORDS[wordIndex][writeIndex++]
    if (writeIndex === WORDS[wordIndex].length - 3) showIcons()
    if (!WORDS[wordIndex][writeIndex]) {
      clearInterval(interval)
      setTimeout(() => {
        interval = setInterval(erase, ERASE_WAIT)
      }, 1500)
    }
  }

  function erase() {
    text = text.slice(0, -1)
    if (!text) {
      clearInterval(interval)
      writeIndex = 0
      wordIndex = wordIndex === WORDS.length - 1 ? 0 : wordIndex + 1
      setTimeout(() => {
        interval = setInterval(write, WRITE_WAIT)
      }, 500)
    }
  }

  function showIcons() {
    showIcon = false
    setTimeout(() => {
      icons = Array(12)
        .fill()
        .map(() => {
          return {
            x: 10 + Math.round(Math.random() * 80),
            y: 10 + Math.round(Math.random() * 80),
          }
        })
      showIcon = true
    }, 50)
  }
</script>

<div class="container">
  {#each icons as { x, y }, i}
    <img
      class="icon"
      class:showIcon
      style={`left: ${x}%; top: ${y}%; animation-delay: ${i * 50}ms;`}
      src={marker}
      alt="icon"
    />
  {/each}

  <div class="w3-large search">
    <i class="fas fa-search" />
    <input
      type="text"
      readonly
      value={text}
      class={$isDarkTheme && 'grey darken-3 white-text'}
    />
  </div>
</div>

<style>
  .container {
    width: 80%;
    max-width: 400px;
    height: 300px;
    margin: auto;
    margin-top: 30px;
    position: relative;
    border-radius: 10px;
    background: url($assets/images/map.png);
  }

  input {
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 8px;
    padding-left: 40px;
    width: 200px;
    background: white;
  }

  .fa-search {
    transform: translateX(35px);
    opacity: 0.5;
  }

  .search {
    transform: translate(-23px, -50%);
  }

  .icon {
    position: absolute;
    width: 25px;
    transform: scale(0);
  }

  .icon.showIcon {
    animation-name: showIcon;
    animation-duration: 2.5s;
    animation-timing-function: ease;
  }

  @keyframes showIcon {
    0% {
      transform: scale(0) translateY(-50%);
    }
    20% {
      transform: scale(1.1) translateY(-50%);
    }
    30% {
      transform: scale(1) translateY(-50%);
    }
    80% {
      transform: scale(1) translateY(-50%);
    }
    100% {
      transform: scale(0) translateY(-50%);
    }
  }
</style>
