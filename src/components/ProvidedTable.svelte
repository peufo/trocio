<script>
    import { slide } from 'svelte/transition'
    import { createEventDispatcher } from 'svelte'
    const dispatch = createEventDispatcher()

    import { Dialog, Menu, List, ListItem } from 'svelte-materialify'
    
    import AutoPatch from './AutoPatch.svelte'
    import notify from './notify.js'

    import { getHeader, getFee, getMargin, sortByUpdatedAt, formatPrice, STATUTS } from './utils'
    import { trocDetails as details } from './stores.js'
    const uuid = String(Math.random()).slice(2)

	let modifiedArticles = []			//Array for minimize PATCH request on AutoPatch.svelte
    let clearModifiedArticles			//Timeout
    
	let deleteArticlePromise
	let articleWaitValidationForDelete = -1

    const LIMIT_LIST_INIT = 8 //Nombre d'élément d'une liste afficher initialement
    let limitList= LIMIT_LIST_INIT //Nombre d'élément afficher pour la premier liste (Achat)

	let statutFilterMenu
    let statutFilter = -1

    let searchName = ''
    let searchNameFocused = false
    let searchRef = ''
    let searchRefFocused = false
    
    let provided = []
    let feeSum = 0
    let soldSum = 0
    $: {
        provided = $details.provided.filter(art => {
            let ok = statutFilter === -1 || STATUTS[statutFilter] === art.statut
            if (ok && searchName) ok = art.name.indexOf(searchName) > -1
            if (ok && searchRef) ok = art.ref.indexOf(searchRef) > -1
            return ok
        }).sort(sortByUpdatedAt)
    }
    
	//For AutoPatch
	function addModifiedArticle(e, art) {

		let index = $details.provided.map(a => a._id).indexOf(art._id)
        
		if (e.target.classList.contains('price-input')) {
            art.price = e.target.value
            $details.provided[index].price = Number(art.price)
            $details.provided[index].fee = getFee(art, $details.tarif)
            $details.provided[index].margin = getMargin(art, $details.tarif)
        } else {
            art.name = e.target.value
            $details.provided[index].name = art.name
        }

		index = modifiedArticles.map(a => a._id).indexOf(art._id)
		if (index == -1) {
			modifiedArticles = [...modifiedArticles, art]
		}else{
			modifiedArticles[index] = art
        }

		clearTimeout(clearModifiedArticles)
		clearModifiedArticles = setTimeout(() => modifiedArticles = [], 700)
    }
    
    function clickDeleteArticle(artId) {
        if (articleWaitValidationForDelete != artId) return articleWaitValidationForDelete = artId
        deleteArticlePromise = deleteArticle(artId)
    }

    async function deleteArticle(artId) {
        try {
            let res = await fetch(`/__API__/articles/${artId}`, getHeader({}, 'DELETE'))
            let json = await res.json()
            if (json.success) {
                let index = $details.provided.map(art => art._id).indexOf(artId)
                if (index == -1) return notify.error('Index not found')
                $details.provided.splice(index, 1)
                $details.provided = $details.provided
    
                notify.success({title: 'Article supprimé', icon: 'far fa-trash-alt'})
    
                return
            }else notify.error(json.message)
        } catch(error) {
			console.trace(error)
		}
    }

</script>



