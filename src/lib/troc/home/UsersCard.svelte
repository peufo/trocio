<script lang="ts">
  import { onMount } from 'svelte'
  import { url } from '@roxi/routify'
  import { Card, CardTitle, Button } from 'svelte-materialify'
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

  import type { DynamicQuerySubscribe } from 'types'
  import IconLink from '$lib/util/IconLink.svelte'
  import { ROLES } from '$lib/user/roles'
  import { api } from '$lib/api'

  export let trocId: string

  let counts = ROLES.map(() => 0)
  let countGuest = 0
  let total = 0

  onMount(async () => {
    counts = await Promise.all(
      ROLES.map((role) =>
        api<DynamicQuerySubscribe, number>('/api/subscribes/count', {
          params: {
            exact_trocId: trocId,
            exact_role: role.key,
          },
        })
      )
    )
    countGuest = await api<DynamicQuerySubscribe, number>(
      '/api/subscribes/count',
      {
        params: {
          exact_trocId: trocId,
          exact_validedByUser: false,
        },
      }
    )

    total = counts.reduce((acc, cur) => (acc += cur))
  })
</script>

<!-- Participants  -->
<Card>
  <CardTitle>
    <IconLink icon={faUsers} class="mr-4" />
    {total}
    Participation{total > 1 ? 's' : ''}
  </CardTitle>

  <div class="pl-4 pr-4 pb-4">
    {#each ROLES as role, index (role.key)}
      <a
        href={$url('/admin/management_users', {
          trocId: trocId,
          exact_role: role.key,
        })}
      >
        <Button depressed class="mb-2">
          {#if role.icon}
            <IconLink icon={role.icon} opacity class="mr-2" size="1.2em" />
          {/if}
          {counts[index]}
          {role.label}{counts[index] > 1 ? 's' : ''}
        </Button>
      </a>
      <br />
    {/each}

    {#if countGuest}
      <a
        href={$url('/admin/management_users', {
          trocId: trocId,
          exact_validedByUser: false,
        })}
      >
        <Button
          text
          class="mb-2 "
          size="x-small"
          title={`${countGuest} utilsateurs n'ont pas validées leur participation`}
        >
          dont
          {countGuest}
          participation{countGuest > 1 ? 's' : ''}
          non validée{countGuest > 1 ? 's' : ''}
        </Button>
      </a>
    {/if}
  </div>
</Card>
