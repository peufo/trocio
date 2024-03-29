<script lang="ts">
  import { fade } from 'svelte/transition'
  import { isActive, afterPageLoad } from '@roxi/routify'
  import { faTimes } from '@fortawesome/free-solid-svg-icons'

  import { NavigationDrawer } from '$material'

  import IconLink from '$lib/util/IconLink.svelte'
  import layout from '$lib/store/layout'

  export let active = true
  export let isCashier = false

  let content: HTMLDivElement

  let scrollY = 0
  export const width: string = '400px'

  $: if (active) setTimeout(scrollToActiveSection, 600)

  $afterPageLoad(() => {
    scrollToActiveSection()
  })

  function scrollToActiveSection() {
    if (active && content) {
      const section = Array.from(content.querySelectorAll('section')).find(
        ({ dataset }) => $isActive(dataset.path)
      )
      if (section) content.scrollTo({ top: section.offsetTop - 125 })
    }
  }
</script>

<svelte:window bind:scrollY />

<NavigationDrawer
  right
  {active}
  transition={() => ({ duration: 0, css: (t) => '' })}
  fixed
  style="
    width: {width};
    height: {$layout.innerHeight}px;
    padding-top: {scrollY > $layout.headerHeight
    ? 0
    : $layout.headerHeight - scrollY}px;
  "
