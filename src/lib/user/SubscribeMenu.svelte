<script lang="ts">
  import { fade, fly } from 'svelte/transition'
  import { List, ListItem } from 'svelte-materialify'
  import { params, url, goto } from '@roxi/routify'
  import { debounce } from 'debounce'
  import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
  import { faCheckCircle } from '@fortawesome/free-regular-svg-icons'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'

  import IconLink from '$lib/util/IconLink.svelte'
  import type { SubscribeLookup, ISubscribe, RoleEnum } from 'types'
  import notify from '$lib/notify'
  import { troc } from '$lib/troc/store'
  import { api } from '$lib/api'
  import { ROLES } from '$lib/user/roles'

  export let active = false
  export let state: 'main' | 'role' | 'tarif' = 'main'
  export let subscribe: SubscribeLookup | undefined = undefined

  let position = { x: 0, y: 0 }
  let mouseIn = false
  const queryClient = useQueryClient()

  export function open(event: MouseEvent, sub: SubscribeLookup) {
    position = { x: event.pageX - 20, y: event.pageY - 20 }
    state = 'main'
    subscribe = sub
    active = true
  }

  export function close() {
    active = false
  }

  const handleMouseLeave = debounce(() => mouseIn || close(), 400)

  interface AssignTarifBody {
    subscribeId: string
    tarifId: string
  }
  interface AssignRoleBody {
    subscribeId: string
    role: RoleEnum
    prefix?: string
  }

  const assignTarif = useMutation(
    (data: AssignTarifBody) =>
      api<AssignTarifBody, ISubscribe>('/api/subscribes/tarif', {
        method: 'post',
        data,
        success: `Nouveau tarif attribué à ${
          subscribe?.user?.name || subscribe?.name
        }`,
      }),
    {
      onSuccess: (data) => {
        if (subscribe) subscribe.tarifId = data.tarifId
        queryClient.invalidateQueries('subscribes')
        queryClient.invalidateQueries('subscribes/count')
      },
    }
  )

  const assignRole = useMutation(
    (data: AssignRoleBody) =>
      api<AssignRoleBody, ISubscribe>('/api/subscribes/role', {
        method: 'post',
        data,
        success: data.role === 'basic' ? 'Rôle retiré' : `Rôle attribué`,
      }),
    {
      onSuccess: (data) => {
        if (subscribe) {
          subscribe.role = data.role
          subscribe.prefix = data.prefix
        }
        queryClient.invalidateQueries('subscribes')
        queryClient.invalidateQueries('subscribes/count')
      },
    }
  )
</script>

{#if active}
  <div
    class="s-menu"
    in:fade|local={{ duration: 150 }}
    out:fade|local={{ duration: 150 }}
    on:mouseenter={() => (mouseIn = true)}
    on:mouseleave={() => {
      mouseIn = false
      handleMouseLeave()
    }}
    style="left: {position.x}px; top: {position.y}px; z-index:{50};"
  >
    <List>
      {#if state === 'main'}
        <div in:fly|local={{ x: -200 }}>
          <ListItem disabled dense>
            <span class="text-subtitle-2">
              {subscribe?.user?.name || subscribe?.name}
            </span>
          </ListItem>
          <ListItem
            on:click={() =>
              $goto($url('/admin/management_articles'), {
                trocId: $params.trocId,
                tab_admin: 'management_articles',
                exact_buyer: subscribe?.userId,
              })}
          >
            Voir les achats
          </ListItem>
          <ListItem
            on:click={() =>
              $goto($url('/admin/management_articles'), {
                trocId: $params.trocId,
                tab_admin: 'management_articles',
                exact_provider: subscribe?.userId,
              })}
          >
            Voir les propositions
          </ListItem>
          {#if subscribe?.userId}
            <ListItem on:click={() => (state = 'role')}>
              Assigner un rôle
              <span slot="append">
                <IconLink icon={faAngleRight} size="1.2em" class="ml-2" />
              </span>
            </ListItem>
          {/if}
          <ListItem on:click={() => (state = 'tarif')}>
            Attribuer un tarif
            <span slot="append">
              <IconLink icon={faAngleRight} size="1.2em" class="ml-2" />
            </span>
          </ListItem>
          <ListItem disabled on:click={() => notify.info('TODO')}>
            Corriger le solde
          </ListItem>
        </div>
      {/if}

      {#if state === 'role'}
        <div in:fly|local={{ x: 200 }}>
          <ListItem dense on:click={() => (state = 'main')}>
            <span slot="prepend">
              <IconLink icon={faAngleLeft} size="1.2em" class="mr-4" />
            </span>
            <span class="text-subtitle-2">
              Rôle de {subscribe?.user?.name || subscribe?.name}
            </span>
          </ListItem>

          {#each ROLES as { label, icon, queryValue }}
            <ListItem
              on:click={() =>
                subscribe &&
                $assignRole.mutate({
                  subscribeId: subscribe._id,
                  role: queryValue,
                })}
            >
              <span slot="prepend">
                {#if icon}
                  <IconLink {icon} size="1.2em" class="mr-4" />
                {/if}
              </span>
              {label}
            </ListItem>
          {/each}
        </div>
      {/if}

      {#if state === 'tarif'}
        <div in:fly|local={{ x: 200 }}>
          <ListItem dense on:click={() => (state = 'main')}>
            <span slot="prepend">
              <IconLink icon={faAngleLeft} size="1.2em" class="mr-4" />
            </span>
            <span class="text-subtitle-2">
              Tarif de {subscribe?.user?.name || subscribe?.name}
            </span>
          </ListItem>

          {#each $troc.tarif as tarif}
            <ListItem
              disabled={tarif._id === subscribe?.tarifId}
              on:click={() =>
                subscribe &&
                $assignTarif.mutate({
                  subscribeId: subscribe._id,
                  tarifId: tarif._id || '',
                })}
            >
              {tarif.name}
              <span slot="append">
                {#if tarif._id === subscribe?.tarifId}
                  <IconLink icon={faCheckCircle} size="1.1em" />
                {/if}
              </span>
            </ListItem>
          {/each}
        </div>
      {/if}
    </List>
  </div>
{/if}

<style>
  .s-menu {
    overflow: hidden;
  }
</style>
