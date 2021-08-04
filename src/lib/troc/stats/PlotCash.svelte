<script lang="ts">
  let loading = true

  function showCashPlot() {
    cashLoading = true

    let solde = {
      name: 'Solde',
      x: [],
      y: [],
      text: [],
    }

    let pay = {
      name: 'Paiements',
      x: [],
      y: [],
      text: [],
    }

    let validedFrequency = {
      name: 'Mise en vente',
      yaxis: 'y2',
      stackgroup: 'one',
      x: [],
      y: [],
    }

    let buyFrequency = {
      name: 'Achat',
      yaxis: 'y2',
      stackgroup: 'one',
      x: [],
      y: [],
    }

    let recoverFrequency = {
      name: 'Récupération',
      yaxis: 'y2',
      stackgroup: 'one',
      x: [],
      y: [],
    }

    let paymentFrequency = {
      name: 'Paiements',
      yaxis: 'y2',
      stackgroup: 'one',
      x: [],
      y: [],
    }

    let balanceSolde = 0
    let balancePay = 0

    let frequenceTime = 1000 * 60 * 60 //une heure
    let startTime =
      Math.round(
        events.filter((e) => e.event == 'valided')[0].time / frequenceTime
      ) * frequenceTime
    let endTime =
      Math.round(events[events.length - 1].time / frequenceTime) * frequenceTime
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

    console.time('Create traces')

    events
      .filter(
        (e) =>
          ['valided', 'sold', 'buyed', 'recover', 'payment'].indexOf(e.event) !=
          -1
      )
      .forEach((event) => {
        currentTimeIndex = Math.round((event.time - startTime) / frequenceTime)

        switch (event.event) {
          case 'valided':
            balanceSolde += event.art.fee
            solde.text.push(`Mise en vente de ${event.art.name}`)
            pay.text.push(``)

            validedFrequency.y[currentTimeIndex]++

            break

          case 'sold':
            balanceSolde -= event.art.price
            balanceSolde += event.art.margin
            solde.text.push(`Vente de ${event.art.name}`)
            pay.text.push(``)

            break

          case 'buyed':
            balanceSolde += event.art.price
            solde.text.push(`Achat de ${event.art.name}`)
            pay.text.push(``)

            buyFrequency.y[currentTimeIndex]++

            break

          case 'recover':
            recoverFrequency.y[currentTimeIndex]++

            break

          case 'payment':
            balancePay += event.pay.amount
            solde.text.push(``)
            pay.text.push(
              event.pay.amount > 0
                ? `Paiement de ${event.pay.amount}<br>${event.pay.message}`
                : `Remboursement de ${event.pay.amount}<br>${event.pay.message}`
            )

            paymentFrequency.y[currentTimeIndex]++

            break
        }

        solde.y.push(balanceSolde)
        solde.x.push(event.date)

        pay.y.push(balancePay)
        pay.x.push(event.date)
      })

    console.timeEnd('Create traces')

    let layout = {
      xaxis: {},
      yaxis: { title: 'Montant', domain: [0, 0.7] },
      yaxis2: { title: 'Opé. par heure', domain: [0.75, 1] },
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

    Plotly.newPlot(
      'cashGraph',
      [
        pay,
        solde,
        validedFrequency,
        buyFrequency,
        recoverFrequency,
        paymentFrequency,
      ],
      layout
    )

    cashLoading = false
  }
</script>

HELLO
<div id="cashGraph" />

{#if loading}
  <div class="w3-display-container" style="height: 450px;">
    <div class="w3-display-middle">
      <i class="far fa-chart-bar w3-jumbo w3-opacity" />
    </div>
  </div>
{/if}
