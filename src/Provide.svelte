<script>
    import { troc } from './stores'
    import { onMount } from 'svelte'
    import { flip } from 'svelte/animate'
    import { getHeader, crossfadeConfig } from './utils.js'
    import { crossfade } from 'svelte/transition'
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


    
    $: console.log(proposed)
    $: console.log(provided)

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
                    <div class="list-element w3-padding clickable"
                            in:receive="{{key: article._id}}"
                            out:send="{{key: article._id}}"
                            animate:flip="{{duration: 200}}"
                            on:click="{() => clickProposedArticle(article._id)}">
                        {article.name}
                        <br>
                        <span class="w3-tiny w3-right" style="line-height: 1;">{article.price.toFixed(2)}</span>
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
                    <div in:receive="{{key: article._id}}"
                        out:send="{{key: article._id}}"
                        animate:flip="{{duration: 200}}">

                        {#if article.validTime}
                            <i class="w3-right w3-small" style="transform: translate(0px, 6px);">
                                {dayjs(article.validTime).fromNow()}
                            </i>
                            <br>
                        {/if}

                        <div class="list-element valided w3-padding w3-display-container" class:valided={!article.isRemovable}>
                            
                            {article.name}
                            <br>
                            <span class="w3-tiny w3-right" style="line-height: 1;">{article.price.toFixed(2)}</span>
                            

                            <div class="w3-display-topright w3-padding">
                                {#if article.isRemovable}
                                    
                                    <i class="fa fa-check" style="margin-top: 4px;"></i>
                                    <i 	class="fa fa-trash-alt clickable"
                                        style="margin-top: 4px;"
                                        on:click="{() => removeArticle(article._id)}"></i>
                                    
                                {:else}
                                    <i class="fa fa-tag" style="margin-top: 4px;"></i>
                                        ref12353
                                {/if}
                            </div>
                        
                        </div>

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