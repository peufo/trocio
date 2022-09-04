<script lang="ts">
  import { onMount } from 'svelte'
  import { url } from '@roxi/routify'
  import { Card, CardTitle, Button } from 'svelte-materialify'
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
  <CardTitle class="ml-3 mr-4">
    <IconLink icon={faUsers} class="mr-2" />
    Participation{total > 1 ? 's' : ''}
    <div class="flex-grow-1" />
    {total}
  </CardTitle>

  <div class="pl-4 pr-4 pb-4 d-flex flex-column" style="gap: 0.5em;">
    {#each ROLES as role, index (role.key)}
      <a
        href={$url('/admin/management_users', {
          trocId,
          exact_role: role.key,
        })}
      >
        <Button depressed class="d-flex" style="width: 100%;">
          {#if role.icon}
            <IconLink icon={role.icon} opacity class="mr-2" size="1.2em" />
          {/if}
          {role.label}{counts[index] > 1 ? 's' : ''}
          <div class="flex-grow-1" />
          {counts[index]}
        </Button>
      </a>
    {/each}

    {#if countGuest}
      <a
        href={$url('/admin/management_users', {
          trocId,
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
