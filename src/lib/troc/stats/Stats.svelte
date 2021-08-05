<script lang="ts">
  import {
    Button,
    Radio,
    ButtonGroup,
    ButtonGroupItem,
  } from 'svelte-materialify'

  import { useQuery } from '@sveltestack/svelte-query'

  import type { TrocStats, PaymentInterface, Article } from 'types'
  import type { TrocStatsFormatted } from './formatStats'

  import { getTrocStats } from '$lib/troc/api'
  import ExpansionCard from '$lib/util/ExpansionCard.svelte'
  import { troc } from '$lib/troc/store'
  import UserSelect from '$lib/user/Select.svelte'
  import { formatStats } from './formatStats'
  import Loader from '$lib/util/Loader.svelte'
  import PlotStock from './PlotStock.svelte'
  import PlotConsommation from './PlotConsommation.svelte'
  import PlotCash from './PlotCash.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import {
    faCashRegister,
    faShoppingCart,
    faTruck,
  } from '@fortawesome/free-solid-svg-icons'

  // Selections
  let selectedView = 'global'
  let selectedUser = ''
  let searchUser = ''

  // Donnée
  let stats: TrocStatsFormatted | null = null

  const queryKey = [
    'trocStats',
    { trocId: $troc._id, view: selectedView, userId: selectedUser },
  ]

  const queryStats = useQuery({
    queryFn: getTrocStats,
    queryKey,
    onSuccess,
    refetchOnWindowFocus: false,
  })

  function load() {
    if (selectedView === 'user' && !selectedUser) return
    queryKey[1] = {
      trocId: $troc._id,
      view: selectedView,
      userId: selectedUser,
    }
    $queryStats.refetch()
  }

  $: if (selectedView) load()

  function selectUser(e: { detail: { _id: string } }) {
    selectedView = 'user'
    selectedUser = e.detail._id
    load()
  }

  /** Callback sur la réponse du server */
  function onSuccess(statsBrut: TrocStats) {
    stats = formatStats(statsBrut)
  }
</script>

<div style="max-width: 1000px; margin: auto;">
  <h6 class="mb-5">Statistique du troc</h6>
  <div class="d-flex">
    <Radio bind:group={selectedView} value="user">
      <UserSelect modeSelect on:select={selectUser} bind:search={searchUser} />
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
            <b>{stats.numbers.provided + stats.numbers.proposed}</b>
            propositions pour une valeur total de
            <b>
              {Math.round((stats.sums.provided + stats.sums.proposed) * 100) /
                100}</b
            >
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
            <b>{stats.numbers.buyed}</b> achats pour un valeur total de
            <b>{Math.round(stats.sums.buyed * 100) / 100}</b>
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
            <b>{stats.numbers.payment}</b>
            <span style="color: green;">
              <i class="fas fa-chevron-up" />
              {stats.numbers.paymentPositif}
            </span>
            <span style="color: red;">
              <i class="fas fa-chevron-down" />
              {stats.numbers.paymentNegatif}
            </span>
            pour une valeur total de
            <b>{stats.sums.payment.toFixed(2)}</b>
            <span style="color: green;">
              <i class="fas fa-chevron-up" />
              {stats.sums.paymentPositif.toFixed(2)}
            </span>
            <span style="color: red;">
              <i class="fas fa-chevron-down" />
              {stats.sums.paymentNegatif.toFixed(2)}
            </span>
            <span style="color: blue;">
              <i class="fas fa-angle-right" />
              {(stats.sums.paymentPositif - stats.sums.paymentNegatif).toFixed(
                2
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
