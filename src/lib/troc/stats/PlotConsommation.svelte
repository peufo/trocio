<script lang="ts">
  function showConsommationPlot() {
    consommationLoading = true

    let buysNumber = {
      name: `Nombre d'achats`,
      hoverinfo: 'y+text',
      x: [],
      y: [],
      text: [],
    }

    let buysSum = {
      name: `Valeur des achats`,
      hoverinfo: 'y',
      yaxis: 'y2',
      x: [],
      y: [],
    }

    let balanceNumberBuys = 0
    let balanceSumBuys = 0

    events
      .filter((e) => e.event == 'buyed')
      .forEach((event) => {
        balanceNumberBuys++
        balanceSumBuys += event.art.price

        buysNumber.y.push(balanceNumberBuys)
        buysNumber.x.push(event.date)
        buysNumber.text.push(event.art.name)

        buysSum.y.push(balanceSumBuys)
        buysSum.x.push(event.date)
      })

    let layout = {
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
    if ($troc.schedule.length) {
      layout.xaxis.range = [
        new Date($troc.schedule[0].open).getTime() - 1000 * 60 * 60 * 24,
        new Date($troc.schedule[$troc.schedule.length - 1].close).getTime() +
          1000 * 60 * 60 * 6,
      ]
      layout.annotations.push({
        text: 'Ouverture',
        x: $troc.schedule[0].open,
        y: 0,
      })
      layout.annotations.push({
        text: 'Fermeture',
        x: $troc.schedule[$troc.schedule.length - 1].close,
        y: 0,
      })
    }

    Plotly.newPlot('consommationGraph', [buysNumber, buysSum], layout)

    consommationLoading = false
  }
</script>

<div id="consommationGraph" />

{#if consommationLoading}
  <div class="w3-display-container" style="height: 450px;">
    <div class="w3-display-middle">
      <i class="far fa-chart-bar w3-jumbo w3-opacity" />
    </div>
  </div>
{/if}
