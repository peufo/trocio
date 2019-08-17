<script>
    import { troc } from './stores'
    import { onMount } from 'svelte'
	import { quintOut } from 'svelte/easing'
	import { crossfade } from 'svelte/transition'
    import { flip } from 'svelte/animate'
    import { getHeader } from './utils.js'
    
    export let user = {}
    export let articles = []
	let nbNewArticles = 0
	let newArticle = {name: '', price: null}

	const [send, receive] = crossfade({
		duration: d => Math.sqrt(d * 200),
		fallback(node, params) {
			const style = getComputedStyle(node)
			const transform = style.transform === 'none' ? '' : style.transform
			return {
				duration: 600,
				easing: quintOut,
				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			}
		}
    })

    onMount(() => {
        if (user._id) getArticles()
    })
    
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
			articles = [art, ...articles]
			nbNewArticles++
			newArticle = {name: '', price: null}
			/*
			fetch('/articles', getHeader({
				troc: $troc._id, 
				provider: user._id,
				name: newArticle.name,
				price: newArticle.price,
				valided: new Date()
			}))
			.then(res => res.json())
			.then(json => {
				if (json.success) {
					articles = [json.message, ...articles]
					newArticle = {name: '', price: null}
				}else alert(json.message)
			})
			*/

			document.getElementById('inputNewArticle').focus()

		}
    }

    function getArticles() {
		fetch(`/articles?provider=${user._id}&troc=${$troc._id}`)
		.then(res => res.json())
		.then(json => articles = json)
	}

    function removeArticle(artId) {
        let index = articles.map(a => a._id).indexOf(artId)
        if(index > -1) {
            if (articles[index].isCreated) {
                articles.splice(index, 1)
                articles = articles
            }else{
                articles[index].valided = undefined
            }
            nbNewArticles--
        }
    }

    function validProvided() {
        
        let articlesCreated = articles.filter(a => a.isCreated)
        let articlesValided = articles.filter(a => a.isRemovable && !a.isCreated)
        
        if (articlesCreated.length) {
            fetch('/articles', getHeader(articlesCreated))
            .then(res => res.json())
            .then(json => {
                if (json.success) {
                    let index = 0
                    articles = articles.map(article => {
                        if (article.isCreated) {
                            article = json.message[index]
                            index++
                        }
                        return article
                    })
                    nbNewArticles -= articlesCreated.length
                }else{
                    console.error(json.message)
                }
            })
        }

        if (articlesValided.length) {
            fetch('/articles', getHeader(articlesValided, 'PATCH'))
            .then(res => res.json())
            .then(json => {
                if (json.success) {
                    articles = articles.map(article => {
                        if (article.isRemovable && !article.isCreated) delete article.isRemovable
                        return article
                    })
                    nbNewArticles -= articlesValided.length
                }
            })
        }
    }
    
    $: console.log(articles)

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
            {#each articles.filter(a => !a.valided) as article (article._id)}
                <div class="list-element w3-padding clickable"
                        in:receive="{{key: article._id}}"
                        out:send="{{key: article._id}}"
                        animate:flip="{{duration: 200}}"
                        on:click="{() => {article.valided = new Date(); article.isRemovable = true; nbNewArticles++}}">
                    {article.name}
                    <br>
                    <span class="w3-tiny w3-right" style="line-height: 1;">{article.price.toFixed(2)}</span>
                </div>
            {:else}
                <span class="w3-opacity">Pas d'articles proposés !</span>
            {/each}
        </div>
    </div>


    <div class="w3-col s6">
        <div class="w3-margin-left">

            <div class="w3-right w3-round validButton hide" class:visible={nbNewArticles > 0} on:click={validProvided}>
                Valider l{nbNewArticles <= 1 ? `'article fourni` : `es ${nbNewArticles} articles fournis`}
            </div>

            <h4>Fournis</h4>

            {#each articles.filter(a => !!a.valided).sort((a, b) => new Date(b.valided).getTime() - new Date(a.valided).getTime()) as article (article._id)}
                <div class="list-element valided w3-padding w3-display-container"
                     class:valided={!article.isRemovable}
                     in:receive="{{key: article._id}}"
                     out:send="{{key: article._id}}"
                     animate:flip="{{duration: 200}}">
                    
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
            {/each}
        </div>
    </div>
</div>

<style>

	.clickable{
		cursor: pointer;
	}
	.validButton {
		cursor: pointer;
		color: white;
		background: rgb(76, 175, 80);
		border: solid 3px;
		border-color: rgb(76, 175, 80);
		transition: all .3s;
		height: 35px;
		padding: 4px 10px 4px 10px;
	}

	.validButton:hover {
		border-color: rgb(76, 130, 80);
	}

	.list-element {
		background: rgb(250, 250, 250);
		border: solid 1px rgb(220, 220, 220);
		margin-bottom: 10px;
		border-radius: 4px;
		overflow-x: hidden;
	}

	.list-element.valided {
		background: white;
	}

	.list-element .fa-trash-alt {
		transform: translate(30px, 0px);
		transition: .15s transform ease;
	}

	.list-element .fa-check {
		transform: translate(20px, 0px) scale(1);
		transition: .15s transform ease;
	}

	.list-element:hover .fa-trash-alt {
		transform: translate(0px, 0px);
	}
	.fa-trash-alt:hover {
		transform: scale(1.3) !important;
	}

	.list-element:hover .fa-check {
		transform: scale(0);
    }
    
    .hide {
        transition: all .2s;
        transform: scale(0);
        opacity: 0;
    }
    
    .visible {
        transform: scale(1) !important;
        opacity: 1 !important;
    }

</style>