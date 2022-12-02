<script lang="ts">
  import { onMount } from 'svelte'
  import { faChartBar, faChartArea } from '@fortawesome/free-solid-svg-icons'
  import { grey } from '$material/utils/colors'
  import dayjs from 'dayjs'
  import Plotly from 'plotly.js-dist'

  import IconLink from '$lib/util/IconLink.svelte'
  import { isDarkTheme, isMobile } from '$lib/store/layout'
  import { troc } from '$lib/troc/store'
  import type { TrocStatsFormatted } from './formatStats'
  import { renderAmount } from '$lib/utils'

  export let stats: TrocStatsFormatted

  export let mode: 'sums' | 'numbers' = 'sums'
  let isLoading = true
  let isMounted = false
  let containerPlotStock: HTMLDivElement
  let containerHisto: HTMLDivElement
  onMount(() => {
    setTimeout(() => (isMounted = true), 300)
  })

  $: if ((isMounted && ($isDarkTheme || true)) || mode || true) load()

  const config = { responsive: true, displayModeBar: false }

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
      Plotly.newPlot(containerPlotStock, [...traces, pie], layout, config)
      resolve(true)
    })
  }

  function loadHisto() {
    return new Promise((resolve) => {
      const layout = getLayoutHisto()
      const traces = getHistoTraces()
      Plotly.newPlot(containerHisto, traces, layout, config)
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
      rotation: 90,
      domain: $isMobile
        ? {
            x: [0, mode === 'numbers' ? 0.95 : 0.35],
            y: [0.65, 1],
          }
        : {
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
      domain: { column: 0 },
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
      paper_bgcolor: grey[$isDarkTheme ? 'darken-4' : 'lighten-5'],
      plot_bgcolor: grey[$isDarkTheme ? 'darken-3' : 'lighten-4'],
      font: { color: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'] },
      yaxis: {
        title: 'Nombre',
        ...($isMobile && { domain: [0, 0.5] }),
      },
      xaxis: $isMobile ? {} : { domain: [0, 0.7] },
      height: $isMobile || mode === 'sums' ? 600 : 400,
      legend: {
        orientation: 'h',
        xanchor: 'center',
        x: 0.5,
        yanchor: 'bottom',
        y: 1.03,
      },
      margin: { t: 30, l: 60, ...($isMobile && { r: 10 }) },
      annotations: [],
    }

    if ($troc?.schedule?.length) {
      layout.annotations = [
        {
          text: 'Ouverture',
          arrowcolor: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'],
          x: new Date($troc.schedule[0].open),
        },
        {
          text: 'Fermeture',
          arrowcolor: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'],
          x: new Date($troc.schedule.at(-1)?.close || ''),
        },
      ]

      const timeOpen = +dayjs($troc.schedule[0].open).add(-1, 'week')
      const timeNow = +dayjs().add(-1, 'week')
      const timeClose = +dayjs($troc.schedule.at(-1)?.close).add(6, 'hour')
      layout.xaxis!.range = [timeOpen < timeNow ? timeOpen : timeNow, timeClose]
    }
    if (mode === 'sums') {
      layout.yaxis = {
        title: 'Valeur',
        domain: $isMobile ? [0, 0.35] : [0, 0.7],
      }
      layout.yaxis2 = {
        title: 'Bénéfice',
        domain: $isMobile ? [0.4, 0.6] : [0.75, 1],
      }
      if (layout.annotations)
        layout.annotations.push(
          {
            text: `<span>Marge :<br>Frais :<br>Total :</span>`,
            x: $isMobile ? 0.55 : 0.78,
            y: 0.9,
            xref: 'paper',
            yref: 'paper',
            xanchor: 'left',
            yanchor: 'middle',
            align: 'left',
            showarrow: false,
          },
          {
            text: `<b>${renderAmount(stats.sums.margin, $troc.currency)}<br>
              ${renderAmount(stats.sums.fee, $troc.currency)}<br>
              ${renderAmount(
                stats.sums.fee + stats.sums.margin,
                $troc.currency
              )}<br>
            </b>`,
            x: 0.95,
            y: 0.88,
            xref: 'paper',
            xanchor: 'right',
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
    const averageProvided =
      stats.numbers.provided > 0
        ? stats.sums.provided / stats.numbers.provided
        : 0
    const averageSolded =
      stats.numbers.solded > 0 ? stats.sums.solded / stats.numbers.solded : 0
    const averageRecovered =
      stats.numbers.recovered > 0
        ? stats.sums.recovered / stats.numbers.recovered
        : 0

    const layout: Partial<Plotly.Layout> = {
      paper_bgcolor: grey[$isDarkTheme ? 'darken-4' : 'lighten-5'],
      plot_bgcolor: grey[$isDarkTheme ? 'darken-3' : 'lighten-4'],
      font: { color: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'] },
      barmode: 'stack',
      legend: {
        orientation: 'h',
        xanchor: 'center',
        x: 0.5,
        yanchor: 'bottom',
        y: 1.03,
      },
      xaxis: {
        title: 'Valeur',
        range: [0, averageProvided * 3 || 50],
      },
      yaxis: { title: 'Nombre' },
      margin: { t: 30, l: 60, r: 30 },
      annotations: [],
    }

    const baseAnnotation: Partial<Plotly.Annotations> = {
      y: 0,
      arrowhead: 0,
      arrowcolor: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'],
      textangle: '-45',
      xanchor: 'left',
      ax: 30,
      ay: -30,
    }

    if (averageProvided)
      layout.annotations?.push({
        ...baseAnnotation,
        x: averageProvided,
        text: ` Moy. mis en vente: <b>
          ${renderAmount(averageProvided, $troc.currency)}
        </b>`,
      })
    if (averageSolded)
      layout.annotations?.push({
        ...baseAnnotation,
        x: averageSolded,
        text: ` Moy. vendu: <b>
          ${renderAmount(averageSolded, $troc.currency)}
        </b>`,
      })
    if (averageRecovered)
      layout.annotations?.push({
        ...baseAnnotation,
        x: averageRecovered,
        text: ` Moy. récupéré: <b>
          ${renderAmount(averageRecovered, $troc.currency)}
        </b>`,
      })

    return layout
  }

  function getHistoTraces(): Partial<Plotly.ScatterData>[] {
    // TODO: pLimite price obligé our éviter que ca rame ... Faire un avertissement ?
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

<div class="d-flex flex-column" style="gap: 1em;">
  {#if isLoading}
    <div class="centered" style="height: {mode === 'numbers' ? 400 : 600}px;">
      <IconLink icon={faChartArea} size="2em" />
    </div>
    <div class="centered" style="height: 450px;">
      <IconLink icon={faChartBar} size="2em" />
    </div>
  {/if}

  <div bind:this={containerPlotStock} class="plot" />
  <div bind:this={containerHisto} class="plot" />
</div>
