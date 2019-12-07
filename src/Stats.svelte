<script>
    import Radio from '@smui/radio'
    import FormField from '@smui/form-field'
    import Paper, {Title, Subtitle, Content} from '@smui/paper'

    import { troc } from './stores'
    import SearchUser from './SearchUser.svelte'

    let selectedView = ''
    let selectedUser = ''
    let searchUser = ''

    let payments = []
    let articles = []
    let events = [] // articles events
    let statsPromise

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
            statsPromise = getStats().then(() => setTimeout(showGraphs, 0))
        }, 0)
    }

    async function getStats() {
        let req = `/trocs/${$troc._id}/stats?view=${selectedView}`
        let res = await fetch(req)
        let json = await res.json()
        payments = json.payments
        articles = json.articles
        console.log(articles.length)
        events = getEvents()
        return
    }

    function getEvents() {
        let paymentsEvents = payments.map(p => {
            return {
                pay: p,
                event: 'payment', 
                date: p.createdAt,
                time: new Date(p.createdAt).getTime()
            }
        })
        let articlesEvents = []
        let capturedEvents = ['createdAt', 'valided', 'sold', 'recover'] //TODO: not giveback
        capturedEvents.forEach(capturedEvent => {
            articlesEvents = [...articlesEvents, ...articles.filter(art => art[capturedEvent]).map(art => {
                    return {
                        art,
                        event: capturedEvent,
                        date: art[capturedEvent],
                        time: new Date(art[capturedEvent]).getTime()
                    }
                })
            ]
        })
        console.log([...paymentsEvents, ...articlesEvents].sort((a, b) => a.time - b.time))

        return [...paymentsEvents, ...articlesEvents].sort((a, b) => a.time - b.time)
    }

    function showGraphs() {

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

                    balanceDebt -= event.art.margin
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
            }
        })

        console.timeEnd('Create traces')

        let layoutStock = {
            title: `TODO: Synthesize some number`,
            yaxis: {title: 'Montant'},
            legend: {orientation: 'h', y: 1}
        }

        let layoutCash = {
            title: `Nombre de paiements: ${payments.length}  <span style="color: green;">▲${nbPositivePayments}</span>  <span style="color: red;">▼${payments.length - nbPositivePayments}</span>
                    Montant: ${balanceCash.toFixed(2)}  <span style="color: green;">▲${sumPositive.toFixed(2)}</span>  <span style="color: red;">▼${sumNegative.toFixed(2)}</span>`,
            yaxis: {title: 'Montant'}
        }
        
        Plotly.newPlot('stockGraph', [proposed, valided, profitFee, profitMargin, profit], layoutStock) 
        
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

    <Paper >
        <Title>
            <i class="fas fa-cash-register w3-opacity w3-xlarge"></i>
            Caisse
        </Title>

        {#await statsPromise}
            <div class="w3-center">
                <img src="/favicon.ico" alt="Logo trocio" class="w3-spin">
            </div>
        {:then}

            <Content class="w3-center">
                <div id="cashGraph"></div>
            </Content>

        {/await}
    </Paper>

    <br>

    <Paper >
        <Title>
            <i class="fas fa-cubes w3-opacity w3-xlarge"></i>
            Stock
        </Title>

        {#await statsPromise}
            <div class="w3-center">
                <img src="/favicon.ico" alt="Logo trocio" class="w3-spin">
            </div>
        {:then}

            <Content class="w3-center">
                <div id="stockGraph"></div>
            </Content>

        {/await}
    </Paper>

</div>