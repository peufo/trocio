<script>
    import { troc } from './stores'
    import { onMount } from 'svelte'
    import { flip } from 'svelte/animate'
    import { getHeader, crossfadeConfig } from './utils.js'
    import { crossfade } from 'svelte/transition'
    import Article from './Article.svelte'
    import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'
	dayjs.locale('fr')
    dayjs.extend(relativeTime)

    export let user = {}
    export let proposed = []
    export let provided = []
    export let articlesPromise
    let providePromise

	let nbNewArticles = 0
	let newArticle = {name: '', price: null}

	const [send, receive] = crossfade(crossfadeConfig)

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
                isCreated: true
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
            if (!provided[index].isCreated) {
                proposed = [provided[index], ...proposed]
            }
            provided.splice(index, 1)
            provided = provided
            nbNewArticles--
        }
    }

    function clickProposedArticle(artId) {
        let index = proposed.map(a => a._id).indexOf(artId)
        if (index > -1) {
            proposed[index].valided = new Date()
            proposed[index].isRemovable = true
            provided = [proposed[index], ...provided]
            proposed.splice(index, 1)
            proposed = proposed
        }
        nbNewArticles++
    }

    function validProvided() {
        
        let articlesCreated = provided.filter(art => !art.recover && art.isCreated)
        let articlesValided = provided.filter(art => !art.recover && art.isRemovable && !art.isCreated)
        
        let date = new Date()
        articlesCreated.forEach(art => art.valided = date)
        articlesValided.forEach(art => art.valided = date)

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
        <div class="w3-margin-right">
            <h4>Proposés</h4>
            {#await articlesPromise}
                <div class="w3-center">
                    <img src="favicon.ico" alt="Logo trocio" class="w3-spin">
                </div>
            {:then}
                {#each proposed as article (article._id)}
                    <div in:receive="{{key: article._id}}" out:send="{{key: article._id}}" animate:flip="{{duration: 200}}">

                        <Article article={article} clickable on:select="{() => clickProposedArticle(article._id)}"/>
 
                    </div>
                {:else}
                    <span class="w3-opacity">Pas d'articles proposés !</span>
                {/each}
            {/await}
        </div>
    </div>


    <div class="w3-col s6">
        <div class="w3-margin-left">

            {#await providePromise}
                <div class="w3-right w3-round validButton">
                    <i class="fas fa-circle-notch w3-spin"></i>
                    Validation de la livraison...
                </div>
            {:then}
                <div class="w3-right w3-round validButton hide" class:visible={nbNewArticles > 0} on:click="{() => providePromise = validProvided()}">
                    Valider l{nbNewArticles <= 1 ? `'article fourni` : `es ${nbNewArticles} articles fournis`}
                </div>
            {/await}

            <h4>Fournis</h4>
            {#await articlesPromise}
                <div class="w3-center">
                    <img src="favicon.ico" alt="Logo trocio" class="w3-spin">
                </div>
            {:then}
                {#each provided.filter(art => !art.sold && !art.recover) as article (article._id)}
                    <div in:receive="{{key: article._id}}" out:send="{{key: article._id}}" animate:flip="{{duration: 200}}">

                        <Article article={article} timeKey={'validTime'} on:remove="{() => removeArticle(article._id)}"/>

                    </div>
                {:else}
                    <span class="w3-opacity">Pas d'articles fournis en magasin !</span>
                {/each}
            {/await}
        </div>
    </div>
</div>

<style>

</style>