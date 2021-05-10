<script>
  import { page } from '@roxi/routify'
  import { fade, fly } from 'svelte/transition'

  import { user } from '$lib/store/user'
  import UserTrocs from '$lib/info/UserTrocs.svelte'
  import Login from '$lib/form/Login.svelte'

  export let scoped
  let offsetWidth = 0
  let smallDisplay = false
  $: smallDisplay = offsetWidth < 1300

  let segments = {
    create: {
      title: 'Organiser un troc',
      closeTitle: 'Fermer la création de troc',
    },
    search: {
      title: 'Trouver un troc',
      closeTitle: 'Fermer la recherche de troc',
    },
    detail: { closeTitle: 'Fermer les détail du troc' },
  }

  let segment = undefined
  $: segment = segments[$page.title]
</script>

{#if $user === null}
  <div class="centered" style={`height: ${scoped.mainHeight}px`}>
    <Login />
  </div>
{:else if $user !== undefined}
  <div class="window" class:main-open={segment} bind:offsetWidth>
    <div class="main-container" class:open={segment} class:smallDisplay>
      {#if segment}
        <div
          class="item no-margin-right simple-card"
          class:no-margin={smallDisplay}
          in:fade|local={{ delay: 200 }}
        >
          <slot />
        </div>
      {/if}
    </div>

    {#if !smallDisplay || !segment}
      <div
        class="right-container"
        class:smallDisplay
        transition:fly|local={{ x: 500 }}
      >
        <div class="item" class:no-margin={smallDisplay}>
          <div class="simple-card">
            <UserTrocs />
          </div>
        </div>

        <!-- ACTIVITE -->
        <div class="item no-margin-top" class:no-margin={smallDisplay}>
          <div class="simple-card">
            <div class="header">
              <span class="title">Actualités</span>
            </div>
            <p>Aucune actualité</p>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<svelte:head
  ><style>
    body {
      background: #fafafa;
    }
  </style></svelte:head
>

<style>
  .window {
    /*
        display: grid;
        grid-template-columns: auto minmax(360px, 500px);
        */
    margin: auto;
    max-width: 1500px;
    display: flex;
    justify-content: center;
  }

  .right-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    /*transition: width 1s ease;
        width: 100%;*/
    max-width: 700px;
    min-width: 400px;
  }
  .window.main-open .right-container {
    max-width: 500px;
  }
  .window.main-open .main-container {
    width: 100%;
  }
  .main-container:not(.smallDisplay) {
    width: 0%;
    transition: all 0.3s ease;
  }

  .item {
    margin: 1em;
  }
  .simple-card {
    padding: 16px;
  }
  .no-margin-top {
    margin-top: 0px;
  }

  .no-margin-right {
    margin-right: 0px;
  }

  .no-margin {
    margin: 0px;
  }

  .login {
    border-radius: 5px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .header {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.7em;
  }

  :global(.theme--dark) .header {
    border-bottom: 1px solid #444;
  }
</style>
