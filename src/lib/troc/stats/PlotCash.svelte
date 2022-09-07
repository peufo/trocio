<script lang="ts">
  import { onMount } from 'svelte'
  import { faChartBar, faChartArea } from '@fortawesome/free-solid-svg-icons'
  import { grey } from 'svelte-materialify/src/utils/colors'
  import Plotly from 'plotly.js-dist'

  // For use typescript
  // import * as Plotly from 'plotly.js'

  import IconLink from '$lib/util/IconLink.svelte'
  import { isDarkTheme } from '$lib/store/layout'
  import { troc } from '$lib/troc/store'
  import type { TrocStatsFormatted } from './formatStats'

  export let stats: TrocStatsFormatted

  let isLoading = true
  let isMounted = false
  let containerPlot: HTMLDivElement

  onMount(() => {
    setTimeout(() => (isMounted = true), 300)
  })

  $: if (isMounted && ($isDarkTheme || true)) load()

  function load() {
    isLoading = true
    loadPlot().then(() => (isLoading = false))
  }

  function loadPlot() {
    return new Promise((resolve) => {
      const layout = getLayout()
      const traces = getTraces()
      const config = { responsive: true, displayModeBar: false }
      Plotly.newPlot(containerPlot, traces, layout, config)
      resolve(true)
    })
  }

  function getLayout(): Partial<Plotly.Layout> {
    const layout: Partial<Plotly.Layout> = {
      paper_bgcolor: grey[$isDarkTheme ? 'darken-4' : 'lighten-5'],
      plot_bgcolor: grey[$isDarkTheme ? 'darken-3' : 'lighten-4'],
      font: { color: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'] },
      margin: { t: 30, l: 60, r: 30 },
      height: 650,
      yaxis: { title: 'Montant', domain: [0, 0.7] },
      yaxis2: { title: 'Opé. par heure', domain: [0.75, 1] },
      legend: {
        orientation: 'h',
        xanchor: 'center',
        x: 0.5,
        yanchor: 'bottom',
        y: 1.03,
      },
      annotations: [],
    }

    //add shedule range and annotations
    if ($troc?.schedule?.length) {
      if (layout.xaxis?.range)
        layout.xaxis.range = [
          new Date($troc.schedule[0].open).getTime() - 1000 * 60 * 60 * 24,
          new Date($troc.schedule[$troc.schedule.length - 1].close).getTime() +
            1000 * 60 * 60 * 6,
        ]

      layout.annotations?.push({
        text: 'Ouverture',
        arrowcolor: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'],
        x: $troc.schedule[0].open,
        y: 0,
      })
      layout.annotations?.push({
        text: 'Fermeture',
        arrowcolor: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'],
        x: $troc.schedule[$troc.schedule.length - 1].close,
        y: 0,
      })
    }

    return layout
  }

  function getTraces(): Partial<Plotly.ScatterData>[] {
    const solde = {
      name: 'Solde',
      x: [] as Date[],
      y: [] as number[],
      text: [] as string[],
    }

    const pay = {
      name: 'Paiements',
      x: [] as Date[],
      y: [] as number[],
      text: [] as string[],
    }

    const validedFrequency = {
      name: 'Mise en vente',
      yaxis: 'y2',
      stackgroup: 'one',
      x: [] as number[],
      y: [] as number[],
    }

    const buyFrequency = {
      name: 'Achat',
      yaxis: 'y2',
      stackgroup: 'one',
      x: [] as number[],
      y: [] as number[],
    }

    const recoverFrequency = {
      name: 'Récupération',
      yaxis: 'y2',
      stackgroup: 'one',
      x: [] as number[],
      y: [] as number[],
    }

    const paymentFrequency = {
      name: 'Paiements',
      yaxis: 'y2',
      stackgroup: 'one',
      x: [] as number[],
      y: [] as number[],
    }

    let cursorSolde = 0
    let cursorPay = 0

    const frequenceTime = 1000 * 60 * 60 // one houre
    const eventsValided = stats.events.filter(
      ({ event }) => event === 'valided'
    )

    // No work if no chasher events
    if (!eventsValided.length) return []

    const startTime =
      Math.round(eventsValided[0].time / frequenceTime) * frequenceTime
    const endTime =
      Math.round(stats.events[stats.events.length - 1].time / frequenceTime) *
      frequenceTime
    let currentTimeIndex = 0

    for (
      let currentTime = startTime;
      currentTime < endTime;
      currentTime += frequenceTime
    ) {
      validedFrequency.y[currentTimeIndex] = 0
      buyFrequency.y[currentTimeIndex] = 0
      recoverFrequency.y[currentTimeIndex] = 0
      paymentFrequency.y[currentTimeIndex] = 0

      validedFrequency.x[currentTimeIndex] = currentTime
      buyFrequency.x[currentTimeIndex] = currentTime
      recoverFrequency.x[currentTimeIndex] = currentTime
      paymentFrequency.x[currentTimeIndex] = currentTime

      currentTimeIndex++
    }

    stats.events
      .filter(({ event }) =>
        ['valided', 'sold', 'buyed', 'recover', 'payment'].includes(event)
      )
      .forEach((event) => {
        currentTimeIndex = Math.round((event.time - startTime) / frequenceTime)

        if (event.pay && event.event === 'payment') {
          cursorPay += event.pay.amount
          solde.text.push(``)
          pay.text.push(
            event.pay.amount > 0
              ? `Paiement de ${event.pay.amount}<br>${event.pay.message}`
              : `Remboursement de ${event.pay.amount}<br>${event.pay.message}`
          )

          paymentFrequency.y[currentTimeIndex]++
        }

        if (event.art) {
          switch (event.event) {
            case 'valided':
              cursorSolde += event.art.fee
              solde.text.push(`Mise en vente de ${event.art.name}`)
              pay.text.push(``)

              validedFrequency.y[currentTimeIndex]++

              break

            case 'sold':
              cursorSolde -= event.art.price
              cursorSolde += event.art.margin
              solde.text.push(`Vente de ${event.art.name}`)
              pay.text.push(``)

              break

            case 'buyed':
              cursorSolde += event.art.price
              solde.text.push(`Achat de ${event.art.name}`)
              pay.text.push(``)

              buyFrequency.y[currentTimeIndex]++

              break

            case 'recover':
              recoverFrequency.y[currentTimeIndex]++

              break

            case 'payment':
              break
          }
        }

        solde.y.push(cursorSolde)
        solde.x.push(event.date)

        pay.y.push(cursorPay)
        pay.x.push(event.date)
      })

    return [
      pay,
      solde,
      validedFrequency,
      buyFrequency,
      recoverFrequency,
      paymentFrequency,
    ]
  }
</script>

<div bind:this={containerPlot} class="plot" />

{#if isLoading}
  <div class="centered" style="height: 665px;">
    <IconLink icon={faChartBar} size="2em" />
  </div>
{/if}
