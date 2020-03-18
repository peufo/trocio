<script>
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
    let historicOpen = false
    let historicModeValue = false

    //Results
    let payments = []
    let articlesProvided = []
    let articlesSolded = []
    let articlesRecovered = []
    let articlesBuyed = []
    let events = [] // articles events
    let statsPromise

    //Syntese results
    let numberProvided = 0
    let numberSolded = 0
    let numberRecovered = 0
    let numberBuyed = 0
    let numberPayment = 0

    let sumProvided = 0
    let sumSolded = 0
    let sumRecovered = 0
    let sumBuyed = 0
    let sumPayment = 0

    let sumFee = 0
    let sumMargin = 0


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
        historicOpen = false
        setTimeout(() => { // Wait selectedView refresh
            statsPromise = getStats().then(() => {
                setTimeout(showPiePlot, 0)
                //if (historicOpen) setTimeout(showTimePlot, 0)
            })
        }, 0)
    }

    function openHistoric() {
        historicOpen = true
        //setTimeout(showTimePlot, 0)
        setTimeout(showHistoricPlot, 0)
    }
    
    function selectHistoricModeValue(val) {
        historicModeValue = val
        setTimeout(showHistoricPlot, 0)
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
        articlesProvided = json.articlesProvided
        articlesSolded = articlesProvided.filter(art => art.sold)
        articlesRecovered = articlesProvided.filter(art => art.recover)
        articlesBuyed = json.articlesBuyed
        payments = json.payments

        console.log(articlesRecovered)

        //Compute reduce
        numberProvided = articlesProvided.length
        numberSolded = articlesSolded.length
        numberRecovered = articlesRecovered.length
        numberBuyed = articlesBuyed.length
        numberPayment = payments.length
        sumProvided = numberProvided ? articlesProvided.map(art => art.price).reduce((acc, cur) => acc + cur) : 0
        sumSolded = numberSolded ? articlesSolded.map(art => art.price).reduce((acc, cur) => acc + cur) : 0
        sumRecovered = numberRecovered ? articlesRecovered.map(art => art.price).reduce((acc, cur) => acc + cur) : 0
        sumBuyed = numberBuyed ? articlesBuyed.map(art => art.price).reduce((acc, cur) => acc + cur) : 0
        sumPayment = numberPayment ? payments.map(pay => pay.amount).reduce((acc, cur) => acc + cur) : 0
        sumFee = numberProvided ? articlesProvided.map(art => art.fee).reduce((acc, cur) => acc + cur) : 0
        sumMargin = numberSolded ? articlesSolded.map(art => art.margin).reduce((acc, cur) => acc + cur) : 0

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
        let articlesProvidedEvents = []
        let capturedProvidedEvents = ['createdAt', 'valided', 'sold', 'recover']
        capturedProvidedEvents.forEach(capturedEvent => {
            articlesProvidedEvents = [...articlesProvidedEvents, ...articlesProvided.filter(art => art[capturedEvent]).map(art => {
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

        console.log('events', [...paymentsEvents, ...articlesProvidedEvents, ...articlesBuyedEvents].sort((a, b) => a.time - b.time))

        return [...paymentsEvents, ...articlesProvidedEvents, ...articlesBuyedEvents].sort((a, b) => a.time - b.time)
    }

    function showPiePlot() {
        let data = [{
            values: [numberProvided - numberSolded - numberRecovered, numberSolded, numberRecovered],
            labels: ['En vente', 'Vendu', 'Récupéré'],
            marker: {colors: ['rgb(33, 119, 181)', 'rgb(44, 160, 43)', 'rgb(255, 127, 14)']},
            domain: {column: 0},
            name: 'Ratio par nombre',
            textinfo: 'value+percent',
            sort: false,
            hoverinfo: 'none',
            hole: .6,
            type: 'pie',
        },{
            values: [sumProvided - sumSolded - sumRecovered, sumSolded, sumRecovered],
            labels: ['En vente', 'Vendu', 'Récupéré'],
            text: 'Ratio par valeur',
            domain: {column: 1},
            name: 'Ratio par valeur',
            textinfo: 'value+percent',
            sort: false,
            hoverinfo: 'none',
            hole: .6,
            type: 'pie'
        }];

        let layout = {
        title: `<b>${numberProvided}</b> dépots pour une valeur total de <b>${Math.round(sumProvided * 100) / 100}</b>`,
        annotations: [
            {
                font: { size: 18},
                showarrow: false,
                text: '<b>Nombre</b>',
                xanchor: 'center',
                x: .238
            },{
                font: { size: 18},
                showarrow: false,
                text: '<b>Montant</b>',
                xanchor: 'center',
                x: .762
            }
        ],
        height: 400,
        grid: {rows: 1, columns: 2},
        //legend: {orientation: 'h', x: .26, y: 1.15}
        legend: {orientation: 'h', xanchor: 'center', x: .5, yanchor: 'bottom', y: 1}
        };

        Plotly.newPlot('plotPie', data, layout, {responsive: true});
    }

    function showHistoricPlot() {

        let proposed = { 
            name: 'Proposé',
            marker: {color: 'rgb(200, 200, 200)'},
            stackgroup: 'one', x: [],y: [], text: []
        }

        let available = { 
            name: 'En vente',
            marker: {color: 'rgb(33, 119, 181)'},
            stackgroup: 'one', x: [],y: [], text: []
        }

        let solded = { 
            name: 'Vendu',
            marker: {color: 'rgb(44, 160, 43)'},
            stackgroup: 'one', x: [],y: [], text: []
        }

        let recover = {
            name: 'Récupéré',
            marker: {color: 'rgb(255, 127, 14)'},
            stackgroup: 'one', x: [],y: [], text: []
        }

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
                    break

                case 'valided':
                    balanceQteProposed --
                    balanceSumProposed -= event.art.price
                    balanceQteAvailable ++
                    balanceSumAvailable += event.art.price

                    proposed.text.push('')
                    available.text.push(event.art.name)
                    solded.text.push('')
                    recover.text.push('')
                    break

                case 'sold':
                    balanceQteAvailable --
                    balanceSumAvailable -= event.art.price
                    balanceQteSolded ++
                    balanceSumSolded += event.art.price

                    proposed.text.push('')
                    available.text.push('')
                    solded.text.push(event.art.name)
                    recover.text.push('')
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
                    break
            }

            proposed.x.push(event.date)
            proposed.y.push(historicModeValue ? balanceSumProposed : balanceQteProposed)

            available.x.push(event.date)
            available.y.push(historicModeValue ? balanceSumAvailable : balanceQteAvailable)

            solded.x.push(event.date)
            solded.y.push(historicModeValue ? balanceSumSolded : balanceQteSolded)

            recover.x.push(event.date)
            recover.y.push(historicModeValue ? balanceSumRecover : balanceQteRecover)

        })

        console.timeEnd('Create traces')

        let layoutStock = {
            title: {visible: false},
            yaxis: {title: historicModeValue ? 'Montant' : 'Nombre'},
            legend: {orientation: 'h', xanchor: 'center', x: .5, yanchor: 'bottom', y: 1}
        }
        
        Plotly.newPlot('stockGraph', [recover, solded, available, proposed], layoutStock) 
        

    }

    function showTimePlot() {

        let proposed = { 
            name: 'Proposé',
            mode: 'lines',
            x: [],
            y: [],
            text: []
        }

        let valided = { 
            name: 'En stock',
            mode: 'lines',
            x: [],
            y: [],
            text: []
        }

        let profit = { 
            name: 'Bénéfice',
            mode: 'lines',
            x: [],
            y: []
        }

        let profitFee = { 
            name: 'Frais',
            mode: 'lines',
            x: [],
            y: []
        }

        let profitMargin = { 
            name: 'Marge',
            mode: 'lines',
            x: [],
            y: []
        }

        let cash = { 
            name: 'En caisse',
            mode: 'lines+markers',
            marker: {size: 5, color: []},
            x: [],
            y: [],
            text: []
        }

        let debt = { 
            name: 'Dette',
            mode: 'lines',
            x: [],
            y: [],
            text: []
        }

        let balanceQteProposed = 0
        let balanceSumProposed = 0

        let balanceQteValided = 0
        let balanceSumValided = 0

        let balanceProfit = 0
        let balanceProfitFee = 0
        let balanceProfitMargin = 0

        let balanceCash = 0
        let nbPositivePayments = 0
        let sumPositive = 0
        let sumNegative = 0

        let balanceDebt = 0

        console.time('Create traces')

        events.forEach(event => {
            switch (event.event) {
                case 'createdAt':
                    balanceQteProposed ++
                    balanceSumProposed += event.art.price
                    proposed.x.push(event.date)
                    proposed.y.push(balanceSumProposed)
                    if (!event.art.valided ||  Math.abs(new Date(event.art.valided).getTime() - event.time) > 5000) {
                        proposed.text.push(`Proposition de ${event.art.name}<br>Prix: ${event.art.price}<br>Qte total: ${balanceQteProposed}`) 
                    }else {
                        proposed.text.push(`Qte total: ${balanceQteProposed}`)
                    }
                    break

                case 'valided': 
                    balanceQteValided ++
                    balanceSumValided += event.art.price
                    valided.x.push(event.date)
                    valided.y.push(balanceSumValided)
                    valided.text.push(`Validation de ${event.art.name}<br>Prix: ${event.art.price}<br>Qte total: ${balanceQteValided}`)

                    if (event.art.fee > 0) {
                        balanceProfit += event.art.fee
                        profit.x.push(event.date)
                        profit.y.push(balanceProfit)
                        
                        balanceProfitFee += event.art.fee
                        profitFee.x.push(event.date)
                        profitFee.y.push(balanceProfitFee)

                        balanceDebt -= event.art.fee
                        debt.x.push(event.date)
                        debt.y.push(balanceDebt)
                    }

                    break

                case 'sold':
                    balanceQteProposed --
                    balanceQteValided --
                    balanceSumProposed -= event.art.price
                    balanceSumValided -= event.art.price

                    proposed.x.push(event.date)
                    proposed.y.push(balanceSumProposed)
                    proposed.text.push(`Qte total: ${balanceQteProposed}`) 

                    valided.x.push(event.date)
                    valided.y.push(balanceSumValided)
                    valided.text.push(`Vente de ${event.art.name}<br>Prix: ${event.art.price}<br>Qte total: ${balanceQteValided}`)

                    if (event.art.margin > 0) {
                        balanceProfit += event.art.margin
                        profit.x.push(event.date)
                        profit.y.push(balanceProfit)
    
                        balanceProfitMargin += event.art.margin
                        profitMargin.x.push(event.date)
                        profitMargin.y.push(balanceProfitMargin)
 
                    }

                    //balanceDebt -= event.art.margin
                    balanceDebt += event.art.price - event.art.margin
                    debt.x.push(event.date)
                    debt.y.push(balanceDebt)

                    break

                case 'recover':
                    balanceQteProposed --
                    balanceQteValided --
                    balanceSumProposed -= event.art.price
                    balanceSumValided -= event.art.price

                    proposed.x.push(event.date)
                    proposed.y.push(balanceSumProposed)
                    proposed.text.push(`Qte total: ${balanceQteProposed}`) 

                    valided.x.push(event.date)
                    valided.y.push(balanceSumValided)
                    valided.text.push(`Récupération de ${event.art.name}<br>Prix: ${event.art.price}<br>Qte total: ${balanceQteValided}`)

                    break

                case 'payment':
                    balanceCash += event.pay.amount
                    cash.x.push(event.pay.createdAt)
                    cash.y.push(balanceCash)
                    cash.text = [...cash.text, `${event.pay.amount.toFixed(2)} ${event.pay.message}`]
                    if (event.pay.amount >= 0){
                        cash.marker.color = [...cash.marker.color, 'green'] 
                        nbPositivePayments ++
                        sumPositive += event.pay.amount
                    }else{
                        cash.marker.color = [...cash.marker.color, 'red'] 
                        sumNegative += event.pay.amount

                    }

                    balanceDebt += event.pay.amount
                    debt.x.push(event.pay.createdAt)
                    debt.y.push(balanceDebt)
                    
                    break

                case 'buyed':

                    balanceDebt -= event.art.price
                    debt.x.push(event.art.sold)
                    debt.y.push(balanceDebt)

                    break
            }
        })

        console.timeEnd('Create traces')

        let layoutStock = {
            yaxis: {title: 'Montant'},
            legend: {orientation: 'h', y: 1}
        }

        let layoutCash = {
            title: `Nombre de paiements: ${payments.length}  <span style="color: green;">▲${nbPositivePayments}</span>  <span style="color: red;">▼${payments.length - nbPositivePayments}</span>
                    Montant: ${balanceCash.toFixed(2)}  <span style="color: green;">▲${sumPositive.toFixed(2)}</span>  <span style="color: red;">▼${sumNegative.toFixed(2)}</span>`,
            yaxis: {title: 'Montant'}
        }
        
        //TODO: REMOVE
        //Plotly.newPlot('stockGraph', [proposed, valided, profitFee, profitMargin, profit], layoutStock) 
        
        Plotly.newPlot('cashGraph', [cash, debt], layoutCash)     

    }


</script>

<svelte:head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/1.49.5/plotly.min.js"></script>
</svelte:head>

<div style="max-width: 1000px; margin: auto;">

    <div class="w3-center">
        <FormField on:click={selectView}>
            <Radio bind:group={selectedView} value="global"/>
            <span slot="label">Vue global</span>
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
        <Paper>
            <Title>
                <i class="fas fa-cubes w3-opacity w3-xlarge"></i>
                Stock
            </Title>

            <Content>

                {#if articlesProvided.length}
                    <div id="plotPie" style="height: 400px;"></div>

                    Valeur moyenne des dépots:
                    <b>{(sumProvided / numberProvided).toFixed(2)}</b>

                    <br>
                    Valeur moyenne des dépots vendu: 
                    <b>{(sumSolded / numberSolded).toFixed(2)}</b>

                    {#if historicOpen}

                        <div id="stockGraph"></div>

                        <Group variant="outlined" class="w3-right">
                            <Button
                            style="z-index: 1;"
                            color="secondary"
                            on:click={() => selectHistoricModeValue(false)}
                            variant={!historicModeValue ? 'raised' : 'outlined'}>
                                <Label>Nombre</Label>
                            </Button>
                            <Button
                            style="z-index: 1;"
                            color="secondary"
                            on:click={() => selectHistoricModeValue(true)}
                            variant={historicModeValue ? 'raised' : 'outlined'}>
                                <Label>Montant</Label>
                            </Button>
                        </Group>

                    {:else}

                        <Button
                        on:click={openHistoric}
                        variant="outlined"
                        color="secondary"
                        class="w3-right">
                            Voir historique
                        </Button>

                    {/if}
                    <br>
                {:else}
                    <div class="w3-center">
                        <br><br>
                        <b>&#123;&nbsp;&nbsp; Les utilisateurs sélectionés n'ont fourni aucun article  &nbsp;&nbsp;&#125;</b>
                        <br><br>
                    </div>
                {/if}
            </Content>
        </Paper>

        <br>

        <Paper>
            <Title>
                <i class="fas fa-cash-register w3-opacity w3-xlarge"></i>
                Caisse
                <br>
                <b>{sumFee.toFixed(2)}</b>
                de frais due

                <br>
                <b>{sumMargin.toFixed(2)}</b>
                de marge due

                <br>
                <b>{(sumFee + sumMargin).toFixed(2)}</b>
                de benefice

            </Title>

            <Content class="w3-center">
                <div id="cashGraph"></div>
            </Content>

            
        </Paper>
    {/await}
</div>