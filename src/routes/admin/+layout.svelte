<script lang="ts">
  import Loader from "$lib/util/Loader.svelte";
  import NavigationAdmin from "$lib/layout/NavigationAdmin.svelte";
  import Tips from "$lib/layout/Tips.svelte";
  import { troc } from "$lib/troc/store";
  import { user } from "$lib/user/store";
  import { isMobile } from "$lib/store/layout";
  import { useApi } from "$lib/api";
  import type { TrocLookup } from "$lib/types";
  import { param, urlParam } from "$lib/param";
  import { goto } from "$app/navigation";

  export let tipsActive = false;
  let navigationWidth: string;
  let tipsWidth: string;

  const trocQuery = useApi<{ trocId: string }, TrocLookup>({
    queryKey: ["trocs/byId", { trocId: $param.get("trocId") || "" }],
  });

  trocQuery.subscribe((run) => {
    if (run.isSuccess) {
      troc.set(run.data);
    }
  });

  if (!$user) {
    goto(`/login?callback=${$urlParam.with({})}`);
  }
</script>

{#if !!$user}
  {#if $trocQuery.isPending}
    <div class="centered" style="height: 100px;">
      <Loader />
    </div>
  {:else if !$trocQuery || $trocQuery?.isError}
    <div class="centered" style="height: 100px;">
      <span>Oups, une erreur c'est produite.</span>
    </div>
  {:else if $trocQuery.isSuccess && $troc}
    <NavigationAdmin
      bind:realWidth={navigationWidth}
      on:openTips={() => (tipsActive = !tipsActive)}
    />

    <Tips bind:width={tipsWidth} bind:active={tipsActive} />

    <div
      class="layout"
      style="
        padding-left: {$isMobile ? '0px' : navigationWidth};
        padding-right: {tipsActive ? tipsWidth : '0px'};"
    >
      <main class="pa-{$isMobile ? 1 : 4}">
        {#if $troc.is_try}
          <div class="orange white-text alert mb-2">
            <div>Troc d'entrainement</div>
          </div>
        {/if}

        <slot />
      </main>
    </div>
  {/if}
{/if}

<style>
  .layout {
    transition: padding 200ms;
  }
</style>
