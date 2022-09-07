<script lang="ts">
  import { fly } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  import { Icon, List, ListItem } from 'svelte-materialify'
  import { params, url, goto } from '@roxi/routify'
  import {
    faAngleLeft,
    faAngleRight,
    faCashRegister,
    faCubes,
    faEdit,
  } from '@fortawesome/free-solid-svg-icons'
  import { faCheckCircle } from '@fortawesome/free-regular-svg-icons'
  import { mdiCart } from '@mdi/js'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'

  import IconLink from '$lib/util/IconLink.svelte'
  import type { SubscribeLookup, ISubscribe, RoleEnum } from 'types'
  import { troc } from '$lib/troc/store'
  import { api } from '$lib/api'
  import { ROLES } from '$lib/user/roles'
  import PaymentDialog from '$lib/cash/PaymentDialog.svelte'

  export let state: 'main' | 'role' | 'tarif' = 'main'
  export let subscribe: SubscribeLookup | undefined = undefined

  interface EventsMap {
    done: void
  }
  const dispatch = createEventDispatcher<EventsMap>()

  const queryClient = useQueryClient()

  let paymentDialog: PaymentDialog

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

  function handleClickSoldCorrection() {
    paymentDialog.open(subscribe, 'Correction du solde')
    dispatch('done')
  }
</script>

<PaymentDialog bind:this={paymentDialog} />

<List>
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

      <ListItem
        on:click={() =>
          $goto($url('/admin/management_articles'), {
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
        on:click={() =>
          $goto($url('/admin/management_articles'), {
            trocId: $params.trocId,
            exact_providerSubId: subscribe?._id,
          })}
      >
        <span slot="prepend">
          <IconLink icon={faCubes} class="mr-3 mt-0 mb-0" size="1.1em" />
        </span>
        Vers les articles
      </ListItem>
      <ListItem
        on:click={() =>
          $goto($url('/admin/cash_register'), {
            trocId: $params.trocId,
            client_subscribe_id: subscribe?._id,
          })}
      >
        <span slot="prepend">
          <IconLink icon={faCashRegister} class="mr-3" size="1.1em" />
        </span>
        Vers la caisse
      </ListItem>
      <ListItem on:click={handleClickSoldCorrection}>
        <span slot="prepend">
          <IconLink icon={faEdit} class="mr-3" size="1.1em" />
        </span>
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

      {#each ROLES as { label, icon, key }}
        <ListItem
          active={key === subscribe?.role}
          disabled={key === subscribe?.role}
          on:click={() =>
            subscribe &&
            $assignRole.mutate({
              subscribeId: subscribe._id,
              role: key,
            })}
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
              <IconLink icon={faCheckCircle} size="1em" />
            {/if}
          </span>
        </ListItem>
      {/each}
    </div>
  {/if}
</List>
