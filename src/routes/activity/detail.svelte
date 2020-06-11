<script context="module">
    export async function preload(page, session) {
        let { troc } = page.query
        let { user } = session
        if (!troc) return this.error(400, 'troc query is required')
        if (!user) return this.error(401, 'authentication is required')

        let providedRequest  = this.fetch(`/articles?user_provider=${user._id}&troc=${troc}`).then(res => res.json())
        let purchasesRequest = this.fetch(`/articles?user_buyer=${user._id}&troc=${troc}`).then(res => res.json())
        let paymentsRequest  = this.fetch(`/payments?user=${user._id}&troc=${troc}`).then(res => res.json())
        let tarifRequest     = this.fetch(`/trocs/${troc}/tarif/${user._id}`,  {credentials: 'include'}).then(res => res.json())
        let traderRequest    = this.fetch(`/trocs/${troc}/trader/${user._id}`, {credentials: 'include'}).then(res => res.json())

        let [
            {data: provided,  dataMatchCount: providedCount},
            {data: purchases, dataMatchCount: purchasesCount},
            payments,
            tarif,
            {prefix: traderPrefix}
        ] = await Promise.all([providedRequest, purchasesRequest, paymentsRequest, tarifRequest, traderRequest])
        
        return { trocId: troc, userId: user && user._id, provided, purchases, payments, tarif, traderPrefix }
    }
</script>

<script>
    import Resume from '../../components/Resume.svelte'

    export let trocId
    export let userId
    export let provided = []
    export let purchases = []
    export let payments = []
    export let tarif = undefined
    export let traderPrefix = ''

</script>

<Resume {trocId} {userId} {provided} {purchases} {payments} {tarif} {traderPrefix}/>
