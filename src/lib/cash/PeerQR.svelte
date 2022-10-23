<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import QrCode from 'qrcode'
  import { faCashRegister } from '@fortawesome/free-solid-svg-icons'
  import { mdiCellphoneWireless, mdiQrcodeScan } from '@mdi/js'
  import { params } from '@roxi/routify'

  import type { Article, ArticleLookup } from 'types'
  import { isMobile } from '$lib/store/layout'
  import IconLink from '$lib/util/IconLink.svelte'
  import { Icon } from '$material'
  import { api } from '$lib/api'
  import notify from '$lib/notify'
  import ArticleMenu from '$lib/article/Menu.svelte'

  export let peerToken: string
  export let peerConnections: number
  export let disabled: boolean

  let qrcode = ''

  let articleMenu: ArticleMenu
  let timeoutMenu: NodeJS.Timer

  onMount(() => {
    openArticleMenu('62f25a414da937add0804d1e')
  })

  export async function openArticleMenu(articleId: string) {
    try {
      const [article] = await api<ArticleLookup[]>('/api/articles', {
        params: { exact__id: articleId, trocId: $params['trocId'] },
      })

      articleMenu.open(article)
    } catch (error: any) {
      notify.error(error)
    }
  }

  $: {
    const scannerURL = `https://${location.host}/scanner?token=${peerToken}`
    QrCode.toDataURL(scannerURL).then((qr) => (qrcode = qr))
  }
</script>

{#if disabled}
  <IconLink icon={faCashRegister} size="160" style="opacity: 0.3;" />
{:else}
  <div class="d-flex flex-column justify-center" style="gap: 0.5 em;">
    {#if $isMobile}
      <IconLink icon={faCashRegister} size="160" style="opacity: 0.3;" />
      <br />
      <IconLink icon={mdiQrcodeScan} href="/scanner" fab />
      <p class="text-caption text-center">Se connecter à une caisse ?</p>
    {:else}
      <div class="d-flex justify-center" style="gap: 2em;">
        <IconLink icon={faCashRegister} size="60" style="opacity: 0.3;" />
        {#each Array(peerConnections) as p, i}
          <div transition:fade|local>
            <Icon
              path={mdiCellphoneWireless}
              class="secondary-text"
              size="60"
            />
          </div>
        {/each}
      </div>
      <br />

      <img src={qrcode} alt="Code QR de connexion mobile" />

      {#if !!peerConnections}
        <p in:fade|local class="text-caption text-center">
          Connexion établie ({peerConnections})
        </p>
      {:else}
        <p in:fade|local class="text-caption text-center">
          Connectez votre smartphone
        </p>
      {/if}
    {/if}

    <div>
      Vous avez scanner un article
      <ArticleMenu bind:this={articleMenu} />
    </div>
  </div>
{/if}

<style>
  img {
    border-radius: 10px;
    border: 2px solid grey;
    margin-bottom: 1em;
    width: fit-content;
    margin: auto;
  }

  .text-caption {
    opacity: 0.8;
  }
</style>
