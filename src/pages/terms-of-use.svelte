<script>
    import Footer from 'Footer.svelte'
</script>

<main>
    <br>
    <br>
    <h1 class="w3-center">Conditions d'utilisations</h1>
    <br>

    <h3>Définitions</h3>
    <p>
        Tous les termes décrits ci-dessous ont la même définition indiféremment du genre ou du nombre.
    </p>
    <ul>   
        <li>Les termes "application" et "plateforme" désignent le présent site internet.</li>
        <li>Les termes "Trocio" et "nous" désignent les responsables exploitant l'application.</li>
        <li>Le terme "troc" désigne une manifestation créée et gérée sur l'application.</li>
        <li>Le terme "utilisateur" désigne une personne qui possède un compte sur l'application.</li>
        <li>Le terme "organisateur" désigne une personne ou une organisation ayant accès à la page d'administration ou à la caisse d'un troc.</li>
        <li>Le terme "participant" désigne un utilsateur qui participe à un troc en tant que client ou en tant que fournisseur.</li>
    </ul>

    <h3>Vie privée et données personelles</h3>
    <p>
        Trocio ne requiert que le stricte minimum en termes de données utilisateurs.
        Les interactions effectuées sur la plateforme sont de nature publique.
        Ces actions seront donc potentiellement accessibles par n'importe quels autres utilisateurs.
        Le adresses mails sont par défaut privées.
    </p>
    <p>
        Cependant, lors de la participation à un troc,
        l'utilsateur donne accès à une version partielle de son adresse à l'organisateur.
        Par exemple, l'adresse "tartempion@mail.com" sera transformée en "ta*******n@mail.com".
        Cela est utile pour la recherche et l'indentification d'un utilisateur par l'organisateur.
        De plus, l'utilisateur peut explicitement autoriser l'organisateur
        à voir sont adresse mail complète.
        Cela peut s'avérer utile si l'organisateur souhaite contacter directement un utilisateur
        sans passer par l'application.
    </p>
    <p>
        Lors de la tarifcation d'un troc, l'organisateur sera contraint de completer ses informations personelles.
        Un numéro de carte de crédit valable est nécéssaire. 
        Cette partie sensible du traitement est assurée par l'entreprise Stripe.
    </p>

    <h3>Liens externes</h3>
    <p>
        Les organisateurs peuvent mettre à disposition un lien vers leur site internet.
        Par conséquent, Trocio ne peut être tenu pour responsable de la nature, de la qualité et du contenu de ces sites.
    </p>
    <p>
        Des liens vers le site de Google Maps sont proposés pour faciliter la navigation
        vers les lieux de l'évènement.
    </p>


    <h3>Modération</h3>
    <p>
        Trocio se réserve le droit de modifier ou de supprimer
        tout contenu mis en ligne sur la plateforme qu'il juge inaproprié.
        Une limitation voire une interdiction d'accès peut également être mise en place.
    </p>

    <h3>Responsabilité de l'organisateur</h3>
    <p>
        Lors de la création d'un troc, l'organisateur s'engage à organiser l'évènement 
        de la manière la plus morale et responsable que possible.
    </p>
    <p>
        Son devoir est de faire en sorte que les enregistrements effectué sur l'application,
        que ce soit changement de statut d'article ou paiement, soit constament le plus fidel à la réalité.
        Ayant un grand contrôle sur les données liées à son évenement,
        l'organisateur est le seul à répondre de leurs qualités et de leurs justesses.
        En cas de litige avec un participant, Trocio ne peut en aucun cas être impliqué.
    </p>
    <p>
        Si l'organisateur constate des irrégularités lors de la création et de la gestion de son évènement,
        il est tenu d'en avertir le plus rapidement possible Trocio.
    </p>

    <h3>Non responsabilité</h3>
    <p>
        L'application est fournie en l'état.
        Trocio s'engage a faire tout son possible pour garantir la sécurité et la disponibilité
        de la plateforme.
        Cependant, Trocio ne peut être tenue pour respondable en cas de dysfonctionnement ou
        d'utilisation frauduleuse de la plateforme.
        Tout résponsabilité de Trocio resultant d'un accès à l'application est exclue.
    </p>

    <h3>Conditions générales de vente (CGV)</h3>
    <p>
        L'organisateur s'expose à des frais dès qu'il détermine un tarif payant pour ses participants.
        Le montant des frais représente 2% du benefice effectué par l'organisateur. 
        Le benefice est la somme des frais de traitement et des marges prélevées par l'organisateur sur ses participants.
        Le facture ne peut donc être établie qu'une fois le troc clôturé.
        La clôture a lieu au maximum deux semaines après la fin de l'évènement.
        Cela laisse le temps nécéssaire à l'organisateur pour régler les litiges et rendre tous les invendus.
    </p>
    <p>
        Toute tentative de manipulation des données de l'évènement dans le but de réduire le montant
        des frais entrainera un supplément de 300 CHF pour abus de confiance et frais de surveillance.
        Ce supplément peut être adapté en fonction de la nature et de l'ampleur de la fraude.
        L'organisateur sera également bani de l'application.
    </p>

    <h3>Droit de révocation</h3>
    <p>
        Le droit de révocation est possible jusqu'à ce que l'organisateur
        enregistre son premier bénéfice :
    </p>
    <ul>
        <li>Soit en appliquant des frais de traiement à un article qu'il accepte d'un fournisseur 
        lors de l'étape de validation.</li>
        <li>Soit en récupérant une marge lors de la vente d'un article.</li>
    </ul>

    <br>

    <div class="w3-center w3-opacity">
        <span>Les présentes conditions d'utilisations peuvent évoluer en même temps que l'application</span><br>
        <span>Version 1 publiée le 01.10.2020</span>
    </div>
    <br>

</main>

<Footer/>

<style>

    h3 {
        margin-top: 2em;
    }

    main {
        min-height: 620px;
        max-width: 650px;
        margin: auto;
        text-align: justify;
    }
</style>
