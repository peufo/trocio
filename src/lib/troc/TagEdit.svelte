<script lang="ts">
  import { fade } from 'svelte/transition'
  import { Button, Switch, TextField, Icon } from 'svelte-materialify'
  import { mdiOverscan, mdiFormatSize } from '@mdi/js'
  import IconLink from '$lib/util/IconLink.svelte'
  import { faArrowsAltV, faArrowsAltH } from '@fortawesome/free-solid-svg-icons'

  import { troc, useUpdateTroc } from '$lib/troc/store'
  import type { Article, TagInterface } from 'types'
  import notify from '$lib/notify'
  import { print } from '$lib/utils'
  import TagsPrint from '$lib/troc/TagsPrint.svelte'

  const updateTroc = useUpdateTroc()

  let tag: TagInterface = { ...$troc.tag }
  const articlesExemple: Partial<Article>[] = [
    { name: 'Article test A', ref: '123', price: 99 },
    {
      name: 'Article test B qui a une désignation un peu longue',
      ref: '231',
      price: 45,
    },
    { name: 'Art C', ref: '321', price: 900 },
  ]

  $: if (!tag.width) tag.width = 1
  $: if (!tag.height) tag.height = 1
  $: if (!tag.padding) tag.padding = 0

  $: isModified = JSON.stringify(tag) !== JSON.stringify($troc.tag)
  // @ts-ignore
</script>

<div class="wrapper">
  <h6 class="mb-5">Configuration des étiquettes</h6>

  <div class="pa-4 simple-card">
    <div class="d-flex pt-5">
      <TextField
        class="pr-2"
        bind:value={tag.width}
        dense
        type="number"
        min="10"
        max="200"
      >
        <div slot="prepend">
          <IconLink icon={faArrowsAltH} />
        </div>
        Largeur
      </TextField>

      <TextField
        class="pl-2"
        bind:value={tag.height}
        dense
        type="number"
        min="10"
        max="200"
      >
        <div slot="prepend">
          <IconLink icon={faArrowsAltV} />
        </div>
        Hauteur
      </TextField>
    </div>

    <div class="d-flex pt-5">
      <TextField
        class="pr-2"
        bind:value={tag.padding}
        dense
        type="number"
        min="0"
        max="20"
      >
        <div slot="prepend">
          <Icon path={mdiOverscan} />
        </div>
        Marge
      </TextField>

      <TextField
        class="pl-2"
        bind:value={tag.fontSize}
        dense
        min="6"
        max="50"
        type="number"
      >
        <div slot="prepend">
          <Icon path={mdiFormatSize} />
        </div>
        Taille text
      </TextField>
    </div>

    <Switch class="mt-4" bind:checked={tag.border}>Afficher les bords</Switch>

    <Switch bind:checked={tag.useTagPrinter}>
      Utiliser une imprimantes d'étiquettes
    </Switch>

    <Switch
      checked={tag.useScanner}
      disabled
      on:click={() =>
        notify.info({
          title: 'En développement',
          text: `L'utilisation des codes barres est en cours de développement.`,
        })}
    >
      Utiliser les codes barres
    </Switch>

    <div class="d-flex mt-4">
      <Button
        on:click={() => print('testPrint')}
        outlined
        class="secondary-text"
      >
        Tester l'impression
      </Button>
      <div class="flex-grow-1" />
      {#if isModified}
        <div transition:fade|local>
          <Button
            disabled={$updateTroc.isLoading}
            class={$updateTroc.isLoading ? '' : 'primary-color'}
            on:click={() => {
              $updateTroc.mutate(
                { tag, _id: $troc._id },
                {
                  onSuccess: (newTroc) => {
                    tag = { ...newTroc.tag }
                  },
                }
              )
            }}
          >
            Valider la modification
          </Button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Apercue -->
  <div class="mt-8">
    <h6 class="mb-4">Aperçu des étiquettes</h6>
    <div class="page-wrapper" class:elevation-10={!tag.useTagPrinter}>
      <div class:page={!tag.useTagPrinter}>
        <TagsPrint id="testPrint" visible articles={articlesExemple} {tag} />
      </div>
    </div>
  </div>
</div>

<style>
  .wrapper {
    max-width: 210mm;
    margin: auto;
  }

  .page-wrapper {
    overflow-x: auto;
  }

  .page {
    /** default value in chrome */
    width: 210mm;
    padding: 10mm;
  }
</style>
