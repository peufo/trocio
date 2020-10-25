<script>
    import { fade } from 'svelte/transition'
    import Tip from './Tip.svelte'

    export let open = false
    export let headHeight = 0

    let scrollY
    let delta
    $: if (open) delta = scrollY > headHeight ? 0 : headHeight - scrollY
    $: console.log({delta})

</script>

<svelte:window bind:scrollY></svelte:window>

<div class="tips" class:open style={`height: calc(100% - ${delta}px); top: ${delta}px;`}>

    <div class="tipsHeader">
        <span class="title">Astuces</span>
        <i class="fa fa-times w3-right tipsCloseButton" on:click={() => open = false}></i>
    </div>

    <hr>

    {#if open}
        <div transition:fade|local>
    
            <Tip title="Information" query="tab_admin" value="info">
                <p>
                    C'est ici que vous pouvez mettre à jour les informations publique relatives à votre troc.
                    Attention à l'horaire. Il ne peut plus être modifé une fois le troc démaré.
                </p>
            </Tip>

            <Tip title="Collaborateurs" query="tab_admin" value="collab">
                <p>
                    Vous pouvez ajouter et supprimer des collaborateurs suivant leur rôle.
                    Veillez à ajouter uniquement des collaborateurs de confiances.
                </p>
                <p>
                    Les administrateurs ont accès à la page actuel tandis que les cassier ont uniquement accès à la caisse.
                </p>
                <p>
                    En ajoutant un utilisateur à la liste des commercants, vous lui permetez d'utiliser le préfix 
                    que vous avez définit dans ses références d'articles.
                    C'est très pratique si il a des centaines d'article et qu'il souhaite gérer lui
                    même ses étiquettes.
                </p>
            </Tip>

            <Tip title="Tarification" query="tab_admin" value="tarif">
                <p>
                    Vous pouvez créer ou supprimer des tarifs en plus du tarif standard.
                    Par défaut, les utilisateurs sont soumis au tarif standard. 
                </p>
                <p>
                    Votre part sur les articles vendus définit le pourcentage que vous persevez à la vente d'un article.
                    Par exemple, si cette valeur est définit à <b>10%</b> . Un article vendu <b>50.-</b>
                    vous rapportera <b>5.-</b> et le solde du fournisseur augmentera de <b>45.-</b>.
                </p>
                <p>
                    Les frais de traitement vous permette de touché un montant définit pour chaque article que vous accepter de traiter.
                    Le montant est définit en fonction de prix de prix de l'article.
                    Au moment de la validation d'un article, le solde du fournisseur diminura du montant correspondant.
                </p>
                <p>
                    Pour qu'un utilisateur soit soumis à un tarif, il faut l'ajouter dans la liste "Valable pour:".
                </p>
                <p>
                    Attention, vous vous exposé à des frais dés que vous définisez une marge ou des frais de traitement.
                </p>
            </Tip>

            <Tip title="Etiquetage" query="tab_admin" value="tag">
                <br><br>
            </Tip>
        </div>
    {/if}
</div>

<div class="tipsButton" class:open on:click={() => open = true}>
    <i class="far fa-question-circle"></i>
</div>

<style>
    .tips.open {
        left: 0px;
    }

    .tips {
        width: 400px;
        left: -400px;
        position: fixed;
        overflow-y: scroll;
        border-right: solid 1px #ccc;
        padding: 1em 1em 3em 1em;
        color: rgba(0,0,0,.87);
        transition: left .4s ease;
        text-align: justify;
    }

    .tipsButton {
        position: fixed;
        z-index: 1;
        left: 0px;
        bottom: 40px;
        background: rgb(32, 151, 243);
        color: #fff;
        padding: .3em .6em;
        font-size: 1.5em;
        border-radius: 0 2.1em 2.1em 0;
        cursor: pointer;
        transition: all .4s ease;
    }
    
    .tipsButton:hover {
        padding: .3em .6em .3em 1em;
    }

    .tipsButton.open {
        left: -100px;
    }

    .tipsHeader {
        padding-top: .4em;
    }
    .tipsHeader .title {
        font-size: 1.5em;
    }

    .tipsCloseButton {
        font-size: 1.3em;
        padding-top: .26em;
        cursor: pointer;
    }

    p {
        margin-block-start: 0px;
        margin-block-end: 0px;
        padding-block-start: 1em;
        padding-block-end: 1em;
    }

</style>
