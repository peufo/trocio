<script lang="ts">
  import { Divider, Radio } from 'svelte-materialify'
  import { useQuery } from '@sveltestack/svelte-query'
  import {
    faCashRegister,
    faShoppingCart,
    faTruck,
    faUser,
  } from '@fortawesome/free-solid-svg-icons'

  import type { TrocStats } from 'types'
  import type { TrocStatsFormatted } from './formatStats'
  import ExpansionCard from '$lib/util/ExpansionCard.svelte'
  import { troc } from '$lib/troc/store'
  import MagicSelect from '$lib/util/MagicSelect.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import PlotStock from './PlotStock.svelte'
  import PlotConsommation from './PlotConsommation.svelte'
  import PlotCash from './PlotCash.svelte'
  import { formatStats } from './formatStats'
  import { renderAmount } from '$lib/utils'
  import { useApi } from '$lib/api'

  let selectedSubscribeId = ''
  let stats: TrocStatsFormatted | null = null

  $: queryStats = useApi<{ trocId: string; subscribeId?: string }, TrocStats>({
    queryKey: [
      'trocs/byId/stats',
      {
        trocId: $troc._id,
        subscribeId: selectedSubscribeId,
      },
    ],
    onSuccess: (statsBrut) => {
      stats = formatStats(statsBrut)
    },
    refetchOnWindowFocus: false,
  })

  function selectUserSub(e: { detail: { _id: string } }) {
    selectedSubscribeId = e.detail._id
  }
</script>

<div style="max-width: 1000px; margin: auto; padding-bottom: 250px;">
  <h6 class="mb-5">Statistique du troc</h6>
  <div class="d-flex">
    <MagicSelect
      modeSelect
      placeholder="Participant"
      on:select={selectUserSub}
      path="/subscribes"
      searchKey="q"
      queryParams={{ exact_trocId: $troc._id }}
      getValue={(sub) => sub.user?.name || sub.name}
      getValue2={(sub) => sub.user?.mail || ''}
      getKey={(sub) => sub._id || ''}
      solo
      keepValue
      icon={faUser}
      class="mr-3"
    />

    <Divider vertical />

    <div class="pa-4">TODO: filtre par tarif et par rôle</div>
  </div>

  <br /><br />

  {#if $queryStats.isFetching || !stats}
    <div class="loadingContainer">
      <Loader />
    </div>
  {:else}
    <ExpansionCard title="Approvisionement">
      <span slot="icon">
        <IconLink icon={faTruck} class="mr-2" />
      </span>
      <span slot="subtitle">
        {#if stats.articlesProposed.length}
          <span>
            <b>
              {(
                stats.numbers.provided + stats.numbers.proposed
              ).toLocaleString()}
            </b>
            propositions pour une valeur total de
            <b>
              {renderAmount(
                stats.sums.provided + stats.sums.proposed,
                $troc.currency
              )}
            </b>
          </span>
        {:else}
          <span>Aucun article proposé</span>
        {/if}
      </span>

      <PlotStock {stats} />
    </ExpansionCard>

    <br />

    <ExpansionCard title="Consommation">
      <span slot="icon">
        <IconLink icon={faShoppingCart} class="mr-2" />
      </span>
      <span slot="subtitle">
        {#if stats?.articlesSolded.length}
          <span>
            <b>{stats.numbers.buyed.toLocaleString()}</b> achats pour un valeur
            total de
            <b>
              {renderAmount(stats.sums.buyed, $troc.currency)}
            </b>
          </span>
        {:else}
          <span>Aucun article acheté</span>
        {/if}
      </span>

      <PlotConsommation {stats} />
    </ExpansionCard>

    <br />

    <ExpansionCard title="Caisse">
      <span slot="icon">
        <IconLink icon={faCashRegister} class="mr-2" />
      </span>
      <span slot="subtitle">
        {#if stats.numbers.payment}
          <span>
            <b>{stats.numbers.payment.toLocaleString()}</b>
            <span class="ml-2" style="color: green;">
              <i class="fas fa-chevron-up" />
              {stats.numbers.paymentPositif.toLocaleString()}
            </span>
            <span class="ml-2 mr-2" style="color: red;">
              <i class="fas fa-chevron-down" />
              {stats.numbers.paymentNegatif.toLocaleString()}
            </span>
            paiements pour une valeur total de
            <b>
              {renderAmount(stats.sums.payment, $troc.currency)}
            </b>
            <span class="ml-2" style="color: green;">
              <i class="fas fa-chevron-up" />
              {renderAmount(stats.sums.paymentPositif, $troc.currency)}
            </span>
            <span class="ml-2" style="color: red;">
              <i class="fas fa-chevron-down" />
              {renderAmount(stats.sums.paymentNegatif, $troc.currency)}
            </span>
            <span class="ml-2" style="color: blue;">
              <i class="fas fa-angle-right" />
              {renderAmount(
                stats.sums.paymentPositif - stats.sums.paymentNegatif,
                $troc.currency
              )}
            </span>
          </span>
        {:else}
          <span>Aucun paiement</span>
        {/if}
      </span>

      <PlotCash {stats} />
    </ExpansionCard>
  {/if}
</div>

<style>
  .loadingContainer {
    display: grid;
    justify-items: center;
    min-height: 800px;
  }

  :global(.plot .main-svg) {
    border-radius: 4px;
  }
</style>
