<script lang="ts">
  import { Button } from 'svelte-materialify'
  import { faEdit } from '@fortawesome/free-solid-svg-icons'

  import { troc } from '$lib/troc/store'
  import TrocCard from '$lib/troc/Card.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import UsersCard from '$lib/troc/home/UsersCard.svelte'
  import ArticlesCard from '$lib/troc/home/ArticlesCard.svelte'
  import TraficCard from '$lib/troc/home/TraficCard.svelte'
</script>

<div class="grid">
  <TrocCard troc={$troc} hideAdminButton style="grid-area: hero">
    <div slot="card-actions">
      <a href={`/admin/edit?trocId=${$troc._id}`}>
        <Button depressed>
          éditer
          <IconLink icon={faEdit} class="ml-2" size="1.2em" opacity />
        </Button>
      </a>
    </div>
  </TrocCard>

  <!-- Users -->
  <UsersCard trocId={$troc._id} />

  <!-- Articles-->
  <ArticlesCard trocId={$troc._id} />

  <!-- Caisse-->
  <TraficCard trocId={$troc._id} currency={$troc.currency} />
</div>

<style>
  .grid {
    max-width: 1100px;
    margin: auto;
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
    grid-template-areas: 'hero hero hero';
  }
</style>
