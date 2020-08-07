<script>
    import { slide } from 'svelte/transition'

    import Radio from '@smui/radio'
    import FormField from '@smui/form-field'
    import Paper, {Title, Subtitle, Content} from '@smui/paper'
    import Button, { Group, Label } from '@smui/button'

    import { troc } from './stores'
    import SearchUser from './SearchUser.svelte'

    //Selections
    let selectedView = ''
    let selectedUser = ''
    let searchUser = ''

    //Affichage
    let stockModeValue = true
    let stockOpen = false
    let stockLoading = false
    let consommationOpen = false
    let consommationLoading = false
    let cashOpen = false
    let cashLoading = false

    //Results
    let payments = []
    let articlesProposed = []
    let articlesProvided = []
    let articlesSolded = []
    let articlesRecovered = []
    let articlesBuyed = []
    let events = [] // articles events
    let statsPromise

    //Syntese results
    let numberProposed = 0
    let numberProvided = 0
    let numberSolded = 0
    let numberRecovered = 0
    let numberBuyed = 0
    let numberPayment = 0
    let numberPaymentPositif = 0
    let numberPaymentNegatif = 0

    let sumProposed = 0
    let sumProvided = 0
    let sumSolded = 0
    let sumRecovered = 0
    let sumBuyed = 0
    let sumPayment = 0
    let sumPaymentPositif = 0
    let sumPaymentNegatif = 0

    let sumFee = 0
    let sumMargin = 0

    function openStock(e) {
        if (articlesProposed.length && !stockOpen){
            stockOpen = true
            stockLoading = true
            setTimeout(showStockPlot, 200)
        }
    }

    function openConsomation(e) {
        if (articlesBuyed.length && !consommationOpen){
            consommationOpen = true
            consommationLoading = true
            setTimeout(showConsommationPlot, 200)
        }
    }

    function openCash(e) {
        if (payments.length && !cashOpen){
            cashOpen = true
            cashLoading = true
            setTimeout(showCashPlot, 200)
        }
    }

    function closeStock(e) {
        e.stopPropagation()
        stockOpen = false
    }

    function closeConsommation(e) {
        e.stopPropagation()
        consommationOpen = false
    }

    function closeCash(e){
        e.stopPropagation()
        cashOpen = false
    }

    function selectView() {
        searchUser = ''
        loadView()
    }

    function selectUser(e) {
        selectedView = 'user'
        selectedUser = e.detail._id
        loadView()
    }

    function loadView() {
        setTimeout(() => { // Wait selectedView refresh
            statsPromise = getStats().then(() => {
                if (!articlesProposed.length) stockOpen = false
                if (!articlesSolded.length) consommationOpen = false
                if (!payments.length) cashOpen = false
                if (stockOpen) stockLoading = true && setTimeout(showStockPlot, 0)
                if (consommationOpen) consommationLoading = true && setTimeout(showConsommationPlot, 0)
                if (cashOpen) cashLoading = true && setTimeout(showCashPlot, 0)
            })
        }, 0)
    }
    
    function selectStockModeValue(val) {
        stockModeValue = val
        setTimeout(showStockPlot, 0)
    }

    async function getStats() {
        let req = `/trocs/${$troc._id}/stats?`
        if (selectedView == 'user') {
            req += `user=${selectedUser}`
        }else{
            req += `view=${selectedView}`
        }
        let res = await fetch(req)
        let json = await res.json()
        console.log(json)

        articlesProposed = json.articlesProposed
        articlesProvided = articlesProposed.filter(art => art.valided)
        articlesSolded = articlesProvided.filter(art => art.sold)
        articlesRecovered = articlesProvided.filter(art => art.recover)
        articlesBuyed = json.articlesBuyed
        payments = json.payments

        //Compute reduce
        //here, articles proposed is equivalent to articles not valided
        numberProposed = articlesProposed.filter(art => !art.valided).length
        numberProvided = articlesProvided.length
        numberSolded = articlesSolded.length
        numberRecovered = articlesRecovered.length
        numberBuyed = articlesBuyed.length
        numberPayment = payments.length
        numberPaymentPositif = payments.filter(pay => pay.amount > 0).length
        numberPaymentNegatif = numberPayment - numberPaymentPositif
        sumProposed = numberProposed ? articlesProposed.filter(art => !art.valided).map(art => art.price).reduce((acc, cur) => acc + cur) : 0
        sumProvided = numberProvided ? articlesProvided.map(art => art.price).reduce((acc, cur) => acc + cur) : 0
        sumSolded = numberSolded ? articlesSolded.map(art => art.price).reduce((acc, cur) => acc + cur) : 0
        sumRecovered = numberRecovered ? articlesRecovered.map(art => art.price).reduce((acc, cur) => acc + cur) : 0
        sumBuyed = numberBuyed ? articlesBuyed.map(art => art.price).reduce((acc, cur) => acc + cur) : 0
        sumFee = numberProvided ? articlesProvided.map(art => art.fee).reduce((acc, cur) => acc + cur) : 0
        sumMargin = numberSolded ? articlesSolded.map(art => art.margin).reduce((acc, cur) => acc + cur) : 0  
        sumPaymentPositif = numberPaymentPositif ? payments.map(pay => pay.amount).filter(p => p > 0).reduce((acc, cur) => acc + cur) : 0
        sumPaymentNegatif = numberPaymentNegatif ? -payments.map(pay => pay.amount).filter(p => p < 0).reduce((acc, cur) => acc + cur) : 0
        sumPayment = sumPaymentPositif + sumPaymentNegatif

        events = getEvents()
        return
    }

    function getEvents() {

        //payments
        let paymentsEvents = payments.map(p => {
            return {
                pay: p,
                event: 'payment', 
                date: p.createdAt,
                time: new Date(p.createdAt).getTime()
            }
        })

        //Provider events
        let articlesProposedEvents = []
        let capturedProposedEvents = ['createdAt', 'valided', 'sold', 'recover']
        capturedProposedEvents.forEach(capturedEvent => {
            articlesProposedEvents = [...articlesProposedEvents, ...articlesProposed.filter(art => art[capturedEvent]).map(art => {
                    return {
                        art,
                        event: capturedEvent,
                        date: art[capturedEvent],
                        time: new Date(art[capturedEvent]).getTime()
                    }
                })
            ]
        })

        //Buyer events
        let articlesBuyedEvents = articlesBuyed.map(art => {
            return {
                art,
                event: 'buyed',
                date: art.sold,
                time: new Date(art.sold).getTime()
            }
        })

        console.log('events', [...paymentsEvents, ...articlesProposedEvents, ...articlesBuyedEvents].sort((a, b) => a.time - b.time))

        return [...paymentsEvents, ...articlesProposedEvents, ...articlesBuyedEvents].sort((a, b) => a.time - b.time)
    }

    function showStockPlot() {

        stockLoading = true

        let pie = {
            labels: ['Proposé', 'En vente', 'Vendu', 'Récupéré'],
            marker: {colors: ['rgb(200, 200, 200)', 'rgb(33, 119, 181)', 'rgb(44, 160, 43)', 'rgb(255, 127, 14)']},
            textinfo: 'value+percent',
            hoverinfo: 'none',
            type: 'pie',
            hole: .2,
            domain: { x: [0.8, 1]},
            showlegend: false
        }

        if (stockModeValue) {
            pie.values = [sumProposed, sumProvided - sumSolded - sumRecovered, sumSolded, sumRecovered]
        }else{
            pie.values = [numberProposed, numberProvided - numberSolded - numberRecovered, numberSolded, numberRecovered]
        }

        let proposed = { 
            name: 'Proposé',
            marker: {color: 'rgb(200, 200, 200)'},
            stackgroup: 'one', x: [], y: [], text: [], domain: {column: 0},
        }

        let available = { 
            name: 'En vente',
            marker: {color: 'rgb(33, 119, 181)'},
            stackgroup: 'one', x: [], y: [], text: [], domain: {column: 0},
        }

        let solded = { 
            name: 'Vendu',
            marker: {color: 'rgb(44, 160, 43)'},
            stackgroup: 'one', x: [], y: [], text: [], domain: {column: 0},
        }

        let recover = {
            name: 'Récupéré',
            marker: {color: 'rgb(255, 127, 14)'},
            stackgroup: 'one', x: [], y: [], text: [], domain: {column: 0},
        }

        let fees = {
            name: 'Frais',
            yaxis: 'y2',
            marker: {color: 'rgb(140, 86, 75)'},
            stackgroup: 'two', x: [], y: [], text: [], domain: {column: 0},
        }

        let margins = {
            name: 'Marge',
            yaxis: 'y2',
            marker: {color: 'rgb(227, 119, 194)'},
            stackgroup: 'two', x: [], y: [], text: [], domain: {column: 0},
        }

        let balanceFees = 0
        let balanceMargins = 0

        let balanceQteProposed = 0
        let balanceSumProposed = 0

        let balanceQteAvailable = 0
        let balanceSumAvailable = 0

        let balanceQteSolded = 0
        let balanceSumSolded = 0

        let balanceQteRecover = 0
        let balanceSumRecover = 0

        console.time('Create traces')

        events.filter(e => ['createdAt', 'valided', 'sold', 'recover'].indexOf(e.event) != -1).forEach(event => {
            switch (event.event) {
                case 'createdAt':
                    balanceQteProposed ++
                    balanceSumProposed += event.art.price

                    proposed.text.push(event.art.name)
                    available.text.push('')
                    solded.text.push('')
                    recover.text.push('')

                    fees.text.push(``)
                    margins.text.push(``)
                    break

                case 'valided':
                    balanceQteProposed --
                    balanceSumProposed -= event.art.price
                    balanceQteAvailable ++
                    balanceSumAvailable += event.art.price
                    balanceFees += event.art.fee

                    proposed.text.push('')
                    available.text.push(event.art.name)
                    solded.text.push('')
                    recover.text.push('')

                    fees.text.push(`Mise en vente de ${event.art.name}`)
                    margins.text.push(``)

                    break

                case 'sold':
                    balanceQteAvailable --
                    balanceSumAvailable -= event.art.price
                    balanceQteSolded ++
                    balanceSumSolded += event.art.price
                    balanceMargins += event.art.margin

                    proposed.text.push('')
                    available.text.push('')
                    solded.text.push(event.art.name)
                    recover.text.push('')

                    fees.text.push(``)
                    margins.text.push(`Vente de ${event.art.name}`)

                    break

                case 'recover':
                    balanceQteAvailable --
                    balanceSumAvailable -= event.art.price
                    balanceQteRecover ++
                    balanceSumRecover += event.art.price

                    proposed.text.push('')
                    available.text.push('')
                    solded.text.push('')
                    recover.text.push(event.art.name)

                    fees.text.push(``)
                    margins.text.push(``)

                    break
            }

            proposed.x.push(event.date)
            proposed.y.push(stockModeValue ? balanceSumProposed : balanceQteProposed)

            available.x.push(event.date)
            available.y.push(stockModeValue ? balanceSumAvailable : balanceQteAvailable)

            solded.x.push(event.date)
            solded.y.push(stockModeValue ? balanceSumSolded : balanceQteSolded)

            recover.x.push(event.date)
            recover.y.push(stockModeValue ? balanceSumRecover : balanceQteRecover)

            fees.x.push(event.date)
            fees.y.push(balanceFees)
                
            margins.x.push(event.date)
            margins.y.push(balanceMargins)

        })

        console.timeEnd('Create traces')

        let layout = {
            yaxis: {title: 'Nombre'},
            legend: {orientation: 'h', xanchor: 'center', x: .5, yanchor: 'bottom', y: 1.15},
            grid: {columns: 2},
            xaxis: { domain: [0, 0.7] },
            margin: {t: 80},
            annotations: []
        }

        //add shedule range and annotations
        
        if ($troc.schedule.length) {
            layout.xaxis.range = [
                new Date($troc.schedule[0].open).getTime() - 1000 * 60 * 60 * 24,
                new Date($troc.schedule[$troc.schedule.length - 1].close).getTime() + 1000 * 60 * 60 * 6
            ]
            layout.annotations.push({
                text: 'Ouverture',
                x: $troc.schedule[0].open
            })
            layout.annotations.push({
                text: 'Fermeture',
                x: $troc.schedule[$troc.schedule.length - 1].close
            })
        }
        

        let data = [recover, solded, available, proposed, pie]

        if (stockModeValue) {
            layout.annotations.push({
                text: `Marge<br>Frais<br>Total`,
                x: 0.9, xref: 'paper', xanchor: 'left',
                y: 0.98, yref: 'paper', yanchor: 'center',
                align: 'left',
                showarrow: false
            })
            layout.annotations.push({
                text: `<b>${sumMargin.toFixed(2)}<br>${sumFee.toFixed(2)}<br>${(sumFee + sumMargin).toFixed(2)}</b>`,
                x: 0.9, xref: 'paper', xanchor: 'right',
                y: 0.98, yref: 'paper', yanchor: 'center',
                align: 'right',
                showarrow: false
            })
            pie.domain.y = [0, 0.7]
            layout.yaxis = {domain: [0, 0.7], title: 'Valeur'}
            layout.yaxis2 = {domain: [0.75, 1]}
            data = [fees, margins, ...data]
        }

        console.time('create plot')
        Plotly.newPlot('stockGraph', data, layout)
        console.timeEnd('create plot')

        //TODO: Limite price obligé pour éviter le rammage... Faire un avertissement ?
        const LIMIT_PRICE = 1000

        //Histogram
        let proposedHisto = {
            name: 'Proposé',
            hoverinfo: 'y',
            marker: {color: 'rgb(200, 200, 200)'},
            x: articlesProposed.filter(art => !art.valided && art.price < LIMIT_PRICE).map(art => art.price),
            type: 'histogram', xbins: {size: 10}
        }

        let availableHisto = {
            name: 'En vente',
            hoverinfo: 'y',
            marker: {color: 'rgb(33, 119, 181)'},
            x: articlesProvided.filter(art => !art.solded && !art.recover && art.price < LIMIT_PRICE).map(art => art.price),
            type: 'histogram', xbins: {size: 10}
        }

        let soldedHisto = {
            name: 'Vendu',
            hoverinfo: 'y',
            marker: {color: 'rgb(44, 160, 43)'},
            x: articlesSolded.filter(art => art.price < LIMIT_PRICE).map(art => art.price),
            type: 'histogram', xbins: {size: 10}
        }

        let recoverHisto = {
            name: 'Récupéré',
            hoverinfo: 'y',
            marker: {color: 'rgb(255, 127, 14)'},
            x: articlesRecovered.filter(art => art.price < LIMIT_PRICE).map(art => art.price),
            type: 'histogram', xbins: {size: 10}
        }

        let layoutHisto = {
            barmode: 'stack',
            legend: {orientation: 'h', xanchor: 'center', x: .5, yanchor: 'bottom', y: 1.15},
            xaxis: {title: 'Valeur', range: [0, (sumProvided / numberProvided) * 3]},
            yaxis: {title: 'Nombre'},
            margin: {t: 80},
            annotations: [{
                text: ` Moy. mis en vente: <b>${(sumProvided / numberProvided).toFixed(2)}</b>`,
                x: sumProvided / numberProvided, y: 0,
                arrowhead: 0, textangle: -45, xanchor: 'left', ax:30, ay: -30
            },{
                text: ` Moy. vendu: <b>${(sumSolded / numberSolded).toFixed(2)}</b>`,
                x: sumSolded / numberSolded, y: 0,
                arrowhead: 0, textangle: -45, xanchor: 'left', ax:30, ay: -30
            },{
                text: ` Moy. récupéré: <b>${(sumRecovered / numberRecovered).toFixed(2)}</b>`,
                x: sumRecovered / numberRecovered, y: 0,
                arrowhead: 0, textangle: -45, xanchor: 'left', ax:30, ay: -30
            }]
        }

        let dataHisto = []
        if (numberRecovered) dataHisto.push(recoverHisto)
        if (numberSolded) dataHisto.push(soldedHisto)
        if (numberProvided - numberSolded - numberRecovered) dataHisto.push(availableHisto)
        if (numberProposed) dataHisto.push(proposedHisto)
        console.log({dataHisto})

        //Plotly.newPlot('stockGraphHisto', dataHisto, layoutHisto)
        Plotly.newPlot('stockGraphHisto', dataHisto, layoutHisto)

        stockLoading = false
    }

    function showConsommationPlot() {

        consommationLoading = true

        let buysNumber = {
            name: `Nombre d'achats`,
            hoverinfo: 'y+text',
            x: [], y: [], text: []
        }

        let buysSum = {
            name: `Valeur des achats`,
            hoverinfo: 'y',
            yaxis: 'y2',
            x: [], y: []
        }

        let balanceNumberBuys = 0
        let balanceSumBuys = 0

        events.filter(e => e.event == 'buyed').forEach(event => {

            balanceNumberBuys ++
            balanceSumBuys += event.art.price

            buysNumber.y.push(balanceNumberBuys)
            buysNumber.x.push(event.date)
            buysNumber.text.push(event.art.name)

            buysSum.y.push(balanceSumBuys)
            buysSum.x.push(event.date)

        })

        let layout = {
            xaxis: {},
            yaxis: {title: 'Nombre'},
            yaxis2: {title: 'Valeur', side: 'right', overlaying: 'y'},
            margin: {t: 0},
            legend: {orientation: 'h', xanchor: 'center', x: .5, yanchor: 'bottom', y: 1.15},
            annotations: []
        }

        //add shedule range and annotations
        if ($troc.schedule.length) {
            layout.xaxis.range = [
                new Date($troc.schedule[0].open).getTime() - 1000 * 60 * 60 * 24,
                new Date($troc.schedule[$troc.schedule.length - 1].close).getTime() + 1000 * 60 * 60 * 6
            ]
            layout.annotations.push({
                text: 'Ouverture',
                x: $troc.schedule[0].open,
                y: 0
            })
            layout.annotations.push({
                text: 'Fermeture',
                x: $troc.schedule[$troc.schedule.length - 1].close, 
                y: 0
            })
        }

        Plotly.newPlot('consommationGraph', [buysNumber, buysSum], layout)

        consommationLoading = false

    }

    function showCashPlot() {

        cashLoading = true
        
        let solde = {
            name: 'Solde',
            x: [],y: [], text: []
        }

        let pay = {
            name: 'Paiements',
            x: [],y: [], text: []
        }

        let validedFrequency = {
            name: 'Mise en vente',
            yaxis: 'y2',
            stackgroup: 'one', x: [], y: []
        }

        let buyFrequency = {
            name: 'Achat',
            yaxis: 'y2',
            stackgroup: 'one', x: [], y: []
        }

        let recoverFrequency = {
            name: 'Récupération',
            yaxis: 'y2',
            stackgroup: 'one', x: [], y: []
        }

        let paymentFrequency = {
            name: 'Paiements',
            yaxis: 'y2',
            stackgroup: 'one', x: [], y: []
        }

        let balanceSolde = 0
        let balancePay = 0

        let frequenceTime = 1000 * 60 * 60 //une heure
        let startTime = Math.round(events.filter(e => e.event == 'valided')[0].time / frequenceTime) * frequenceTime
        let endTime = Math.round(events[events.length - 1].time / frequenceTime) * frequenceTime
        let currentTimeIndex = 0

        for (let currentTime = startTime; currentTime < endTime; currentTime += frequenceTime) {

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

        events.filter(e => ['valided', 'sold', 'buyed', 'recover', 'payment'].indexOf(e.event) != -1).forEach(event => {

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
                    pay.text.push(event.pay.amount > 0 ? `Paiement de ${event.pay.amount}<br>${event.pay.message}` : `Remboursement de ${event.pay.amount}<br>${event.pay.message}`)

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
            yaxis: {title: 'Montant', domain: [0, .7]},
            yaxis2: {title: 'Opé. par heure', domain: [.75, 1]},
            legend: {orientation: 'h', xanchor: 'center', x: .5, yanchor: 'bottom', y: 1.15},
            annotations: []
        }

        //add shedule range and annotations
        if ($troc.schedule.length) {
            layout.xaxis.range = [
                new Date($troc.schedule[0].open).getTime() - 1000 * 60 * 60 * 24,
                new Date($troc.schedule[$troc.schedule.length - 1].close).getTime() + 1000 * 60 * 60 * 6
            ]
            layout.annotations.push({
                text: 'Ouverture',
                x: $troc.schedule[0].open,
                y: 0
            })
            layout.annotations.push({
                text: 'Fermeture',
                x: $troc.schedule[$troc.schedule.length - 1].close, 
                y: 0
            })
        }
        
        Plotly.newPlot('cashGraph', [pay, solde, validedFrequency, buyFrequency, recoverFrequency, paymentFrequency], layout)

        cashLoading = false

    }

</script>

<svelte:head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/1.49.5/plotly.min.js"></script>
</svelte:head>

<div style="max-width: 1000px; margin: auto;">

    <div class="w3-center">
        <FormField on:click={selectView}>
            <Radio bind:group={selectedView} value="global"/>
            <span slot="label">Tous</span>
        </FormField>
        <FormField on:click={selectView}>
            <Radio bind:group={selectedView} value="traders"/>
            <span slot="label">Commerçants</span>
        </FormField>
        <FormField on:click={selectView}>
            <Radio bind:group={selectedView} value="privates"/>
            <span slot="label">Particuliers</span>
        </FormField>
        <FormField>
            <Radio bind:group={selectedView} value="user"/>
            <SearchUser modeSelect on:select={selectUser} bind:search={searchUser}/>
        </FormField>
    </div>

    <br><br>

    {#await statsPromise}
        <div class="w3-center">
            <br><br><br><br>
            <img src="/favicon.ico" alt="Logo trocio" class="w3-spin">
        </div>
    {:then}
        <div on:click={openStock}>
            <Paper transition elevation={stockOpen ? 5 : 2} class={stockOpen ? '' : 'clickable'}>

                <Title>
                    <i class="fas fa-truck w3-opacity w3-xlarge"></i>
                    <span>Approvisionement</span>
                    {#if stockOpen}
                        <i class="fas fa-window-minimize w3-large w3-right button-icon" on:click={closeStock}></i>
                    {/if}
                </Title>

                <Subtitle>
                    {#if articlesProposed.length}
                        <span><b>{numberProvided + numberProposed}</b> propositions pour une valeur total de <b>{Math.round((sumProvided + sumProposed) * 100) / 100}</b></span>
                    {:else}
                        <span>Aucun article proposé</span>
                    {/if}
                </Subtitle>

                <Content>
                    {#if stockOpen}
                        <div transition:slide|local="{{duration: 200}}">

                            <Group variant="outlined" class="w3-left w3-margin-top">
                                <Button
                                style="z-index: 1;"
                                color="secondary"
                                on:click={() => selectStockModeValue(false)}
                                variant={!stockModeValue ? 'raised' : 'outlined'}>
                                    <Label>Nombre</Label>
                                </Button>
                                <Button
                                style="z-index: 1;"
                                color="secondary"
                                on:click={() => selectStockModeValue(true)}
                                variant={stockModeValue ? 'raised' : 'outlined'}>
                                    <Label>Valeur</Label>
                                </Button>
                            </Group>

                            <div id="stockGraph"></div>
                            <div id="stockGraphHisto"></div>
                            
                            {#if stockLoading}
                                <div class="w3-display-container" style="height: 450px;">
                                    <div class="w3-display-middle">
                                        <i class="fas fa-chart-area w3-jumbo w3-opacity"></i>
                                    </div>
                                </div>
                                <div class="w3-display-container" style="height: 450px;">
                                    <div class="w3-display-middle">
                                        <i class="far fa-chart-bar w3-jumbo w3-opacity"></i>
                                    </div>
                                </div>
                            {/if}

                        </div>      
                    {/if}                      
                </Content>
            </Paper>
        </div>

        <br>
        <div on:click={openConsomation}>
            <Paper transition elevation={consommationOpen ? 5 : 2} class={consommationOpen ? '' : 'clickable'}>
            
                <Title>
                    <i class="fas fa-shopping-cart w3-opacity w3-xlarge"></i>
                    <span>Consommation</span>
                    {#if consommationOpen}
                        <i class="fas fa-window-minimize w3-large w3-right button-icon" on:click={closeConsommation}></i>
                    {/if}
                </Title>

                <Subtitle>
                    {#if articlesSolded.length}
                        <span><b>{numberBuyed}</b> achats pour un valeur total de <b>{Math.round(sumBuyed * 100) / 100}</b></span>
                    {:else}
                        <span>Aucun article acheté</span>
                    {/if}
                </Subtitle>

                <Content class="w3-center">
                    {#if consommationOpen}
                        <div transition:slide|local="{{duration: 200}}">

                            <div id="consommationGraph"></div>

                            {#if consommationLoading}
                                <div class="w3-display-container" style="height: 450px;">
                                    <div class="w3-display-middle">
                                        <i class="far fa-chart-bar w3-jumbo w3-opacity"></i>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </Content>

            </Paper>
        </div>

        <br>
        <div on:click={openCash}>
            <Paper class={cashOpen ? '' : 'clickable'}>
                <Title>
                    <i class="fas fa-cash-register w3-opacity w3-xlarge"></i>
                    <span>Caisse</span>
                    {#if cashOpen}
                        <i class="fas fa-window-minimize w3-large w3-right button-icon" on:click={closeCash}></i>
                    {/if}
                </Title>

                <Subtitle>
                    {#if payments.length}
                        <span>
                            <b>{numberPayment}</b>
                            <span style="color: green;">
                                <i class="fas fa-chevron-up"></i>
                                {numberPaymentPositif}
                            </span>
                            <span style="color: red;">
                                <i class="fas fa-chevron-down"></i>
                                {numberPaymentNegatif}
                            </span>
                            pour une valeur total de 
                            <b>{sumPayment.toFixed(2)}</b>
                            <span style="color: green;">
                                <i class="fas fa-chevron-up"></i>
                                {sumPaymentPositif.toFixed(2)}
                            </span>
                            <span style="color: red;">
                                <i class="fas fa-chevron-down"></i>
                                {sumPaymentNegatif.toFixed(2)}
                            </span>
                            <span style="color: blue;">
                                <i class="fas fa-angle-right"></i>
                                {(sumPaymentPositif - sumPaymentNegatif).toFixed(2)}
                            </span>

                        </span>
                    {:else}
                        <span>Aucun paiement</span>
                    {/if}
                </Subtitle>

                <Content class="w3-center">
                    {#if cashOpen}
                        <div transition:slide|local="{{duration: 200}}">

                            <div id="cashGraph"></div>

                            {#if cashLoading}
                                <div class="w3-display-container" style="height: 450px;">
                                    <div class="w3-display-middle">
                                        <i class="far fa-chart-bar w3-jumbo w3-opacity"></i>
                                    </div>
                                </div>
                            {/if}

                        </div>
                    {/if}
                    
                </Content>

            </Paper>
            <br><br>
        </div>
    {/await}
</div>