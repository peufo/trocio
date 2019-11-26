<script>
    import Radio from '@smui/radio'
    import FormField from '@smui/form-field'
    import Paper, {Title, Subtitle, Content} from '@smui/paper'

    import { troc } from './stores'
    import SearchUser from './SearchUser.svelte'


    let selectedView = ''

    let articles = []
    let articlesPromise

    let payments = []
    let paymentsPromise

    function selectView() {
        setTimeout(() => { // Wait selectedView refresh
            articlesPromise = getArticles().then(() => setTimeout(showArticlesGraph, 0))
            paymentsPromise = getPayments().then(() => setTimeout(showPaymentsGraph, 0))
        }, 0)
    }

    async function getArticles() {
        let req = `/articles/stats?troc=${$troc._id}&view=${selectedView}`
        let res = await fetch(req)
        articles = await res.json()
        return
    }

    async function getPayments() {
        let req = `/payments/stats?troc=${$troc._id}&view=${selectedView}`
        let res = await fetch(req)
        payments = await res.json()
        return
    }

    function showArticlesGraph() {

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

        let events = []
        let capturedEvents = ['createdAt', 'valided', 'sold', 'recover'] //TODO: not giveback

        /*      
        //Calculate in 610ms for 140000 events
        articles.forEach(art => {
            capturedEvents.forEach(capturedEvent => {
                if (art[capturedEvent]) events = [...events, {
                        art,
                        event: capturedEvent,
                        date: art[capturedEvent],
                        time: new Date(art[capturedEvent]).getTime()
                    }]
            })
        })
        */

        //Calculate in 13ms for 14000 events
        capturedEvents.forEach(capturedEvent => {
            events = [...events, ...articles.filter(art => art[capturedEvent]).map(art => {
                    return {
                        art,
                        event: capturedEvent,
                        date: art[capturedEvent],
                        time: new Date(art[capturedEvent]).getTime()
                    }
                })
            ]
        })

        events = events.sort((a, b) => a.time - b.time)

        let balanceQteProposed = 0
        let balanceSumProposed = 0

        let balanceQteValided = 0
        let balanceSumValided = 0

        let balanceProfit = 0
        let balanceProfitFee = 0
        let balanceProfitMargin = 0

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
            }
        })

        console.timeEnd('Create traces')

        let layout = {
            title: `TODO: Synthesize some number`,
            yaxis: {title: 'Montant'},
            legend: {orientation: 'h', y: 1}
        }
        
        Plotly.newPlot('stockGraph', [proposed, valided, profitFee, profitMargin, profit], layout) 
        
    }

    function showPaymentsGraph() {

        let cash = { 
            mode: 'lines+markers',
            marker: {size: 5, color: []},
            x: [],
            y: [],
            text: []
        }

        let balance = 0
        let nbPositivePayments = 0
        let sumPositive = 0
        let sumNegative = 0
        payments.forEach(p => {
            balance += p.amount
            cash.x = [...cash.x, p.createdAt]
            cash.y = [...cash.y, balance]
            cash.text = [...cash.text, `${p.amount.toFixed(2)} ${p.message}`]
            if (p.amount >= 0){
                cash.marker.color = [...cash.marker.color, 'green'] 
                nbPositivePayments ++
                sumPositive += p.amount
            }else{
                cash.marker.color = [...cash.marker.color, 'red'] 
                sumNegative += p.amount
            }
        })

        let layout = {
            title: `Nombre de paiements: ${payments.length}  <span style="color: green;">▲${nbPositivePayments}</span>  <span style="color: red;">▼${payments.length - nbPositivePayments}</span>
                    Montant: ${balance.toFixed(2)}  <span style="color: green;">▲${sumPositive.toFixed(2)}</span>  <span style="color: red;">▼${sumNegative.toFixed(2)}</span>`,
            yaxis: {title: 'Montant'}
        }
        
        Plotly.newPlot('cashGraph', [cash], layout)        
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
        <FormField on:click={() => alert('TODO: Manage user select')}>
            <Radio bind:group={selectedView} value="user"/>
            <SearchUser disabled={selectedView != 'user'}/>
        </FormField>
    </div>

    <br><br>

    <Paper >
        <Title>
            <i class="fas fa-cash-register w3-opacity w3-xlarge"></i>
            Caisse
        </Title>

        {#await paymentsPromise}
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

        {#await articlesPromise}
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