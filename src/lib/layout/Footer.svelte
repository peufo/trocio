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
  <div>
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

    <span>
      <i class="far fa-copyright" />
      2018 - 2022 Jonas Voisard
    </span>
  </div>
</footer>

<style>
  footer {
    background: #efefef;
    height: 100px;
    display: grid;
    place-items: center;
  }

  .links {
    display: flex;
    align-items: center;
    gap: 2em;
    padding-bottom: 0.5em;
  }
</style>
