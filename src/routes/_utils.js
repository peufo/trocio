export async function getDetail(troc, user) {

    let providedRequest  = this.fetch(`/articles?user_provider=${user}&troc=${troc}`).then(res => res.json())
    let purchasesRequest = this.fetch(`/articles?user_buyer=${user}&troc=${troc}`).then(res => res.json())
    let paymentsRequest  = this.fetch(`/payments?user=${user}&troc=${troc}`).then(res => res.json())
    let tarifRequest     = this.fetch(`/trocs/${troc}/tarif/${user}`,  {credentials: 'include'}).then(res => res.json())
    let traderRequest    = this.fetch(`/trocs/${troc}/trader/${user}`, {credentials: 'include'}).then(res => res.json())

    let [
        {data: provided,  dataMatchCount: providedCount},
        {data: purchases, dataMatchCount: purchasesCount},
        payments,
        tarif,
        {prefix: traderPrefix}
    ] = await Promise.all([providedRequest, purchasesRequest, paymentsRequest, tarifRequest, traderRequest])
    
    return { trocId: troc, userId: user && user._id, provided, purchases, payments, tarif, traderPrefix }
}