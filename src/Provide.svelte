<script>
    import { troc } from './stores'
    import { onMount } from 'svelte'
    import { flip } from 'svelte/animate'
    import { getHeader, crossfadeConfig, getFee, getMargin, sortByUpdatedAt } from './utils.js'
    import { crossfade } from 'svelte/transition'
    import Article from './Article.svelte'
    import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'
	dayjs.locale('fr')
    dayjs.extend(relativeTime)

    export let user = {}
    export let provided = [] //proposed => !art.valided
    export let tarif = undefined //From Resume per Cashier

    export let providedPromise
    let validPromise //Valid button

	let nbNewArticles = 0
	let newArticle = {name: '', price: null}

    const [send, receive] = crossfade(crossfadeConfig)
    
    const LIMIT_LIST_INIT = 5 //Nombre d'élément d'une liste afficher initialement
    let LIMIT_LIST_A = LIMIT_LIST_INIT //Nombre d'élément afficher pour la premier liste
    let LIMIT_LIST_B = LIMIT_LIST_INIT //Nombre d'élément afficher pour la seconde liste

    const proposedFilter = art => !art.recover && !art.sold && art.isRemovable && !art.isCreated

    function createArticle() {
		if (newArticle.name.length > 2 && newArticle.price != null) {
			let art = {
				_id: new Date().getTime(),
				troc: $troc._id, 
				provider: user._id,
				name: newArticle.name,
				price: newArticle.price,
				valided: new Date(),
                isRemovable: true,
                isCreated: true,
                fee: 0,
                margin: 0
			}
            provided = [art, ...provided]
			nbNewArticles++
			newArticle = {name: '', price: null}
		
			document.getElementById('inputNewArticle').focus()

		}
    }

    function removeArticle(artId) {
        let index = provided.map(a => a._id).indexOf(artId)
        if(index > -1) {
            if (provided[index].isCreated) {
                provided.splice(index, 1)
                provided = provided
            }else {            
                provided[index].valided = undefined
                provided[index].isRemovable = false
            }

            nbNewArticles--
        }
    }

    function clickProposedArticle(artId) {
        let index = provided.map(a => a._id).indexOf(artId)
        if (index > -1) {
            provided[index].valided = new Date()
            provided[index].updatedAt = new Date()
            provided[index].isRemovable = true
        }
        nbNewArticles++
    }

    function clickProposedArticleAll() {
        provided.filter(art => !art.valided).forEach(art => clickProposedArticle(art._id))
    }

    function validProvided() {
        
        let articlesCreated = provided.filter(art => !art.recover && !art.sold && art.isCreated)
 
        let articlesValided = provided.filter(art => !art.recover && !art.sold && art.isRemovable && !art.isCreated)
        
        let date = new Date()
        articlesCreated.forEach(art => {
            art.valided = date
            art.fee = getFee(art, tarif)
            art.margin = getMargin(art, tarif)
        })
        articlesValided.forEach(art => {
            art.valided = date
            art.fee = getFee(art, tarif)
            art.margin = getMargin(art, tarif)
        })

        console.log('CreatedArticle : ', articlesCreated)

        if (articlesCreated.length && articlesValided.length) {
            return Promise.all([
                validArticlesCreated(articlesCreated),
                validArticlesValided(articlesValided)
            ])
        }else if (articlesCreated.length) {
            return validArticlesCreated(articlesCreated)
        }else if (articlesValided.length) {
            return validArticlesValided(articlesValided)
        }
    }

    async function validArticlesCreated(articlesCreated) {
        let res = await fetch('/articles', getHeader(articlesCreated))
        let json = await res.json()
        if (res.ok && json.success) {
            let index = 0
            provided = provided.map(article => {
                if (article.isCreated) {
                    article = json.message[index]
                    index++
                }
                return article
            })
            nbNewArticles -= articlesCreated.length
            return
        }
    }

    async function validArticlesValided(articlesValided) {
        let res = await fetch('/articles', getHeader(articlesValided, 'PATCH'))
        let json = await res.json()
        if (res.ok && json.success) {
            provided = provided.map(article => {
                if (article.isRemovable && !article.isCreated) delete article.isRemovable
                return article
            })
            nbNewArticles -= articlesValided.length
            return
        }
    }


