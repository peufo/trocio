<script>
    import { troc } from './stores'
	import { crossfade } from 'svelte/transition'
    import { flip } from 'svelte/animate'
    import { getHeader, crossfadeConfig } from './utils'
    import Article from './Article.svelte'
    import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'
	dayjs.locale('fr')
	dayjs.extend(relativeTime)

    export let user = {}
    export let purchases = []
    export let purchasesPromise

    const [send, receive] = crossfade(crossfadeConfig)
    
    let articles = [] //search
    let searchPromise
    let search = ''
    let cart = []
    let buyPromise
    let waiting


    async function searchArticle() {
        let res = await fetch(`/articles/search?troc=${$troc._id}&search=${search}&providernot=${user._id}&available=true`)
        let json = await res.json()
        if (res.ok) {
            articles = json.filter(a => cart.map(c => c._id).indexOf(a._id) == -1)
            return 
        }
    }

    function input(){
		clearTimeout(waiting)
        if (search.length > 0) {
            waiting = setTimeout(() => searchPromise = searchArticle(), 100)
        }else{
            articles = []
        }
	}

    $: console.log(articles)
    
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
            return {
                _id: article._id,
                sold,
                buyer: user._id
            }
        })

        let res = await fetch('/articles', getHeader(patchedArticles, 'PATCH'))
        let json = await res.json()
        if (res.ok && json.success) {
            purchases = [...json.message, ...purchases]
            purchases[0].soldTime = new Date(purchases[0].sold).getTime()
            cart = []
            return
        }
    }

</script>

<div class="w3-row">

    <div class="w3-col s6">
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
                    style="width: calc(100% - 22px)"
                    class="w3-input w3-right"
                    type="text"
                    placeholder="Chercher un article">
        </div>


        {#each articles as article, index (article._id)}
            <div class="w3-margin-right" in:receive="{{key: article._id}}" out:send="{{key: article._id}}" animate:flip="{{duration: 200}}">

                <Article article={article} clickable on:select="{() => buy(index)}"/>
 
            </div>
        {:else}
            {#await searchPromise}
                <span class="w3-opacity">Recherche en cours...</span>
            {:then}
                {#if search.length}
                    <span class="w3-opacity">Pas résultat pour le recherche <b>"{search}"</b></span>
                {/if}
            {/await}
        {/each}

    </div>


    <div class="w3-col s6">
        <div class="w3-margin-left w3-border w3-round w3-padding">
            {#await buyPromise}
                <div class="w3-right w3-round validButton">
                    <i class="fas fa-circle-notch w3-spin"></i>
                    Validation de l'achat...
                </div>
            {:then}
                <div class="w3-right w3-round validButton hide" class:visible={cart.length > 0} on:click="{() => buyPromise = validBuy()}">
                    Valider l'achat de{cart.length <= 1 ? ` l'article` : `s ${cart.length} articles`}
                </div>
            {/await}

            <div class="w3-margin-bottom w3-large">
                <i class="fas fa-shopping-basket"></i>
                <span>Panier</span>
            </div>

            {#each cart as article, index (article._id)}
                <div in:receive="{{key: article._id}}" out:send="{{key: article._id}}" animate:flip="{{duration: 200}}">

                    <Article article={article} on:remove="{() => removeArticle(index)}"/>

                </div>

            {:else}
                <span class="w3-opacity">Le panier de {user.name} est vide</span>
            {/each}
        </div>

        <br>
        <div class="w3-margin-left">
            <span class="w3-large">Achats</span>

            {#await purchasesPromise}
                <div class="w3-center"><img src="favicon.ico" alt="Logo trocio" class="w3-spin"></div>
            {:then}
                {#each purchases as article (article._id)}
                    
                    <div in:receive="{{key: article._id}}" out:send="{{key: article._id}}" animate:flip="{{duration: 200}}">

                        <Article article={article} timeKey={'soldTime'}/>

                    </div>
                    
                {:else}
                    <span class="w3-opacity w3-margin-left">Pas d'achat</span>
                {/each}
            {/await}

        </div>

    </div>
</div>




<style>

</style>