<script lang="ts">
  import { onDestroy } from 'svelte'
  import { fade } from 'svelte/transition'
  import QrCode from 'qrcode'
  import { faCashRegister } from '@fortawesome/free-solid-svg-icons'
  import { mdiQrcodeScan } from '@mdi/js'
  import { params } from '@roxi/routify'

  import type { ArticleLookup } from 'types'
  import { isMobile } from '$lib/store/layout'
  import IconLink from '$lib/util/IconLink.svelte'
  import { api } from '$lib/api'
  import notify from '$lib/notify'
  import ArticleMenu from '$lib/article/Menu.svelte'

  export let disabled: boolean

  let qrcode = ''

  let articleMenu: ArticleMenu
  let menuActive = false
  let timeoutMenu: NodeJS.Timer

  QrCode.toDataURL(`https://${location.host}/scanner`).then(
    (qr) => (qrcode = qr)
  )

  onDestroy(() => clearTimeout(timeoutMenu))

  export async function openArticleMenu(articleTagId: string) {
    try {
      const [article] = await api<ArticleLookup[]>('/api/articles', {
        params: { exact_tagId: articleTagId, trocId: $params['trocId'] },
      })
      if (!article) throw new Error('Article introuvable !')

      menuActive = true
      articleMenu.open(article)
      notify.success('Article scanner !')
      clearTimeout(timeoutMenu)
      timeoutMenu = setTimeout(() => articleMenu.close(), 12_000)
    } catch (error: any) {
      notify.error(error)
    }
  }
</script>

{#if disabled}
  <IconLink icon={faCashRegister} size="160" style="opacity: 0.3;" />
{:else}
  <div class="d-flex" style="gap: 2em;">
    <div class="d-flex flex-column justify-center" style="gap: 0.5 em;">
      {#if $isMobile}
        <IconLink icon={faCashRegister} size="160" style="opacity: 0.3;" />
        <br />
        <p class="text-caption text-center">
          <IconLink icon={mdiQrcodeScan} href="/scanner" fab />
          <br />
          Scanner pour un poste de travail ?
        </p>
      {:else}
        <div class="d-flex justify-center" style="gap: 2em;">
          <IconLink icon={faCashRegister} size="60" style="opacity: 0.3;" />
        </div>
        <br />

        <img src={qrcode} alt="Code QR de connexion mobile" />

        <p in:fade|local class="text-caption text-center">
          Scanner avec un smartphone
        </p>
      {/if}
    </div>
    <div class="menu-wrapper" class:active={menuActive}>
      <ArticleMenu
        bind:this={articleMenu}
        modeAdmin
        useRelativeCashierUrl
        on:close={() => (menuActive = false)}
        fadeParamsIn={{ duration: 150, delay: 150 }}
      />
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

  .menu-wrapper {
    position: relative;
    width: 0px;
    transition-property: all;
    transition-duration: 400ms;
  }

  .menu-wrapper.active {
    width: 180px;
  }
</style>
