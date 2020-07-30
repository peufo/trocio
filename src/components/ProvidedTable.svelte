<script>
    import { v4 as uuidv4 } from 'uuid'
    import { slide } from 'svelte/transition'
	import Dialog, {Title, Content} from '@smui/dialog'
    import Menu from '@smui/menu'
    import List, { Item, Text } from '@smui/list'
	import Textfield from '@smui/textfield'
    
    import AutoPatch from './AutoPatch.svelte'
    import notify from './notify.js'

    import { getHeader, sortByUpdatedAt, formatPrice, STATUTS } from './utils'
    import { trocDetails as details } from './stores.js'
    import { getFee, getMargin } from '../../api/controllers/troc_utils'
    const uuid = uuidv4()

	let modifiedArticles = []			//Array for minimize PATCH request on AutoPatch.svelte
    let clearModifiedArticles			//Timeout
    
	let deleteArticlePromise
	let articleWaitValidationForDelete = -1

	let tarifInfoDialog

    const LIMIT_LIST_INIT = 8 //Nombre d'élément d'une liste afficher initialement
    let limitList= LIMIT_LIST_INIT //Nombre d'élément afficher pour la premier liste (Achat)


	let statutFilterMenu
    let statutFilter = -1
    
    let provided = [] 
    $: provided = $details.provided.filter(art => statutFilter === -1 || STATUTS[statutFilter] === art.statut).sort(sortByUpdatedAt)
    
	//For AutoPatch
	function addModifiedArticle(e, art) {

		let index = -1

		//update price value and compute fee and margin
		if (e.target.classList.contains('price-input') && !isNaN(e.target.value)) {
			art.price = e.target.value
			index = $details.provided.map(a => a._id).indexOf(art._id)
			$details.provided[index].fee = getFee(art, $details.tarif)
			$details.provided[index].margin = getMargin(art, $details.tarif)
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
		let res = await fetch(`/articles/${artId}`, getHeader({}, 'DELETE'))
		let json = await res.json()
		if (json.success) {
			let index = $details.provided.map(art => art._id).indexOf(artId)
			if (index == -1) return notify.error('Index not found')
			$details.provided.splice(index, 1)
			$details.provided = $details.provided

            notify.success({title: 'Article supprimé', icon: 'far fa-trash-alt'})

			return
		}else notify.error(json.message)
    }

</script>


{#if provided.length}
    <AutoPatch source="{`tableArticles${uuid}`}" path="/articles" body={modifiedArticles} />
    <div style="padding: 7px 2px;">	
        <table id="{`tableArticles${uuid}`}" class="w3-table">

            <!-- En-têtes -->
            <tr class="w3-small">
                <th>
                    <span>#</span>
                </th>

                <th style="width: 60%; min-width: 170px;">
                    <span>Articles</span>
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
                            <Item on:click={() => statutFilter = -1 }><Text>Tous</Text></Item>
                            {#each STATUTS as statut, i}
                                <Item on:click={() => statutFilter = i }><Text>{statut}</Text></Item>
                            {/each}
                        </List>
                    </Menu>
                </th>

                <th class="clickable" on:click="{() => tarifInfoDialog.open()}">
                    <span>Frais</span><br>
                    <span class="w3-small fee w3-right">
                        {-$details.feeSum.toFixed(2)}
                    </span>
                </th> 

                <th style="max-width: 100px;">
                    <span>Prix</span><br>
                    <span class="w3-small sold w3-right">
                        {$details.soldSum.toFixed(2)}
                    </span>
                </th>

            </tr>

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
                            bind:value={article.name}
                            class="w3-input unvalided" 
                            placeholder="Désignation"></textarea>
                        {/if}

                    </td>

                    <!-- Status -->
                    <td>{article.statut}</td>

                    <!-- Frais -->
                    <td class:w3-opacity={!article.valided} class="fee" class:unvalided={!article.valided} on:click="{() => tarifInfoDialog.open()}">
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
        </table>
    </div>
{:else}
    <br>
    <div class="w3-center">
        <span class="w3-opacity">Aucun article</span>
    </div>
    <br>
{/if}


<!-- Bouton pour prolongé la liste -->
{#if provided.length > limitList}
    <div on:click="{() => limitList += 50}" class="underline-div w3-center">
        <span class="underline-span w3-opacity">
            Afficher plus de résultat ({provided.length - limitList})
        </span><br>
    </div>
{/if}

<!-- Dialogue d'information sur les tarifs -->
{#if $details.tarif}
	<Dialog bind:this={tarifInfoDialog}>
		<Title>Vous êtes soumis au tarif <b>{$details.tarif.name}</b>: </Title>
		<Content>
			<h5>Nombre maximum d'article proposés</h5><br>
			<div style="text-align: center;">
				<b>{$details.tarif.maxarticles}</b> <i class="fas fa-cube"></i>
			</div>
			<br><br>

			<h5>Frais de traitement
				<span class="w3-small w3-opacity">Appliqué au dépot de l'article</span>
			</h5><br>
			<div style="text-align: center;">
				{#each $details.tarif.fee.sort((a, b) => a.price - b.price) as fee}
					A partir de <b>{fee.price.toFixed(2)} </b><i class="fas fa-arrow-right"></i> <b>{fee.value.toFixed(2)}</b>
					<br>
				{/each}
			</div>
			<br><br>

			<h5>Marge
				<span class="w3-small w3-opacity">Appliquée à la vente de l'article</span>
			</h5><br>
			<div style="text-align: center;">
				<b>{$details.tarif.margin * 100}</b> <i class="fas fa-percent"></i>
			</div>
			<br>
			
		</Content>
	</Dialog>
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

</style>
