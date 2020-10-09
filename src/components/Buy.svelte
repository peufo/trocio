<script>
    import { getHeader, crossfadeConfig, sortByUpdatedAt } from './utils'
    import Article from './Article.svelte'
    import { trocDetails as details} from './stores.js'
    import { params } from '@sveltech/routify'
	import { crossfade, fade, slide } from 'svelte/transition'
    import { flip } from 'svelte/animate'
    import Button from '@smui/button'
    import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'
	dayjs.locale('fr')
	dayjs.extend(relativeTime)

    const [send, receive] = crossfade(crossfadeConfig)
    
    let articles = [] //search
    let countArticleAvailable = 0
    let searchPromise
    let search = ''
    let cart = []
    let buyPromise
    let wait

    const LIMIT_LIST_INIT = 5 //Nombre d'élément d'une liste afficher initialement
    let LIMIT_LIST_A = LIMIT_LIST_INIT //Nombre d'élément afficher pour la premier liste
    let LIMIT_LIST_B = LIMIT_LIST_INIT //Nombre d'élément afficher pour la seconde liste

    //For search article
    let moreResultsPromise
    let noMoreResults = false
    let skip = 0

    async function getArticles() {

        let req = `/articles?troc=${$details.troc}&limit=${LIMIT_LIST_A}&skip=${skip}`
        req += `&filter_statut=valided`
        req += `&or_search_name=${search}`
        req += `&or_search_ref=${search}`
        req += `${$params.client && $params.client !== 'undefined' ? `&providernot=${$params.client}` :''}`

        try {
            let res = await fetch(`__API__${req}`)
            let json = await res.json()
    
            if(res.ok) {
                
                noMoreResults  = json.data.length < LIMIT_LIST_A
                countArticleAvailable = json.dataMatchCount
    
                if (!!skip) {
                    articles = [...articles, ...json.data]
                }else{
                    articles = json.data
                }
                
                articles = articles.filter(a => cart.map(c => c._id).indexOf(a._id) == -1)
    
                return
            }
        } catch(error) {
            console.trace(error)
        }
    }

    function input(){
        skip = 0
        if (wait) clearTimeout(wait)
        if (search.length > 0) {
            wait = setTimeout(() => searchPromise = getArticles(), 200)
        }else{
            articles = []
        }
    }

    function getMoreResults() {
        skip += LIMIT_LIST_A
        moreResultsPromise = getArticles()
    }
    
    function buy(index) {
        cart = [articles[index], ...cart]
        cart[0].isRemovable = true
        articles.splice(index, 1)
        articles = articles  
    }

    function removeArticle(index) {
        cart[index].isRemovable = false
        articles = [cart[index], ...articles]
        cart.splice(index, 1)
        cart = cart
    }

    async function validBuy() {
        let sold = new Date()
        let patchedArticles = cart.map(article => {
            let art = {_id: article._id, sold}
            if ($params.client !== 'undefined') art.buyer = $params.client
            return art
        })

        try {
            let res = await fetch('__API__/articles', getHeader(patchedArticles, 'PATCH'))
            let json = await res.json()
            if (res.ok && json.success) {
                let newPurchases = json.message
                $details.purchases = [...newPurchases, ...$details.purchases]
                $details.purchases[0].soldTime = new Date($details.purchases[0].sold).getTime()
                let newBuySum = newPurchases.map(art => art.price).reduce((acc, cur) => acc += cur)
                $details.buySum -= newBuySum
                $details.balance -= newBuySum
                newBuySum = 0
                cart = []
                return
            }
        } catch(error) {
            console.trace(error)
        }
    }

</script>

<div class="w3-row">

    <div class="w3-col m6">
        <div class="w3-margin-right w3-margin-bottom">
            <div class="w3-large" style="display: inline-block; margin-top: 5px;">
                {#await searchPromise}
                    <i class="fas fa-circle-notch w3-spin"></i>
                {:then}
                    <i class="fas fa-search"></i>
                {/await}
            </div>
            <input  bind:value={search}
                    on:input={input}
                    on:focusin="{() => search = ''}"
                    style="width: calc(100% - 22px)"
                    class="w3-input w3-right"
                    type="text"
                    placeholder="Chercher un article">
        </div>


        {#await searchPromise}
            <div class="w3-center w3-opacity" in:fade={{delay: 200}}>
                <span>Recherche en cours...</span>
            </div>
        {:then}
            {#each articles as article, index (article._id)}
                <div class="w3-margin-right" in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip|local="{{duration: 200}}">
                    <Article article={article} clickable on:select="{() => buy(index)}" comment={`Fourni par ${article.provider.name}`}/>
                </div>
            {/each}

            <!-- Bouton pour prolongé la liste -->
            {#if !articles.length && search.length}

                <div class="w3-center w3-opacity" in:fade={{delay: 200}}>
                    <span>Aucun article trouvé</span>
                </div>

            {:else if articles.length}

                {#if !noMoreResults}
                    {#await moreResultsPromise}
                        <div class="w3-center"><img src="/favicon.ico" alt="Logo trocio" class="w3-spin"></div>
                    {:then}
                        <!-- Bonton pour plus de résultats-->
                        <div class="w3-col underline-div w3-center w3-opacity" on:click={getMoreResults}>
                            <span class="underline-span">Plus de résultats ({articles.length} / {countArticleAvailable})</span>
                        </div>
                    {/await}
                {/if}

            {/if}
            
        {/await}

    </div>

    <div class="w3-col m6">
        <div class="w3-margin-left w3-border w3-round w3-padding">
            {#await buyPromise}
                <Button class="w3-right" variant="outlined">
                    <i class="fas fa-circle-notch w3-spin"></i>
                    Validation de l'achat...
                </Button>
            {:then}
                {#if cart.length}
                    <Button on:click="{() => buyPromise = validBuy()}" class="w3-right" variant="raised">
                        Valider l'achat de{cart.length <= 1 ? ` l'article` : `s ${cart.length} articles`} : {cart.map(a => a.price).reduce((acc, cur) => acc += cur).toFixed(2)}
                    </Button>
                {/if}
            {/await}

            <div class="w3-margin-bottom w3-large">
                <i class="fas fa-shopping-basket"></i>
                <span>{cart.length ? '' : 'Panier'}</span>
            </div>

            {#each cart as article, index (article._id)}
                <div in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">

                    <Article article={article} on:remove="{() => removeArticle(index)}"/>

                </div>

            {:else}
                <span class="w3-opacity">Le panier est vide</span>
            {/each}
        </div>

        <br>
        <div class="w3-margin-left">
            <span class="w3-large">Achats</span>

            {#each $details.purchases.sort(sortByUpdatedAt).slice(0, LIMIT_LIST_B) as article (article._id)}
                <div in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">
                    <Article article={article} timeKey={'soldTime'}/>
                </div>
            {:else}
                <span class="w3-opacity w3-margin-left">Pas d'achat</span>
            {/each}
            
            <!-- Bouton pour prolongé la liste -->
            {#if $details.purchases.length > LIMIT_LIST_B}
                <div on:click="{() => LIMIT_LIST_B += 25}" class="underline-div w3-center">
                    <span class="underline-span w3-opacity">
                        Afficher plus d'éléments ({$details.purchases.length - LIMIT_LIST_B})
                    </span>
                </div>
            {/if}

        </div>

    </div>
</div>




<style>

</style>