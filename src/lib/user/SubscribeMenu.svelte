<script lang="ts">
  import { fade, fly } from 'svelte/transition'
  import { List, ListItem } from 'svelte-materialify'
  import { debounce } from 'debounce'
  import {
    faAngleLeft,
    faAngleRight,
    faUserAlt,
    faUserTie,
    faUserTag,
    faUserCog,
  } from '@fortawesome/free-solid-svg-icons'
  import { faCheckCircle } from '@fortawesome/free-regular-svg-icons'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'

  import IconLink from '$lib/util/IconLink.svelte'
  import type { SubscribeLookup, SubscribeBase, ISubscribe } from 'types'
  import notify from '$lib/notify'
  import { troc } from '$lib/troc/store'
  import { api } from '$lib/api'

  export let active = false
  export let state: 'main' | 'role' | 'tarif' = 'main'
  export let subscribe: SubscribeLookup | undefined = undefined

  let position = { x: 0, y: 0 }
  let mouseIn = false
  const queryClient = useQueryClient()

  const ROLES = [
    { name: '', label: 'Participant', icon: faUserAlt },
    { name: '', label: 'Commerçant', icon: faUserTie },
    { name: '', label: 'Caissier', icon: faUserTag },
    { name: '', label: 'Administrateur', icon: faUserCog },
  ]

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

  interface AssignTarifBody extends SubscribeBase {
    tarifId: string
  }

  const assignTarif = useMutation(
    (data: AssignTarifBody) =>
      api<AssignTarifBody, ISubscribe>('/api/subscribes/tarif', {
        method: 'post',
        data,
        success: `Nouveau tarif attribué à ${subscribe?.user.name}`,
      }),
    {
      onSuccess: (data) => {
        if (subscribe) subscribe.tarifId = data.tarifId
        queryClient.invalidateQueries('subscribes')
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
            <span class="text-caption">{subscribe?.user.name}</span>
          </ListItem>
          <ListItem on:click={() => notify.info('TODO')}>
            Voir les achats
          </ListItem>
          <ListItem on:click={() => notify.info('TODO')}>
            Voir les propositions
          </ListItem>
          <ListItem on:click={() => (state = 'role')}>
            Assigner un rôle
            <span slot="append">
              <IconLink icon={faAngleRight} size="1.2em" class="ml-2" />
            </span>
          </ListItem>
          <ListItem on:click={() => (state = 'tarif')}>
            Attribuer un tarif
            <span slot="append">
              <IconLink icon={faAngleRight} size="1.2em" class="ml-2" />
            </span>
          </ListItem>
          <ListItem on:click={() => notify.info('TODO')}>
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
            <span class="text-caption">Rôle de {subscribe?.user.name}</span>
          </ListItem>

          {#each ROLES as { label, icon }}
            <ListItem on:click={() => notify.info('TODO')}>
              <span slot="prepend">
                <IconLink {icon} size="1.2em" class="mr-4" />
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
            <span class="text-caption">Tarif de {subscribe?.user.name}</span>
          </ListItem>

          {#each $troc.tarif as tarif}
            <ListItem
              on:click={() =>
                $assignTarif.mutate({
                  trocId: $troc._id,
                  userId: subscribe?.userId || '',
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
