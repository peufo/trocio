<script lang="ts">
  import { Button } from "$lib/material";
  import { faEdit } from "@fortawesome/free-solid-svg-icons";

  import { troc } from "$lib/troc/store";
  import { isMobile } from "$lib/store/layout";
  import TrocCard from "$lib/troc/Card.svelte";
  import IconLink from "$lib/util/IconLink.svelte";
  import UsersCard from "$lib/troc/home/UsersCard.svelte";
  import ArticlesCard from "$lib/troc/home/ArticlesCard.svelte";
  import CashCard from "$lib/troc/home/CashCard.svelte";
  import LinksCard from "$lib/troc/home/LinksCard.svelte";
</script>

<div class="home-grid" style="padding-bottom: {$isMobile ? 75 : 0}px">
  <TrocCard troc={$troc} hideAdminButton class="hero">
    <div slot="card-actions">
      <a href={`/admin/edit?trocId=${$troc._id}`}>
        <Button depressed>
          éditer
          <IconLink icon={faEdit} class="ml-2" size="1.2em" opacity />
        </Button>
      </a>
    </div>
  </TrocCard>

  <CashCard trocId={$troc._id} currency={$troc.currency} />

  <ArticlesCard trocId={$troc._id} />

  <UsersCard trocId={$troc._id} />

  <LinksCard trocId={$troc._id} />
</div>

<style>
  .home-grid {
    max-width: 1100px;
    margin: auto;
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  }
  @media screen and (min-width: 1000px) {
    :global(.hero) {
      grid-column: span 2;
    }
  }
</style>
