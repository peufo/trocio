<script>
    import { fade } from 'svelte/transition'
    import { params } from '@roxi/routify'

    import Tip from './Tip.svelte'

    export let open = true
    export let headHeight = 0
    export let isCashier = false

    let content

    let scrollY
    let delta
    $: if (open) delta = scrollY > headHeight ? 0 : headHeight - scrollY
    
    $: if ($params) scrollToActiveSection()

    function scrollToActiveSection() {
        if (open) {
            let section = Array.from(content.querySelectorAll('section')).find(s => $params[s.dataset.query] === s.dataset.value && !$params[s.dataset.queryavoid])
            if (section) content.scrollTo({top: section.offsetTop - 50})
        }
    }

    function setOpen() {
        open = true
        setTimeout(scrollToActiveSection, 600)
    }

</script>

<svelte:window bind:scrollY></svelte:window>

<div class="container" class:open style={`height: calc(100% - ${delta}px); top: ${delta}px;`}>

    <div class="tipsHeader">
        <span class="title" style="color: #fff;">Aides</span>
        <i class="fa fa-times w3-right tipsCloseButton" on:click={() => open = false}></i>
    </div>

    {#if open}
        <div transition:fade|local class="content" bind:this={content}>
            {#if !isCashier}
                <section data-query="tab_admin" data-value="info">
                    <span class="title">Information</span>
                    <p>
                        C'est ici que vous pouvez mettre à jour les informations publique relatives à votre troc.
                        Attention à l'horaire. Il ne peut plus être modifié une fois le troc démarré.
                    </p>
                </section>

                <section title="Collaborateurs" data-query="tab_admin" data-value="collab">
                    <span class="title">Collaborateurs</span>
                    <p>
                        Vous pouvez ajouter et supprimer des collaborateurs suivant leur rôle.
                        Veillez à ajouter uniquement des collaborateurs de confiances.
                    </p>
                    <p>
                        Les administrateurs ont accès à la page actuel tandis que les caissiers ont uniquement accès à la caisse.
                    </p>
                    <p>
                        En ajoutant un utilisateur à la liste des commercants, vous lui permetez d'utiliser le préfix 
                        que vous avez définit dans ses références d'articles.
                        C'est très pratique si il a des centaines d'article et qu'il souhaite gérer lui
                        même ses étiquettes.
                    </p>
                </section>

                <section title="Tarification" data-query="tab_admin" data-value="tarif">
                    <span class="title">Tarification</span>
                    <p>
                        Vous pouvez créer ou supprimer des tarifs en plus du tarif standard
                        auxquels les utilisateurs sont soumis par défaut. 
                    </p>
                    <p>
                        Votre part sur les articles vendus définit le pourcentage que vous persevez à la vente d'un article.
                        Par exemple, si cette valeur est définit à <b>10%</b> . Un article vendu <b>50.-</b>
                        vous rapportera <b>5.-</b> et le solde du fournisseur augmentera de <b>45.-</b>.
                    </p>
                    <p>
                        Les frais de traitement vous permette de touché un montant définit pour chaque article que vous accepter de traiter.
                        Le montant est définit en fonction du prix de l'article.
                        Au moment de sa validation, le solde du fournisseur diminura du montant correspondant.
                    </p>
                    <p>
                        Pour qu'un utilisateur soit soumis à un tarif, il faut l'ajouter dans la liste "Valable pour:".
                    </p>
                    <p>
                        Attention, vous vous exposé à des frais dés que vous définisez une marge ou des frais de traitement.
                    </p>
                </section>

                <section title="Etiquetage" data-query="tab_admin" data-value="tag">
                    <span class="title">Etiquetage</span>
                    <p>
                        Ajustez et testez le format de vos étiquettes.
                        Définissez correctement le type d'impression que vous souhaitez mettre en place.
                    </p>
                    <p>
                        L'utilisation de codes barres vous évitera beaucoup d'erreur lors des passages en caisse.
                        N'importe quel smartphone pourra être utilisé comme scanner par vos caissiers.
                    </p>
                </section>

                <section title="Statistique" data-query="tab_admin" data-value="statistic">
                    <span class="title">Statistique</span>
                    <p>
                        Commencez par séléctioner le groupe d'utilisateur dont vous souhaitez connaître les statistiques.
                    </p>
                    <p>
                        Votre bénéfice théorique est la somme des marges et des frais que vous avez perçu sur les
                        <b>approvisionement</b>.
                        Ce chiffre peut également être consulté dans le solde de la <b>caisse</b>.
                        Attention, un écart entre le solde et les paiments signifi que des clients ont un solde non nul.
                    </p>
                </section>

                <section title="Gestion" data-query="tab_admin" data-value="managment">
                    <span class="title">Gestion</span>
                    <p>
                        Ici, vous avez un contrôle complet sur ce qu'il ce passe dans votre troc.
                    </p>
                    <p>
                        Cliquez sur les entêtes pour appliquer des filtres ou des tri et trouvez rapidement ce que vous cherchez.
                        Le bouton <span class="button">champs</span> vous permet de choisir les colonnes à afficher.
                    </p>
                    <p>
                        Cliquez sur un article pour ouvrir sa carte afin de le mettre à jour.
                        Vous pouvez changer le prix, annuler une vente ou une validation, changer le client, etc...
                    </p>
                    <p>
                        Attention, il va de soit que votre fournisseur doit être en accord avec un changement de prix.
                        Il est de votre devoir de préserver l'integrité de vos données.
                    </p>
                </section>
            {/if}

            <section data-query="tab_admin" data-value="cashier" data-queryavoid="client">
                <span class="title">Caisse</span>
                <p>
                    Trouvez et séléctionnez votre client grâce au champ de recherche.
                </p>
                <p>
                    Pensez à utiliser les raccourcis clavier : 
                </p>
                <div class="w3-row">
                    <span class="w3-col s7">
                        Champ de recherche client
                    </span>
                    <span class="w3-col s5 shortcut">
                        Ctrl + <i class="fas fa-backspace"></i>
                    </span>
                </div>
                <div class="w3-row">
                    <span class="w3-col s7">
                        Choix du client
                    </span>
                    <span class="w3-col s5 shortcut">
                        <i class="fas fa-arrow-up"></i>&nbsp;|&nbsp;<i class="fas fa-arrow-down"></i>
                    </span>
                </div>
                <div class="w3-row">
                    <span class="w3-col s7">
                        Sélection d'un client
                    </span>
                    <span class="w3-col s5 shortcut">Enter</span>
                </div>
                <div class="w3-row">
                    <span class="w3-col s7">
                        Client anonyme
                    </span>
                    <span class="w3-col s5 shortcut">
                        Ctrl + <i class="fas fa-backspace"></i>,<i class="fas fa-backspace"></i>
                    </span>
                </div>
                <div class="w3-row">
                    <span class="w3-col s7">
                        Changer d'onglet
                    </span>
                    <span class="w3-col s5 shortcut">
                        Ctrl + <i class="fas fa-arrow-left"></i>&nbsp;|&nbsp;<i class="fas fa-arrow-right"></i>
                    </span>
                </div>

                <p>
                    Si le solde du client sélectioné n'est pas nul, vous pouvez le regler en cliquant sur le bouton
                    <span class="validButton">régler le solde de ...</span>
                    et en validant le dialogue qui apparait. Vous pouvez également utiliser la raccourcis suivants :
                </p>

                <div class="w3-row">
                    <span class="w3-col s6">Régler le solde</span>
                    <span class="w3-col s6 shortcut">Ctrl + Shift + Enter</span>
                </div>
                <div class="w3-row">
                    <span class="w3-col s6">Valider</span>
                    <span class="w3-col s6 shortcut">Enter</span>
                </div>
                <div class="w3-row">
                    <span class="w3-col s6">Abandonner</span>
                    <span class="w3-col s6 shortcut">Esc</span>
                </div>

                <p>
                    Attention, en fonction du solde, il peut vous être demandé, soit de rembourser le client, soit de l'encaisser.
                </p>
                <p>
                    Le solde ne correspond pas forcément à la somme des achats qui viennent d'être
                    effectué car il est possible que le client ait fournit des articles qui on été vendu.
                    Rendez-vous sur l'onglet <span class="tab">aperçu</span> pour connaître la nature du solde.
                </p>
                
            </section>

            <section data-query="tab" data-value="provide">
                <span class="title">Fourni</span>
                <p>
                    A gauche, les articles proposé par le client sont listés.
                    Vous pouvez les accepter un par un en cliquant dessus ou tous en même temps en cliquant sur
                    <span class="button">Tout accepter</span>
                </p>
                <p>
                    Si un client n'a pas proposé ses articles à l'avance, vous avez la
                    possibilité de les créer vous même en cliquant sur <span class="button">ajouter</span>
                </p>
                <p>
                    Cliquez ensuite sur <span class="validButton">Valider les articles fournis</span> pour
                    enregistrer les articles acceptés.
                    Une références sera alors définit automatiquement et l'impression des étiquettes sera lancé
                    si l'option est activé.
                </p>
                <p>
                    Si vous percevez des frais de traitement, le solde du client sera négatif en conséquence.
                    Il est donc conseillé de le regler avant de passer au client suivant.
                </p>
                <p>
                    Les clients anonymes ne peuvent pas fournir d'article.
                </p>
            </section>

            <section data-query="tab" data-value="recover">
                <span class="title">Récupère</span>
                <p>
                    Dans la liste de gauche, apparaissent les articles invendu d'un client.
                    Vous pouvez les sélectionnr un par un en cliquant dessus ou tous en même temps en cliquant sur
                    <span class="button">Tout récupérer</span>
                </p>
                <p>
                    Cliquez ensuite sur <span class="validButton">Récupèrer les articles</span> pour
                    enregistrer les articles rendu à leur propriétaire.
                </p>
                <p>
                    Les clients anonymes ne peuvent pas récupérer d'article.
                </p>
            </section>

            <section data-query="tab" data-value="buy">
                <span class="title">Achète</span>
                <p>
                    Trouvez  et sélectionez les articles que votre client souhaite acheter
                    pour les ajouter au panier.
                    Pour ce faire, vous pouvez soit utiliser la bare de recherche, soit utilisé votre téléphone comme scanner.
                    <span class="warning">Cette fonctionalité est en cours de développement</span>
                </p>
                <p>
                    Validez ensuite le panier pour achever la vente en cliquant sur
                    <span class="validButton">Valider l'achat de l'article</span>.
                    Les articles seront ajouté à la liste des achats du client et le solde de ce dernier diminura de la valeur du panier.
                </p>
                <p>
                    Attention, le solde initial du client n'est pas forcément nulle.
                    Celui-ci peut avoir fournit des articles qui ont été vendu.
                    Par conséquent, le solde après la vente peut ne pas correspondre à la valeur du panier.
                    Il est même envisagable qu'un client ai un solde positif après un achat.
                    Soyez donc très attentif au sens du paiments.
                </p>
                <p>
                    La nature du solde peut être consulté dans l'onglet <span class="tab">aperçu</span>.
                </p>
            </section>

            <section data-query="tab" data-value="giveback">
                <span class="title">Retourne</span>
                <p>
                    Si vous accorder un droit de retour à vos clients, 
                    vous avez ici la possibilité de les enregistrer.
                </p>
                <p>
                    Sélectionez d'abord le l'article dans la liste des achats de votre client.
                    Il est ensuite conseillé de renseigner la raison du retour.
                    Vous pouvez maintenant valider le retour en cliquant sur
                    <span class="validButton">Valider le retour de l'article</span>
                </p>
                <p>
                    Une le retour validé, le solde du client va augmenter de la valeur de l'article.
                    Vous pouvez donc procéder au remboursement pour régler le solde.
                </p>
                <p>
                    Soyez attentif au fait que le solde du fournisseur de l'article sera également impacté.
                </p>

            </section>

            <section data-query="tab" data-value="resume">
                <span class="title">Aperçu</span>
                <p>
                    Vous pouvez accédez au même apperçu que celui mis à disposition
                    de vos participants.
                </p>
                <p>
                    Le solde du client est calculé à partir
                    de la somme ses paiements, ses achats et ses ventes.
                </p>
                <p>
                    Proposer un article ici à exactement le même effet que de le 
                    faire sur l'onglet <span class="tab">Fourni</span>.
                    Hormis la possibilité que avez, comme le client,
                    d'importer une liste d'article en cliquant sur l'icône <i class="fas fa-list"></i>.
                </p>
            </section>

        </div>
    {/if}
</div>

<div class="tipsButton" class:open on:click={setOpen}>
    <i class="far fa-question-circle"></i>
</div>

<style>
    .container.open {
        left: 0px;
    }

    .container {
        position: fixed;
        width: 400px;
        left: -400px;
        border-right: solid 1px #ccc;
        color: rgba(0,0,0,.87);
        transition: left .4s ease;
        text-align: justify;
    }

    .content {
        padding: 0em calc(1em - 10px) 1em 1em;
        height: calc(100% - 48px);
        overflow-y: scroll;
        scroll-behavior: smooth;
        background: linear-gradient(#bbb, #fff);
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
        padding:.5em .5em .5em 1em;
        color: #fff;
        background:#bbb;
    }
    .tipsHeader .title {
        font-size: 1.5em;
    }

    .tipsCloseButton {
        font-size: 1.3em;
        padding: .5em 1em;
        cursor: pointer;
    }

    p {
        margin-block-start: 0px;
        margin-block-end: 0px;
        padding-block-start: 1em;
        padding-block-end: 1em;
    }

    .shortcut .fas {
        opacity: .7;
    }
    
    .shortcut {
        text-align: center;
        background: #eee;
        border-radius: 4px;
        font-family: monospace;
        margin-bottom: 1em;
    }

    .button, .validButton {
        border-radius: 4px;
        text-transform: uppercase;
        font-size: .8em;
        display: inline-block;
    }

    .button {
        color: #444;
        border: #444 solid 1px;
        font-weight: 400;
        padding: 1px 10px;
    }

    .validButton {
        color: #fff;
        background: rgba(76, 175, 80, 0.8);
        padding: 1px 10px;
    }

    .tab {
        border-bottom: 1px solid black;
        text-transform: uppercase;
        font-weight: 400;
        opacity: .8;
    }

    section {
        padding: .5em;
        margin-bottom: 1em;
        background: #fff;
        border: 1px solid #eee;
        border-radius: 4px;
    }

    section:last-child {
        margin-bottom: 30em;
    }

    ::-webkit-scrollbar-track { background: none }

</style>
