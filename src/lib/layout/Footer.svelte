<script>
  import { Button, Icon } from '$material'
  import { isDarkTheme } from '$lib/store/layout'
  import { mdiGithub } from '@mdi/js'

  export let offsetHeight
</script>

<footer
  class="text-center grey {$isDarkTheme ? 'darken-3' : 'lighten-3'}"
  bind:offsetHeight
>
  <div class="links">
    <div class="underline-div">
      <a class="underline-span" href="/contact">Contact</a>
    </div>
    <div class="underline-div">
      <a class="underline-span" href="/terms-of-use">
        Conditions d'utilisation
      </a>
    </div>
    <div class="underline-div">
      <a class="underline-span" href="/legal-notice"> Mentions légales </a>
    </div>

    <Button href="https://github.com/PeufOne/trocio">
      <Icon path={mdiGithub} class="mr-2" />
      code source
    </Button>
  </div>

  <div>Site réalisé par <a href="https://github.com/peufo">peufo</a></div>
</footer>

<style>
  footer {
    padding: 2em;
    background: #efefef;
    display: grid;
    place-items: center;
    gap: 1em;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1em 2em;
    padding-bottom: 0.5em;
  }
</style>
