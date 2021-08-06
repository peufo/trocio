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

      Plotly.newPlot(containerPlot, traces, layout)
      resolve(true)
    })
  }

  function getLayout(): Partial<Plotly.Layout> {
    const layout: Partial<Plotly.Layout> = {
      paper_bgcolor: grey[$isDarkTheme ? 'darken-4' : 'lighten-5'],
      plot_bgcolor: grey[$isDarkTheme ? 'darken-3' : 'lighten-4'],
      font: { color: grey[$isDarkTheme ? 'lighten-2' : 'darken-4'] },
      xaxis: {},
      yaxis: { title: 'Nombre' },
      yaxis2: { title: 'Valeur', side: 'right', overlaying: 'y' },
      margin: { t: 0 },
      legend: {
        orientation: 'h',
        xanchor: 'center',
        x: 0.5,
        yanchor: 'bottom',
        y: 1.15,
      },
      annotations: [],
    }

    //add shedule range and annotations
    if ($troc?.schedule?.length) {
      if (layout.xaxis) {
        layout.xaxis.range = [
          new Date($troc.schedule[0].open).getTime() - 1000 * 60 * 60 * 24,
          new Date($troc.schedule[$troc.schedule.length - 1].close).getTime() +
            1000 * 60 * 60 * 6,
        ]
      }
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
    const buysNumber = {
      name: `Nombre d'achats`,
      hoverinfo: 'y+text' as Plotly.ScatterData['hoverinfo'],
      x: [] as Date[],
      y: [] as number[],
      text: [] as string[],
    }

    const buysSum = {
      name: `Valeur des achats`,
      hoverinfo: 'y' as Plotly.ScatterData['hoverinfo'],
      yaxis: 'y2',
      x: [] as Date[],
      y: [] as number[],
    }

    let cursorNumberBuys = 0
    let cursorSumBuys = 0

    stats.events
      .filter(({ event }) => event === 'buyed')
      .forEach((event) => {
        if (!event.art) return
        cursorNumberBuys++
        cursorSumBuys += event.art.price

        buysNumber.y.push(cursorNumberBuys)
        buysNumber.x.push(event.date)
        buysNumber.text.push(event.art.name)

        buysSum.y.push(cursorSumBuys)
        buysSum.x.push(event.date)
      })

    return [buysNumber, buysSum]
  }
</script>

<div bind:this={containerPlot} class="plot" />

{#if isLoading}
  <div class="centered" style="height: 450px;">
    <IconLink icon={faChartBar} size="2em" />
  </div>
{/if}
