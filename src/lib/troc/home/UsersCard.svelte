<script lang="ts">
  import { onMount } from 'svelte'
  import { url } from '@roxi/routify'
  import { Card, CardTitle, Button } from '$material'
  import { faUsers } from '@fortawesome/free-solid-svg-icons'

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
  <CardTitle class="mr-4">
    <Button
      href={$url('./management_users', { trocId })}
      title="Acceder à la caisse"
      depressed
    >
      <IconLink icon={faUsers} class="mr-4" opacity />
      Participation{total > 1 ? 's' : ''}
    </Button>

    <div class="flex-grow-1" />
    {total}
  </CardTitle>

  <div class="pa-4 d-flex flex-column" style="gap: 0.5em;">
    {#each ROLES as role, index (role.key)}
      <Button
        depressed
        style="width: 100%;"
        href={$url('/admin/management_users', {
          trocId,
          exact_role: role.key,
        })}
      >
        {#if role.icon}
          <IconLink icon={role.icon} opacity class="mr-2" size="1.2em" />
        {/if}
        {role.label}{counts[index] > 1 ? 's' : ''}
        <div class="flex-grow-1" />
        {counts[index]}
      </Button>
    {/each}

    {#if countGuest}
      <Button
        text
        class="mb-2 "
        size="x-small"
        title={`${countGuest} utilsateurs n'ont pas validées leur participation`}
        href={$url('/admin/management_users', {
          trocId,
          exact_validedByUser: false,
        })}
      >
        dont
        {countGuest}
        participation{countGuest > 1 ? 's' : ''}
        non validée{countGuest > 1 ? 's' : ''}
      </Button>
    {/if}
  </div>
</Card>
