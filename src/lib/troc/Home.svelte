<script lang="ts">
  import { url } from '@roxi/routify'
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
    faUserAlt,
    faUserCog,
    faUserTag,
    faUserTie,
  } from '@fortawesome/free-solid-svg-icons'

  import { troc } from '$lib/troc/store'
  import TrocCard from '$lib/troc/Card.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import { ROLES } from '$lib/user/roles'

  import { useApi } from '$lib/api'
  import type { DynamicQuerySubscribe } from 'types'

  $: queryRoleCounts = useApi<DynamicQuerySubscribe[], number[]>([
    'subscribes/count',
    ROLES.map((role) => ({
      exact_trocId: $troc._id,
      exact_role: role.key,
    })),
  ])
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

  <!-- Participants  -->
  <Card>
    <CardTitle>
      <IconLink icon={faUsers} class="mr-4" />
      0 Utilisateurs
    </CardTitle>

    <div class="pl-4 pr-4 pb-4">
      {#each ROLES as role, index (role.key)}
        <a
          href={$url('/admin/management_users', {
            trocId: $troc._id,
            exact_role: role.key,
          })}
        >
          <Button text>
            {#if $queryRoleCounts.isSuccess}
              {$queryRoleCounts.data[index]}
            {/if}

            {role.label}
          </Button>
        </a>
      {/each}
    </div></Card
  >

  <!-- Articles-->
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