</script>

<div>

    <input 	id="inputNewArticle"
            bind:value={newArticle.name} 
            on:keydown="{e => e.which == 13 && createArticle()}"
            type="text" class="w3-input"
            placeholder="Nouvel article fourni"
            style="display: inline-block; width: 78%;">

    <input 	bind:value={newArticle.price}
            on:keydown="{e => e.which == 13 && createArticle()}"
            type="number" min="0"
            class="w3-input w3-right"
            placeholder="Prix"
            style="display: inline-block; width: 20%;">

    <br>
    <br>

    <div class="w3-col s6">
        <div class="w3-right w3-margin-right w3-round button hide"
             class:visible={provided.filter(art => !art.valided).length}
             on:click={clickProposedArticleAll}>
            Tout accepter
        </div>

        <h4>Proposés</h4>
        <div class="w3-margin-right">
            {#await providedPromise}
                <div class="w3-center">
                    <img src="favicon.ico" alt="Logo trocio" class="w3-spin">
                </div>
            {:then}
                {#each provided.filter(art => !art.valided).slice(0, LIMIT_LIST_A) as article (article._id)}
                    <div in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">

                        <Article article={article} clickable on:select="{() => clickProposedArticle(article._id)}"/>
 
                    </div>
                {:else}
                    <span class="w3-opacity">Pas d'articles proposés !</span>
                {/each}

                <!-- Bouton pour prolongé la liste -->
                {#if provided.filter(art => !art.valided).length > LIMIT_LIST_A}
                    <div on:click="{() => LIMIT_LIST_A += 25}" class="underline-div w3-center">
                        <span class="underline-span w3-opacity">
                            Afficher plus d'éléments ({provided.filter(art => !art.valided).length - LIMIT_LIST_A})
                        </span>
                    </div>
                {/if}

            {/await}
        </div>
    </div>


    <div class="w3-col s6">
        <div class="w3-margin-left">

            {#await validPromise}
                <div class="w3-right w3-round validButton">
                    <i class="fas fa-circle-notch w3-spin"></i>
                    Validation de la livraison...
                </div>
            {:then}
                <div class="w3-right w3-round validButton hide" class:visible={nbNewArticles > 0} on:click="{() => validPromise = validProvided()}">
                    Valider l{nbNewArticles <= 1 ? `'article fourni` : `es ${nbNewArticles} articles fournis`}
                </div>
            {/await}

            <h4>En vente</h4>
            {#await providedPromise}
                <div class="w3-center">
                    <img src="favicon.ico" alt="Logo trocio" class="w3-spin">
                </div>
            {:then}

                {#each provided.filter(art => art.valided && !art.sold && !art.recover)
                        .sort(sortByUpdatedAt)
                        .slice(0, LIMIT_LIST_B) as article (article._id)}

                    <div in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">

                        <Article article={article} timeKey={'validTime'} on:remove="{() => removeArticle(article._id)}"/>

                    </div>
                {:else}
                    <span class="w3-opacity">Pas d'articles fournis en magasin !</span>
                {/each}

                <!-- Bouton pour prolongé la liste -->
                {#if provided.filter(art => art.valided && !art.sold && !art.recover).length > LIMIT_LIST_B}
                    <div on:click="{() => LIMIT_LIST_B += 25}" class="underline-div w3-center">
                        <span class="underline-span w3-opacity">
                            Afficher plus d'éléments ({provided.filter(art => art.valided && !art.sold && !art.recover).length - LIMIT_LIST_B})
                        </span>
                    </div>
                {/if}

            {/await}
        </div>
    </div>
</div>