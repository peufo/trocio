<script lang="ts">
  import { Button, Card, CardText, CardTitle } from 'svelte-materialify'
  import {
    faHouseChimney,
    faInfoCircle,
    faUsers,
    faCubes,
    faCoins,
    faTag,
    faChartPie,
    faCashRegister,
    faAngleDoubleLeft,
    faEdit,
  } from '@fortawesome/free-solid-svg-icons'

  import { troc } from '$lib/troc/store'
  import TrocCard from '$lib/troc/Card.svelte'
  import UsersCard from '$lib/troc/home/UsersCard.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
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

  <UsersCard trocId={$troc._id} />

  <!-- Articles-->
  <Card>
    <CardTitle>
      <IconLink icon={faCashRegister} class="mr-4" />
      42 Articles proposés
    </CardTitle>
    <CardText>
      <ul>
        <li>asd</li>
        <li>asd</li>
        <li>asd</li>
      </ul>
    </CardText>
  </Card>

  <!-- Caisse-->
  <Card>
    <CardTitle>
      <IconLink icon={faCubes} class="mr-4" />
      42 Articles proposés
    </CardTitle>
    <CardText>
      <ul>
        <li>asd</li>
        <li>asd</li>
        <li>asd</li>
      </ul>
    </CardText>
  </Card>
</div>

<style>
  .grid {
    max-width: 1200px;
    margin: auto;
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
    grid-template-areas: 'hero hero hero';
  }
</style>
