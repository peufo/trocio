<script>
    import { troc } from './stores'
	import { crossfade } from 'svelte/transition'
    import { flip } from 'svelte/animate'
    import Button from '@smui/button'
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

    const LIMIT_LIST_INIT = 5 //Nombre d'élément d'une liste afficher initialement
    let LIMIT_LIST_A = LIMIT_LIST_INIT //Nombre d'élément afficher pour la premier liste
    let LIMIT_LIST_B = LIMIT_LIST_INIT //Nombre d'élément afficher pour la seconde liste

    async function searchArticle() {
        let res = await fetch(`/articles/search?troc=${$troc._id}&search=${search}&available=true${user._id ? `&providernot=${user._id}` :''}`)
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
                    on:focusin="{() => search = ''}"
                    style="width: calc(100% - 22px)"
                    class="w3-input w3-right"
                    type="text"
                    placeholder="Chercher un article">
        </div>


        {#await searchPromise}
            <span class="w3-opacity">Recherche en cours...</span>
        {:then}
            {#each articles.slice(0, LIMIT_LIST_A) as article, index (article._id)}
                <div class="w3-margin-right" in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">
                    <Article article={article} clickable on:select="{() => buy(index)}"/>
                </div>
            {:else}
                <span class="w3-opacity">Pas de résultat</span>
            {/each}

            <!-- Bouton pour prolongé la liste -->
            {#if articles.length > LIMIT_LIST_A}
                <div on:click="{() => LIMIT_LIST_A += 25}" class="underline-div w3-center">
                    <span class="underline-span w3-opacity">
                        Afficher plus de résultat ({articles.length - LIMIT_LIST_A})
                    </span>
                </div>
            {/if}
            
        {/await}

    </div>

    <div class="w3-col s6">
        <div class="w3-margin-left w3-border w3-round w3-padding">
            {#await buyPromise}
                <Button class="w3-right" variant="outlined">
                    <i class="fas fa-circle-notch w3-spin"></i>
                    Validation de l'achat...
                </Button>
            {:then}
                {#if cart.length}
                    <Button on:click="{() => buyPromise = validBuy()}" class="w3-right" variant="outlined">
                        Valider l'achat de{cart.length <= 1 ? ` l'article` : `s ${cart.length} articles`}
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
                <span class="w3-opacity">Le panier {user.name ? `de ${user.name}` : ''} est vide</span>
            {/each}
        </div>

        <br>
        <div class="w3-margin-left">
            <span class="w3-large">Achats</span>

            {#await purchasesPromise}
                <div class="w3-center"><img src="/favicon.ico" alt="Logo trocio" class="w3-spin"></div>
            {:then}
                {#each purchases.slice(0, LIMIT_LIST_B) as article (article._id)}
                    <div in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">
                        <Article article={article} timeKey={'soldTime'}/>
                    </div>
                {:else}
                    <span class="w3-opacity w3-margin-left">Pas d'achat</span>
                {/each}
                
                <!-- Bouton pour prolongé la liste -->
                {#if purchases.length > LIMIT_LIST_B}
                    <div on:click="{() => LIMIT_LIST_B += 25}" class="underline-div w3-center">
                        <span class="underline-span w3-opacity">
                            Afficher plus d'éléments ({purchases.length - LIMIT_LIST_B})
                        </span>
                    </div>
                {/if}

            {/await}


        </div>

    </div>
</div>




<style>

</style>