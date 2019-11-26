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
            articlesPromise = getArticles()
            paymentsPromise = getPayments().then(() => setTimeout(showPaymentsGraph, 0))
        }, 0)
    }

    async function getArticles() {
        
    }

    async function getPayments() {
        let req = `/payments/stats?troc=${$troc._id}&view=${selectedView}`
        let res = await fetch(req)
        payments = await res.json()

        return
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
            title: `Nombre de paiements: ${payments.length}  ▲${nbPositivePayments}  ▼${payments.length - nbPositivePayments}
                    Montant: ${balance.toFixed(2)}  ▲${sumPositive.toFixed(2)}  ▼${sumNegative.toFixed(2)}`
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
        <FormField>
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


</div>