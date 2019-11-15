<script>

    import { troc, me } from './stores'
    import { onMount } from 'svelte'
    import { flip } from 'svelte/animate'
    import { crossfade } from 'svelte/transition'
    import Button from '@smui/button'
    import Textfield from '@smui/textfield'
    import Dialog , { Title, Content } from '@smui/dialog'
    import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'
	dayjs.locale('fr')
    dayjs.extend(relativeTime)

    import { getHeader, crossfadeConfig, getFee, getMargin, sortByUpdatedAt, goPrint, formatPrice } from './utils.js'
    import TagsPrint from './TagsPrint.svelte'
    import Article from './Article.svelte'

    export let user = {}
    export let provided = [] //proposed => !art.valided
    export let tarif = undefined //From Resume per Cashier
    export let optionAutoPrintTag = true
    export let providedPromise
    let validPromise //Valid button

    let addArticleDialog

	let nbNewArticles = 0
	let newArticle = {name: '', price: ''}

    const [send, receive] = crossfade(crossfadeConfig)
    
    const LIMIT_LIST_INIT = 5 //Nombre d'élément d'une liste afficher initialement
    let LIMIT_LIST_A = LIMIT_LIST_INIT //Nombre d'élément afficher pour la premier liste
    let LIMIT_LIST_B = LIMIT_LIST_INIT //Nombre d'élément afficher pour la seconde liste

    const proposedFilter = art => !art.recover && !art.sold && art.isRemovable && !art.isCreated

    let articlesToPrint = []

    function createArticle() {
		
        addArticleDialog.close()

        let art = {
            _id: new Date().getTime(),
            troc: $troc._id, 
            provider: user._id,
            name: newArticle.name,
            price: Number(newArticle.price),
            valided: new Date(),
            validator: $me._id,
            isRemovable: true,
            isCreated: true,
            fee: 0,
            margin: 0
        }
        provided = [art, ...provided]
        nbNewArticles++
        newArticle = {name: '', price: ''}
    
        document.getElementById('inputNewArticle').focus()
		
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

    async function validProvided() {

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
        
        if (articlesCreated.length) {
            articlesCreated = await validArticlesCreated(articlesCreated)
        }
        
        if (articlesValided.length) {
            await validArticlesValided(articlesValided)
        }

        //Impression des étiquettes
        if (optionAutoPrintTag) {
            printArticles([...articlesCreated, ...articlesValided])
        }

        return

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
            return json.message
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

    function printArticles(arts) {
        if (arts && arts.length) articlesToPrint = arts
        setTimeout(() => goPrint('providedTags'), 100)
    }


</script>

{#if $troc.tag}
    <TagsPrint id="providedTags" articles={articlesToPrint} width={$troc.tag.width} height={$troc.tag.height} padding={$troc.tag.padding} border={$troc.tag.border}/>
{/if}

<Dialog bind:this={addArticleDialog}>

    <Title>Ajouter un article</Title>

    <Content>
        <br>

        <Textfield
        id="inputNewArticle"
        bind:value={newArticle.name} 
        type="text"
        label="Désignation"
        class="shaped-outlined"
        style="width: 100%;"
        variant="outlined"/>

        <br><br>

        <Textfield
        bind:value={newArticle.price}
        on:input={formatPrice}
        type="text"
        label="Prix"
        class="shaped-outlined"
        variant="outlined"/>

        <Button
        disabled={newArticle.name.length <= 2 || !newArticle.price.length}
        on:click={createArticle}
        style="transform: translate(0px, 20px);"
        variant="outlined" color="secondary" class="w3-right w3-margin-left">
            Ajouter
        </Button>

    </Content>

</Dialog>

<div class="w3-row">

    <div class="w3-col s6">
        <div class="w3-margin-right">

            {#if provided.filter(art => !art.valided).length}
                <Button on:click={clickProposedArticleAll} class="w3-right" variant="outlined" color="secondary">
                    Tout accepter
                </Button>
            {/if}

            <Button on:click="{() => addArticleDialog.open()}" class="w3-right w3-margin-right" variant="outlined" color="secondary">
                Ajouter
            </Button>

            <h4>Proposés</h4>

            {#await providedPromise}
                <div class="w3-center">
                    <img src="/favicon.ico" alt="Logo trocio" class="w3-spin">
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
                <Button variant="raised" class="w3-right" style="color: white;">
                    <i class="fas fa-circle-notch w3-spin"></i>
                    Validation de la livraison...
                </Button>
            {:then}
                {#if nbNewArticles > 0}
                    <Button variant="raised" class="w3-right" on:click="{() => validPromise = validProvided()}" style="color: white;">
                        Valider l{nbNewArticles <= 1 ? `'article fourni` : `es ${nbNewArticles} articles fournis`}
                    </Button>
                {/if}
            {/await}

            <h4>En vente</h4>
            {#await providedPromise}
                <div class="w3-center">
                    <img src="/favicon.ico" alt="Logo trocio" class="w3-spin">
                </div>
            {:then}

                {#each provided.filter(art => art.valided && !art.sold && !art.recover)
                        .sort(sortByUpdatedAt)
                        .slice(0, LIMIT_LIST_B) as article (article._id)}

                    <div in:receive|local="{{key: article._id}}" out:send|local="{{key: article._id}}" animate:flip="{{duration: 200}}">

                        <Article
                        article={article}
                        timeKey={'validTime'}
                        on:remove="{() => removeArticle(article._id)}"
                        printable on:print="{() => printArticles([article])}"/>

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