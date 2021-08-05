<script lang="ts">
  import { onMount } from 'svelte'
  import { ButtonGroup, ButtonGroupItem } from 'svelte-materialify'
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

  let mode: 'sums' | 'numbers' = 'numbers'
  let isLoading = true
  let isMounted = false
  let containerPlotStock: HTMLDivElement
  let containerHisto: HTMLDivElement
  onMount(() => {
    setTimeout(() => (isMounted = true), 300)
  })

  $: if (isMounted && ($isDarkTheme || true)) load()

  function load() {
    isLoading = true
    Promise.all([loadPlotStock(), loadHisto()]).then(() => {
      isLoading = false
    })
  }

  function loadPlotStock() {
    return new Promise((resolve) => {
      const layout = getLayout()
      const traces = getScatterTraces()
      const pie = getPieTrace()
      Plotly.newPlot(containerPlotStock, [...traces, pie], layout)
      resolve(true)
    })
  }

  function loadHisto() {
    return new Promise((resolve) => {
      const layout = getLayoutHisto()
      const traces = getHistoTraces()
      Plotly.newPlot(containerHisto, traces, layout)
      resolve(true)
    })
  }

  function getPieTrace(): Partial<Plotly.PieData> {
    return {
      labels: ['Proposé', 'En vente', 'Vendu', 'Récupéré'],
      marker: {
        colors: [
          'rgb(200, 200, 200)',
          'rgb(33, 119, 181)',
          'rgb(44, 160, 43)',
          'rgb(255, 127, 14)',
        ],
      },
      textinfo: 'value+percent',
      hoverinfo: 'none',
      type: 'pie',
      hole: 0.2,
      domain: {
        x: [0.8, 1],
        y: [0, mode === 'numbers' ? 1 : 0.7],
      },
      showlegend: false,
      values: [
        stats[mode].proposed,
        stats[mode].provided - stats[mode].solded - stats[mode].recovered,
        stats[mode].solded,
        stats[mode].recovered,
      ],
    }
  }

  function getScatterTraces(): Partial<Plotly.ScatterData>[] {
    const baseTrace = () => ({
      stackgroup: 'one',
      x: [] as Date[],
      y: [] as number[],
      text: [] as string[],
      domain: { columns: 0 },
    })

    const proposed = {
      ...baseTrace(),
      name: 'Proposé',
      marker: { color: 'rgb(200, 200, 200)' },
    }

    const available = {
      ...baseTrace(),
      name: 'En vente',
      marker: { color: 'rgb(33, 119, 181)' },
    }

    const solded = {
      ...baseTrace(),
      name: 'Vendu',
      marker: { color: 'rgb(44, 160, 43)' },
    }

    const recover = {
      ...baseTrace(),
      name: 'Récupéré',
      marker: { color: 'rgb(255, 127, 14)' },
    }

    const fees = {
      ...baseTrace(),
      name: 'Frais',
      yaxis: 'y2',
      marker: { color: 'rgb(140, 86, 75)' },
      stackgroup: 'two',
    }

    const margins = {
      ...baseTrace(),
      name: 'Marge',
      yaxis: 'y2',
      marker: { color: 'rgb(227, 119, 194)' },
      stackgroup: 'two',
    }

    let cursorFees = 0
    let cursorMargins = 0

    let cursorNumberProposed = 0
    let cursorSumProposed = 0

    let cursorNumberAvailable = 0
    let cursorSumAvailable = 0

    let cursorNumberSolded = 0
    let cursorSumSolded = 0

    let cursorNumberRecover = 0
    let cursorSumRecover = 0

    stats.events
      .filter(({ event }) =>
        ['createdAt', 'valided', 'sold', 'recover'].includes(event)
      )
      .forEach((event) => {
        if (!event.art) return
        switch (event.event) {
          case 'createdAt':
            cursorNumberProposed++
            cursorSumProposed += event.art.price

            proposed.text.push(event.art.name)
            available.text.push('')
            solded.text.push('')
            recover.text.push('')

            fees.text.push(``)
            margins.text.push(``)
            break

          case 'valided':
            cursorNumberProposed--
            cursorSumProposed -= event.art.price
            cursorNumberAvailable++
            cursorSumAvailable += event.art.price
            cursorFees += event.art.fee

            proposed.text.push('')
            available.text.push(event.art.name)
            solded.text.push('')
            recover.text.push('')

            fees.text.push(`Mise en vente de ${event.art.name}`)
            margins.text.push(``)
            break

          case 'sold':
            cursorNumberAvailable--
            cursorSumAvailable -= event.art.price
            cursorNumberSolded++
            cursorSumSolded += event.art.price
            cursorMargins += event.art.margin

            proposed.text.push('')
            available.text.push('')
            solded.text.push(event.art.name)
            recover.text.push('')

            fees.text.push(``)
            margins.text.push(`Vente de ${event.art.name}`)
            break

          case 'recover':
            cursorNumberAvailable--
            cursorSumAvailable -= event.art.price
            cursorNumberRecover++
            cursorSumRecover += event.art.price

            proposed.text.push('')
            available.text.push('')
            solded.text.push('')
            recover.text.push(event.art.name)

            fees.text.push(``)
            margins.text.push(``)
            break
        }

        proposed.x.push(event.date)
        proposed.y.push(
          mode === 'sums' ? cursorSumProposed : cursorNumberProposed
        )

        available.x.push(event.date)
        available.y.push(
          mode === 'sums' ? cursorSumAvailable : cursorNumberAvailable
        )

        solded.x.push(event.date)
        solded.y.push(mode === 'sums' ? cursorSumSolded : cursorNumberSolded)

        recover.x.push(event.date)
        recover.y.push(mode === 'sums' ? cursorSumRecover : cursorNumberRecover)

        fees.x.push(event.date)
        fees.y.push(cursorFees)

        margins.x.push(event.date)
        margins.y.push(cursorMargins)
      })

    if (mode === 'numbers') return [recover, solded, available, proposed]
    return [recover, solded, available, proposed, fees, margins]
  }

  function getLayout(): Partial<Plotly.Layout> {
    const layout: Partial<Plotly.Layout> = {
      paper_bgcolor: grey[$isDarkTheme ? 'darken-3' : 'lighten-5'],
      plot_bgcolor: grey[$isDarkTheme ? 'darken-2' : 'lighten-4'],
      font: { color: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'] },
      yaxis: { title: 'Nombre' },
      legend: {
        orientation: 'h',
        xanchor: 'center',
        x: 0.5,
        yanchor: 'bottom',
        y: 1.15,
      },
      grid: { columns: 2 },
      xaxis: {
        domain: [0, 0.7],
        range: [],
      },
      margin: { t: 80 },
      annotations: [],
    }

    if ($troc?.schedule?.length) {
      layout.annotations = [
        {
          text: 'Ouverture',
          arrowcolor: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'],
          x: $troc.schedule[0].open,
        },
        {
          text: 'Fermeture',
          arrowcolor: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'],
          x: $troc.schedule[$troc.schedule.length - 1].close,
        },
      ]
      if (layout.xaxis)
        layout.xaxis.range = [
          new Date($troc.schedule[0].open).getTime() - 1000 * 60 * 60 * 24,
          new Date($troc.schedule[$troc.schedule.length - 1].close).getTime() +
            1000 * 60 * 60 * 6,
        ]
    }
    if (mode === 'sums') {
      layout.yaxis = { domain: [0, 0.7], title: 'Valeur' }
      layout.yaxis2 = { domain: [0.75, 1] }
      if (layout.annotations)
        layout.annotations.push(
          {
            text: `<span>Marge<br>Frais<br>Total</span>`,
            x: 0.9,
            xref: 'paper',
            xanchor: 'left',
            y: 0.98,
            yref: 'paper',
            yanchor: 'middle',
            align: 'left',
            showarrow: false,
          },
          {
            text: `
              <b>${stats.sums.margin.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}<br>
              ${stats.sums.fee.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}<br>
              ${(stats.sums.fee + stats.sums.margin).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}<br>
              </b>`,
            x: 0.9,
            xref: 'paper',
            xanchor: 'right',
            y: 0.95,
            yref: 'paper',
            yanchor: 'middle',
            align: 'right',
            showarrow: false,
          }
        )
    }
    return layout
  }

  function getLayoutHisto(): Partial<Plotly.Layout> {
    const layout: Partial<Plotly.Layout> = {
      paper_bgcolor: grey[$isDarkTheme ? 'darken-3' : 'lighten-5'],
      plot_bgcolor: grey[$isDarkTheme ? 'darken-2' : 'lighten-4'],
      font: { color: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'] },
      barmode: 'stack',
      legend: {
        orientation: 'h',
        xanchor: 'center',
        x: 0.5,
        yanchor: 'bottom',
        y: 1.15,
      },
      xaxis: {
        title: 'Valeur',
        range: [0, (stats.sums.provided / stats.numbers.provided) * 3],
      },
      yaxis: { title: 'Nombre' },
      margin: { t: 80 },
      annotations: [
        {
          text: ` Moy. mis en vente: <b>${(
            stats.sums.provided / stats.numbers.provided
          ).toLocaleString(undefined, { maximumFractionDigits: 1 })}</b>`,
          x: stats.sums.provided / stats.numbers.provided,
          y: 0,
          arrowhead: 0,
          arrowcolor: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'],
          textangle: '-45',
          xanchor: 'left',
          ax: 30,
          ay: -30,
        },
        {
          text: ` Moy. vendu: <b>${(
            stats.sums.solded / stats.numbers.solded
          ).toLocaleString(undefined, { maximumFractionDigits: 1 })}</b>`,
          x: stats.sums.solded / stats.numbers.solded,
          y: 0,
          arrowhead: 0,
          arrowcolor: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'],
          textangle: '-45',
          xanchor: 'left',
          ax: 30,
          ay: -30,
        },
        {
          text: ` Moy. récupéré: <b>${(
            stats.sums.recovered / stats.numbers.recovered
          ).toLocaleString(undefined, { maximumFractionDigits: 1 })}</b>`,
          x: stats.sums.recovered / stats.numbers.recovered,
          y: 0,
          arrowhead: 0,
          arrowcolor: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'],
          textangle: '-45',
          xanchor: 'left',
          ax: 30,
          ay: -30,
        },
      ],
    }
    return layout
  }

  function getHistoTraces(): Partial<Plotly.ScatterData>[] {
    //TODO: Limite price obligé pour éviter que ca rame ... Faire un avertissement ?
    const LIMIT_PRICE = 1000

    const proposed: Partial<Plotly.ScatterData> = {
      name: 'Proposé',
      hoverinfo: 'y',
      marker: { color: 'rgb(200, 200, 200)' },
      x: stats.articlesProposed
        .filter((art) => !art.valided && art.price < LIMIT_PRICE)
        .map((art) => art.price),
      type: 'histogram',
      xbins: { size: 10, start: 0, end: 1000 },
    }

    const available: Partial<Plotly.ScatterData> = {
      name: 'En vente',
      hoverinfo: 'y',
      marker: { color: 'rgb(33, 119, 181)' },
      x: stats.articlesProvided
        .filter((art) => !art.sold && !art.recover && art.price < LIMIT_PRICE)
        .map((art) => art.price),
      type: 'histogram',
      xbins: { size: 10, start: 0, end: 1000 },
    }

    const solded: Partial<Plotly.ScatterData> = {
      name: 'Vendu',
      hoverinfo: 'y',
      marker: { color: 'rgb(44, 160, 43)' },
      x: stats.articlesSolded
        .filter((art) => art.price < LIMIT_PRICE)
        .map((art) => art.price),
      type: 'histogram',
      xbins: { size: 10, start: 0, end: 1000 },
    }

    const recover: Partial<Plotly.ScatterData> = {
      name: 'Récupéré',
      hoverinfo: 'y',
      marker: { color: 'rgb(255, 127, 14)' },
      x: stats.articlesRecovered
        .filter((art) => art.price < LIMIT_PRICE)
        .map((art) => art.price),
      type: 'histogram',
      xbins: { size: 10, start: 0, end: 1000 },
    }

    const traces = []
    if (stats.numbers.recovered) traces.push(recover)
    if (stats.numbers.solded) traces.push(solded)
    if (stats.numbers.provided - stats.numbers.solded - stats.numbers.recovered)
      traces.push(available)
    if (stats.numbers.proposed) traces.push(proposed)

    return traces
  }
</script>

<ButtonGroup
  rounded
  mandatory
  bind:value={mode}
  class="ml-4 mt-4"
  on:change={load}
  style="position: absolute; z-index: 1;"
>
  <ButtonGroupItem value="numbers">Nombre</ButtonGroupItem>
  <ButtonGroupItem value="sums">Valeur</ButtonGroupItem>
</ButtonGroup>

{#if isLoading}
  <div class="centered" style="height: 450px;">
    <IconLink icon={faChartArea} size="2em" />
  </div>
  <div class="centered" style="height: 450px;">
    <IconLink icon={faChartBar} size="2em" />
  </div>
{/if}

<div bind:this={containerPlotStock} class="plot" />
<br />
<div bind:this={containerHisto} class="plot" />
