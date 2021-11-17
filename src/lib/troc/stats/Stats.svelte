<script lang="ts">
  import { Radio } from 'svelte-materialify'
  import { useQuery } from '@sveltestack/svelte-query'
  import {
    faCashRegister,
    faShoppingCart,
    faTruck,
    faUser,
  } from '@fortawesome/free-solid-svg-icons'

  import type {
    TrocStats,
    PaymentInterface,
    Article,
    SubscribeLookup,
  } from 'types'
  import type { TrocStatsFormatted } from './formatStats'
  import { getTrocStats } from '$lib/troc/api'
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

  // Selections
  let selectedView = 'global'
  let selectedSubscribeId = ''
  let searchUser = ''

  // Donnée
  let stats: TrocStatsFormatted | null = null

  const queryKey = [
    'trocStats',
    { trocId: $troc._id, view: selectedView, subscribeId: selectedSubscribeId },
  ]

  const queryStats = useQuery({
    queryFn: getTrocStats,
    queryKey,
    onSuccess,
    refetchOnWindowFocus: false,
  })

  function load() {
    if (selectedView === 'subscribe' && !selectedSubscribeId) return
    queryKey[1] = {
      trocId: $troc._id,
      view: selectedView,
      subscribeId: selectedSubscribeId,
    }
    $queryStats.refetch()
  }

  $: if (selectedView) load()

  function selectUserSub(e: { detail: { _id: string } }) {
    selectedView = 'subscribe'
    selectedSubscribeId = e.detail._id
    load()
  }

  /** Callback sur la réponse du server */
  function onSuccess(statsBrut: TrocStats) {
    stats = formatStats(statsBrut)
  }
</script>

<div style="max-width: 1000px; margin: auto; padding-bottom: 250px;">
  <h6 class="mb-5">Statistique du troc</h6>
  <div class="d-flex">
    <Radio bind:group={selectedView} value="subscribe">
      <MagicSelect
        modeSelect
        on:select={selectUserSub}
        bind:search={searchUser}
        path="/subscribes"
        searchKey="q"
        queryParams={{ exact_trocId: $troc._id }}
        getValue={(sub) => sub.user?.name || sub.name}
        getValue2={(sub) => sub.user?.mail || ''}
        getKey={(sub) => sub._id || ''}
        solo
        keepValue
        icon={faUser}
      />
    </Radio>
    <div style="width: 36px;" />
    <Radio bind:group={selectedView} value="global">
      Tous les participants
    </Radio>
    <div style="width: 36px;" />

    <Radio bind:group={selectedView} value="traders">Commerçants</Radio>
    <div style="width: 36px;" />

    <Radio bind:group={selectedView} value="privates">Particuliers</Radio>
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