>
  <div class="tipsHeader d-flex pa-2 pt-4 pb-4">
    <div class="text-h5">Aide</div>
    <div class="flex-grow-1" />
    <IconLink
      icon={faTimes}
      clickable
      opacity
      on:click={() => (active = false)}
    />
  </div>

  {#if active}
    <div transition:fade|local class="content pl-2 " bind:this={content}>
      {#if !isCashier}
        <section data-path="/admin/edit">
          <span class="title">Information</span>
          <p>
            C'est ici que vous pouvez mettre à jour les informations publique
            relatives à votre troc. Attention à l'horaire. Il ne peut plus être
            modifié une fois le troc démarré.
          </p>
        </section>

        <section title="Collaborateurs" data-path="/admin/collab">
          <span class="title">Collaborateurs</span>
          <p>
            Vous pouvez ajouter et supprimer des collaborateurs suivant leur
            rôle. Veillez à ajouter uniquement des collaborateurs de confiances.
          </p>
          <p>
            Les administrateurs ont accès à la page actuel tandis que les
            caissiers ont uniquement accès à la caisse.
          </p>
          <p>
            En ajoutant un utilisateur à la liste des commercants, vous lui
            permetez d'utiliser le préfix que vous avez définit dans ses
            références d'articles. C'est très pratique si il a des centaines
            d'article et qu'il souhaite gérer lui même ses étiquettes.
          </p>
        </section>

        <section title="Tarification" data-path="/admin/tarif">
          <span class="title">Tarification</span>
          <p>
            Vous pouvez créer ou supprimer des tarifs en plus du tarif standard
            auxquels les utilisateurs sont soumis par défaut.
          </p>
          <p>
            Votre part sur les articles vendus définit le pourcentage que vous
            persevez à la vente d'un article. Par exemple, si cette valeur est
            définit à <b>10%</b> . Un article vendu <b>50.-</b>
            vous rapportera <b>5.-</b> et le solde du fournisseur augmentera de
            <b>45.-</b>.
          </p>
          <p>
            Les frais de traitement vous permette de touché un montant définit
            pour chaque article que vous accepter de traiter. Le montant est
            définit en fonction du prix de l'article. Au moment de sa
            validation, le solde du fournisseur diminura du montant
            correspondant.
          </p>
          <p>
            Pour qu'un utilisateur soit soumis à un tarif, il faut l'ajouter
            dans la liste "Valable pour:".
          </p>
          <p>
            Attention, vous vous exposé à des frais dés que vous définisez une
            marge ou des frais de traitement.
          </p>
        </section>

        <section title="Etiquetage" data-path="/admin/tag">
          <span class="title">Etiquetage</span>
          <p>
            Ajustez et testez le format de vos étiquettes. Définissez
            correctement le type d'impression que vous souhaitez mettre en
            place.
          </p>
          <p>
            L'utilisation de codes barres vous évitera beaucoup d'erreur lors
            des passages en caisse. N'importe quel smartphone pourra être
            utilisé comme scanner par vos caissiers.
          </p>
        </section>

        <section title="Statistique" data-path="/admin/statistic">
          <span class="title">Statistique</span>
          <p>
            Commencez par séléctioner le groupe d'utilisateur dont vous
            souhaitez connaître les statistiques.
          </p>
          <p>
            Votre bénéfice théorique est la somme des marges et des frais que
            vous avez perçu sur les
            <b>approvisionement</b>. Ce chiffre peut également être consulté
            dans le solde de la <b>caisse</b>. Attention, un écart entre le
            solde et les paiments signifi que des clients ont un solde non nul.
          </p>
        </section>

        <section title="Gestion" data-path="/admin/managment">
          <span class="title">Gestion</span>
          <p>
            Ici, vous avez un contrôle complet sur ce qu'il ce passe dans votre
            troc.
          </p>
          <p>
            Cliquez sur les entêtes pour appliquer des filtres ou des tri et
            trouvez rapidement ce que vous cherchez. Le bouton <span
              class="button">champs</span
            > vous permet de choisir les colonnes à afficher.
          </p>
          <p>
            Cliquez sur un article pour ouvrir sa carte afin de le mettre à
            jour. Vous pouvez changer le prix, annuler une vente ou une
            validation, changer le client, etc...
          </p>
          <p>
            Attention, il va de soit que votre fournisseur doit être en accord
            avec un changement de prix. Il est de votre devoir de préserver
            l'integrité de vos données.
          </p>
        </section>
      {/if}

      <section data-path="./cashier" data-queryavoid="client">
        <span class="title">Caisse</span>
        <p>Trouvez et séléctionnez votre client grâce au champ de recherche.</p>
        <p>Pensez à utiliser les raccourcis clavier :</p>

        <span class="shortcut mr-2">
          Ctrl + <i class="fas fa-backspace" />
        </span>
        Champ de recherche client
        <br />

        <span class="shortcut mr-2">
          <i class="fas fa-arrow-up" /> |
          <i class="fas fa-arrow-down" />
        </span>
        Choix du client
        <br />

        <span class="shortcut mr-2">Enter</span>
        Sélection d'un client <br />

        <span class="shortcut mr-2">
          Ctrl + <i class="fas fa-backspace" />,<i class="fas fa-backspace" />
        </span>
        Client anonyme
        <br />

        <span class="shortcut mr-2">
          Ctrl + <i class="fas fa-arrow-left" />&nbsp;|&nbsp;<i
            class="fas fa-arrow-right"
          />
        </span>
        Changer d'onglet
        <br />

        <p>
          Si le solde du client sélectioné n'est pas nul, vous pouvez le regler
          en cliquant sur le bouton
          <span class="validButton">régler le solde de ...</span>
          et en validant le dialogue qui apparait. Vous pouvez également utiliser
          la raccourcis suivants :
        </p>

        <span class="shortcut mr-2">Ctrl + Shift + Enter</span>
        Régler le solde
        <br />

        <span class="shortcut mr-2">Enter</span>
        Valider
        <br />

        <span class="shortcut mr-2">Esc</span>
        Abandonner
        <br />

        <p>
          Attention, en fonction du solde, il peut vous être demandé, soit de
          rembourser le client, soit de l'encaisser.
        </p>
        <p>
          Le solde ne correspond pas forcément à la somme des achats qui
          viennent d'être effectué car il est possible que le client ait fournit
          des articles qui on été vendu. Rendez-vous sur l'onglet <span
            class="tab">aperçu</span
          > pour connaître la nature du solde.
        </p>
      </section>

      <section data-query="tab" data-value="provide">
        <span class="title">Fourni</span>
        <p>
          A gauche, les articles proposé par le client sont listés. Vous pouvez
          les accepter un par un en cliquant dessus ou tous en même temps en
          cliquant sur
          <span class="button">Tout accepter</span>
        </p>
        <p>
          Si un client n'a pas proposé ses articles à l'avance, vous avez la
          possibilité de les créer vous même en cliquant sur <span
            class="button">ajouter</span
          >
        </p>
        <p>
          Cliquez ensuite sur <span class="validButton"
            >Valider les articles fournis</span
          > pour enregistrer les articles acceptés. Une références sera alors définit
          automatiquement et l'impression des étiquettes sera lancé si l'option est
          activé.
        </p>
        <p>
          Si vous percevez des frais de traitement, le solde du client sera
          négatif en conséquence. Il est donc conseillé de le regler avant de
          passer au client suivant.
        </p>
        <p>Les clients anonymes ne peuvent pas fournir d'article.</p>
      </section>

      <section data-query="tab" data-value="recover">
        <span class="title">Récupère</span>
        <p>
          Dans la liste de gauche, apparaissent les articles invendu d'un
          client. Vous pouvez les sélectionnr un par un en cliquant dessus ou
          tous en même temps en cliquant sur
          <span class="button">Tout récupérer</span>
        </p>
        <p>
          Cliquez ensuite sur <span class="validButton"
            >Récupèrer les articles</span
          > pour enregistrer les articles rendu à leur propriétaire.
        </p>
        <p>Les clients anonymes ne peuvent pas récupérer d'article.</p>
      </section>

      <section data-query="tab" data-value="buy">
        <span class="title">Achète</span>
        <p>
          Trouvez et sélectionez les articles que votre client souhaite acheter
          pour les ajouter au panier. Pour ce faire, vous pouvez soit utiliser
          la bare de recherche, soit utilisé votre téléphone comme scanner.
          <span class="warning"
            >Cette fonctionalité est en cours de développement</span
          >
        </p>
        <p>
          Validez ensuite le panier pour achever la vente en cliquant sur
          <span class="validButton">Valider l'achat de l'article</span>. Les
          articles seront ajouté à la liste des achats du client et le solde de
          ce dernier diminura de la valeur du panier.
        </p>
        <p>
          Attention, le solde initial du client n'est pas forcément nulle.
          Celui-ci peut avoir fournit des articles qui ont été vendu. Par
          conséquent, le solde après la vente peut ne pas correspondre à la
          valeur du panier. Il est même envisagable qu'un client ai un solde
          positif après un achat. Soyez donc très attentif au sens du paiments.
        </p>
        <p>
          La nature du solde peut être consulté dans l'onglet <span class="tab"
            >aperçu</span
          >.
        </p>
      </section>

      <section data-query="tab" data-value="giveback">
        <span class="title">Retourne</span>
        <p>
          Si vous accorder un droit de retour à vos clients, vous avez ici la
          possibilité de les enregistrer.
        </p>
        <p>
          Sélectionez d'abord le l'article dans la liste des achats de votre
          client. Il est ensuite conseillé de renseigner la raison du retour.
          Vous pouvez maintenant valider le retour en cliquant sur
          <span class="validButton">Valider le retour de l'article</span>
        </p>
        <p>
          Une le retour validé, le solde du client va augmenter de la valeur de
          l'article. Vous pouvez donc procéder au remboursement pour régler le
          solde.
        </p>
        <p>
          Soyez attentif au fait que le solde du fournisseur de l'article sera
          également impacté.
        </p>
      </section>

      <section data-query="tab" data-value="resume">
        <span class="title">Aperçu</span>
        <p>
          Vous pouvez accédez au même apperçu que celui mis à disposition de vos
          participants.
        </p>
        <p>
          Le solde du client est calculé à partir de la somme ses paiements, ses
          achats et ses ventes.
        </p>
        <p>
          Proposer un article ici à exactement le même effet que de le faire sur
          l'onglet <span class="tab">Fourni</span>. Hormis la possibilité que
          avez, comme le client, d'importer une liste d'article en cliquant sur
          l'icône <i class="fas fa-list" />.
        </p>
      </section>
    </div>
  {/if}
</NavigationDrawer>

<style>
  .content {
    height: calc(100% - 68px);
    margin-top: 68px;
    overflow-y: scroll;
    scroll-behavior: smooth;
    background: linear-gradient(
      var(--theme-tables-active),
      var(--theme-surface)
    );
  }

  .tipsHeader {
    position: fixed;
    width: 100%;
    color: var(--theme-text-primary);
    background: var(--theme-tables-active);
  }

  p {
    margin-block-start: 0px;
    margin-block-end: 0px;
    padding-block-start: 1em;
    padding-block-end: 1em;
  }

  .shortcut .fas {
    opacity: 0.7;
  }

  .shortcut {
    padding-left: 3px;
    padding-right: 3px;
    text-align: center;
    background: var(--theme-chips);
    border-radius: 4px;
    font-family: monospace;
    margin-bottom: 1em;
  }

  .button,
  .validButton {
    border-radius: 4px;
    text-transform: uppercase;
    font-size: 0.8em;
    display: inline-block;
  }

  .button {
    color: var(--theme-text-primary);
    border: var(--theme-text-secondary) solid 1px;
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
    opacity: 0.8;
  }

  section {
    padding: 0.5em;
    margin-bottom: 1em;
    background: var(--theme-surface);
    border-radius: 4px;
  }

  section:last-child {
    margin-bottom: 30em;
  }

  ::-webkit-scrollbar-track {
    background: none;
  }
</style>
