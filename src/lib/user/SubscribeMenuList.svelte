<script lang="ts">
  import { fly } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  import { params, url } from '@roxi/routify'
  import {
    faAngleLeft,
    faAngleRight,
    faCashRegister,
    faCubes,
    faEdit,
  } from '@fortawesome/free-solid-svg-icons'
  import {
    faCheckCircle,
    faEnvelope,
  } from '@fortawesome/free-regular-svg-icons'
  import { mdiCart } from '@mdi/js'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'

  import { Icon, List, ListItem } from '$material'
  import IconLink from '$lib/util/IconLink.svelte'
  import type { SubscribeLookup, ISubscribe, RoleEnum } from 'types'
  import { troc } from '$lib/troc/store'
  import { api } from '$lib/api'
  import { ROLES } from '$lib/user/roles'
  import notify from '$lib/notify'

  export let state: 'main' | 'role' | 'tarif' = 'main'
  export let subscribe: SubscribeLookup | undefined = undefined
  export let dense = false

  interface EventsMap {
    soldCorrection: void
    roleSelect: void
    tarifSelect: void
    sendMail: void
    prefixClick: void
  }
  const dispatch = createEventDispatcher<EventsMap>()
  const queryClient = useQueryClient()

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

<List style="overflow-x: hidden;" {dense}>
  {#if state === 'main'}
    <div in:fly|local={{ x: -200 }}>
      <ListItem disabled dense>
        <span class="text-subtitle-2">
          {subscribe?.user?.name || subscribe?.name}
        </span>
      </ListItem>

      {#if subscribe?.userId}
        <ListItem on:click={() => (state = 'role')}>
          Assigner un rôle
          <span slot="append">
            <IconLink icon={faAngleRight} size="1.1em" class="ml-2" />
          </span>
        </ListItem>
      {/if}

      <ListItem on:click={() => (state = 'tarif')}>
        Attribuer un tarif
        <span slot="append">
          <IconLink icon={faAngleRight} size="1.1em" class="ml-2" />
        </span>
      </ListItem>

      {#if subscribe?.role === 'trader'}
        <ListItem on:click={() => dispatch('prefixClick')}>
          <span slot="prepend" class="prefix mr-3">
            {subscribe.prefix}
          </span>
          Changer le prefix
        </ListItem>
      {/if}

      <ListItem
        href={$url('/admin/management_articles', {
          trocId: $params.trocId,
          exact_buyerSubId: subscribe?._id,
        })}
      >
        <span slot="prepend">
          <Icon path={mdiCart} class="mr-3" size="1.1em" />
        </span>
        Vers les achats
      </ListItem>
      <ListItem
        href={$url('/admin/management_articles', {
          trocId: $params.trocId,
          exact_providerSubId: subscribe?._id,
        })}
      >
        <span slot="prepend">
          <IconLink icon={faCubes} class="mr-3" size="1.1em" />
        </span>
        Vers les articles
      </ListItem>
      <ListItem
        href={$url('/admin/cash_register', {
          trocId: $params.trocId,
          client_subscribe_id: subscribe?._id,
        })}
      >
        <span slot="prepend">
          <IconLink icon={faCashRegister} class="mr-3" size="1.1em" />
        </span>
        Vers la caisse
      </ListItem>
      <ListItem on:click={() => dispatch('soldCorrection')}>
        <span slot="prepend">
          <IconLink icon={faEdit} class="mr-3" size="1.1em" />
        </span>
        Corriger le solde
      </ListItem>
      <a
        href="mailto:{subscribe?.user?.mail}?subject=Troc.io - {$troc.name}"
        target="_blank"
        on:click={(event) => {
          dispatch('sendMail')
          if (!subscribe?.validedByUser) {
            const msg = `Vous ne pouvez pas envoyer un mail à cet utilisateur car il n'a pas validé sa participation.`
            notify.warning(msg)
            event.preventDefault()
          }
        }}
      >
        <ListItem>
          <span slot="prepend">
            <IconLink icon={faEnvelope} class="mr-3" size="1.1em" />
          </span>
          Envoyer un mail
        </ListItem>
      </a>
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

      {#each ROLES as { label, icon, key }}
        <ListItem
          active={key === subscribe?.role}
          disabled={key === subscribe?.role}
          on:click={() => {
            $assignRole.mutate({
              subscribeId: subscribe?._id || '',
              role: key,
            })
            dispatch('roleSelect')
          }}
        >
          <span slot="prepend">
            {#if icon}
              <IconLink {icon} size="1.1em" class="mr-4" />
            {/if}
          </span>
          {label}
          <div class="flex-grow-1" />
          <span slot="append">
            {#if key === subscribe?.role}
              <IconLink icon={faCheckCircle} size="1em" />
            {/if}
          </span>
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
          active={tarif._id === subscribe?.tarifId}
          on:click={() => {
            $assignTarif.mutate({
              subscribeId: subscribe?._id || '',
              tarifId: tarif._id || '',
            })
            dispatch('tarifSelect')
          }}
        >
          {tarif.name}

          <span slot="append">
            {#if tarif._id === subscribe?.tarifId}
              <IconLink icon={faCheckCircle} size="1em" />
            {/if}
          </span>
        </ListItem>
      {/each}
    </div>
  {/if}
</List>

<style>
  .prefix {
    display: grid;
    place-content: center;
    font-size: small;
    font-weight: bold;
    border: solid 1px var(--theme-text-fields-outlined);
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }
</style>
