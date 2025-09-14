<script lang="ts">
  import { MaterialApp } from "$lib/material";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";

  import Header from "$lib/layout/Header.svelte";
  import Footer from "$lib/layout/Footer.svelte";
  import FadeDecorator from "$lib/layout/Fade.svelte";
  import { layout, isDarkTheme } from "$lib/store/layout";

  import "$lib/assets/index.css";
  import icon from "$lib/assets/favicon.ico";

  const queryClient = new QueryClient();

  let innerHeight = 0;

  $: {
    $layout.mainHeight = innerHeight - $layout.headerHeight;
    if ($layout.isFooterDisplay) $layout.mainHeight -= $layout.footerHeight;
  }
</script>

<svelte:window bind:innerHeight />

<svelte:head>
  <link rel="icon" href={icon} />
</svelte:head>

<QueryClientProvider client={queryClient}>
  <div style={`min-height: ${innerHeight}px;`}>
    <MaterialApp theme={$isDarkTheme ? "dark" : "light"}>
      <Header bind:offsetHeight={$layout.headerHeight} />

      <div style="min-height: {$layout.mainHeight}px;">
        <slot decorator={FadeDecorator} scoped={$layout} />
      </div>

      {#if $layout.isFooterDisplay}
        <Footer bind:offsetHeight={$layout.footerHeight} />
      {/if}
    </MaterialApp>
  </div>
</QueryClientProvider>