<AutoPatch source="{`tableArticles${uuid}`}" path="/articles" body={modifiedArticles} />
<div style="padding: 7px 2px;">	
    <table id="{`tableArticles${uuid}`}" class="w3-table">

        <!-- En-têtes -->
        <tr class="w3-small">
            <th on:click={() => document.getElementById('searchRef').focus()}>
                <span>#</span>
                &nbsp;<i class="fa fa-search" class:w3-hide={!searchRefFocused && !searchRef}></i>
                <br>
                <input id="searchRef"
                class="searchInput w3-small"
                bind:value={searchRef}
                on:focus={() => searchRefFocused = true}
                on:blur={() => searchRefFocused = false}
                type="text">
            </th>

            <th style="width: 60%; min-width: 170px;" on:click={() => document.getElementById('searchName').focus()}>
                <span>Articles</span><br>
                <i class="fa fa-search" class:w3-hide={!searchNameFocused && !searchName}></i>
                <input id="searchName"
                class="searchInput w3-small"
                bind:value={searchName}
                on:focus={() => searchNameFocused = true}
                on:blur={() => searchNameFocused = false}
                type="text">
            </th>

            <!-- 0=Proposé, 1=En vente, 2=Vendu, 3=Récupéré -->
            <th class="clickable" on:click={() => statutFilterMenu.setOpen(true)}>
                <span>Statuts</span><br>
                <span class="w3-tiny w3-opacity">
                    <i class="fas fa-filter"></i>
                    {statutFilter === -1 ? 'Tous' : STATUTS[statutFilter]}
                </span>
                <Menu bind:this={statutFilterMenu}>
                    <List>
                        <ListItem on:click={() => statutFilter = -1 }><span>Tous</span></ListItem>
                        {#each STATUTS as statut, i}
                            <ListItem on:click={() => statutFilter = i }><span>{statut}</span></ListItem>
                        {/each}
                    </List>
                </Menu>
            </th>

            <th class="clickable" on:click={() => dispatch('openTarifDialog')}>
                <span>Frais</span><br>
                <span class="w3-small fee w3-right">
                    {$details.feeSum.toFixed(2)}
                </span>
            </th> 

            <th style="max-width: 100px;">
                <span>Prix</span><br>
                <span class="w3-small sold w3-right">
                    {$details.soldSum.toFixed(2)}
                </span>
            </th>

        </tr>

        {#if provided.length}
            <!-- Corp -->
            <!-- TODO: Comparaison de string pour STATUTS bof -->
            {#each provided.slice(0, limitList) as article, i (article._id)}

                <tr transition:slide|local>
                    
                    <!-- Ref # -->
                    <td>
                        <span>{article.ref}</span>

                        <div class="removeIcon"
                        class:w3-hide={article.valided}
                        class:w3-red={articleWaitValidationForDelete == article._id}
                        on:mouseleave={() => articleWaitValidationForDelete = -1}
                        on:click={() => clickDeleteArticle(article._id)}>
                            {#await deleteArticlePromise}
                                <i class="fas fa-recycle w3-spin"></i>
                            {:then}
                                <i class="far fa-trash-alt"></i>
                            {/await}
                        </div>
                        
                    </td>

                    <!-- Designation -->
                    <td class:tdInput={!article.valided}>
                        {#if article.valided}
                            <span class:recovered={article.recover}>
                                {article.name}
                            </span>
                        {:else}
                            <textarea
                            rows="3" style="resize: none;"
                            on:input={e =>  addModifiedArticle(e, article)}
                            class:lastInputName="{i == $details.provided.length-1}"  
                            value={article.name}
                            class="w3-input unvalided" 
                            placeholder="Désignation"></textarea>
                        {/if}

                    </td>

                    <!-- Status -->
                    <td>{article.statut}</td>

                    <!-- Frais -->
                    <td class:w3-opacity={!article.valided} class="fee" class:unvalided={!article.valided} on:click={() => dispatch('openTarifDialog')}>
                        {article.fee.toFixed(2)}
                        {@html article.sold ? ` <span class="w3-tiny">+</span> ${article.margin.toFixed(2)}` : ''}
                    </td>

                    <!-- Prix -->
                    <td class:tdInput={!article.valided}>
                        {#if article.valided}
                            <span class="w3-right" class:recovered={article.recover} class:sold={article.sold}>
                                {Number(article.price).toFixed(2)}
                            </span>
                        {:else}
                            <input
                            value={article.price}
                            use:formatPrice
                            on:input={e => addModifiedArticle(e, article)}
                            type="text"
                            style="text-align: right;"
                            class="price-input w3-input unvalided">
                        {/if}
                    </td>

            {/each}

        {:else}
            <br>
            <div class="w3-center">
                <span class="w3-opacity">Aucun article</span>
            </div>
            <br>
        {/if}

    </table>
</div>


<!-- Bouton pour prolongé la liste -->
{#if provided.length > limitList}
    <br>
    <div on:click="{() => limitList += 50}" class="underline-div w3-center">
        <span class="underline-span w3-opacity">
            Afficher plus de résultat ({provided.length - limitList})
        </span>
    </div>
    <br>
{/if}

<style>

	td {
		min-height: 61px;
    }

    .removeIcon {
        cursor: pointer;
        text-align: center;
        padding: 6px 0px;
        margin-top: 0px;
        border-radius: 4px;
        width: 90%;
    }

    .removeIcon i {
        opacity: 0;
        transform: translate(-20px, 0);
        transition: .2s;
    }

	tr:hover .removeIcon i {
        opacity: 1;
		transform: translate(0, 0);
    }
    
	.tdInput {
		padding: 0px;
    }
    
	.w3-input {
		border: none;
	}

	.fee:not(.unvalided) {
		color: red;
	}

	.unvalided {
		opacity: .5;
	}
	.recovered {
		text-decoration: line-through;
	}
	.sold {
		color: green;
	}

    .searchInput {
        border: none;
        outline: none;
    }

    #searchRef {
        width: 40px;
    }

</style>
