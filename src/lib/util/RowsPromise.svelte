<script>
  import { ListItem } from "$lib/material";

  export let rowsNumber = 5;
  export let cellsWidth = [60, 60, 60];
  export let listMode = false;
  export let twoLine = false;
  export let meta = false;

  let emptyRows = Array(rowsNumber);
</script>

{#if listMode}
  {#each emptyRows}
    <ListItem>
      {#if twoLine}
        <span
          class="ghostText primaryText"
          style={`width: ${(0.5 + Math.random() / 2) * 100}%;`}>&nbsp;</span
        >
        <span
          class="ghostText secondaryText"
          style={`width: ${(0.5 + Math.random() / 2) * 100}%;`}>&nbsp;</span
        >
      {:else}
        TODO
      {/if}
      {#if meta}
        <span class="ghostMeta"></span>
      {/if}
    </ListItem>
  {/each}
{:else}
  {#each emptyRows}
    <tr style="text-align: left;">
      {#each cellsWidth as cellWidth}
        <td style={`width: ${cellWidth}px;`}>
          <span
            class="ghostText"
            style={`width: ${(0.5 + Math.random() / 2) * 100}%;`}>&nbsp;</span
          >
        </td>
      {/each}
    </tr>
  {/each}
{/if}

<style>
  .ghostText {
    display: block;
    position: relative;
    overflow: hidden;
    background: rgb(240, 240, 240);
    border-radius: 4px;
  }

  .ghostMeta {
    display: block;
    position: relative;
    overflow: hidden;
    background: rgb(240, 240, 240);
    width: 35px;
    height: 31.39px;
    border-radius: 100%;
  }

  .primaryText {
    margin-top: 1.2em;
  }

  .secondaryText {
    margin-top: 0.5em;
    height: 0.8em;
    opacity: 0.5;
  }

  .ghostText::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transform: translateX(-120%);
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 0, 0, 0.08),
      transparent
    );
  }

  .ghostText::after {
    animation: waves 2s linear 0.5s infinite;
  }

  @keyframes waves {
    0% {
      transform: translateX(-120%);
    }

    100% {
      transform: translateX(120%);
    }
  }
</style>
