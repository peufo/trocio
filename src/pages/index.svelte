<script>
    import DrawingSearch from 'DrawingSearch.svelte'
    import DrawingSold from 'DrawingSold.svelte'
    import Logo from 'LogoV2.svelte'
    import Button from '@smui/button'
    import { user } from "stores.js";

</script>

<img class="participeImg" class:w3-hide={!!$user} src="/images/participe.png" alt="Incitation à participer" style="float: right; margin-right: 60px;">

<main>

    <Button
    href="/search"
    variant="outlined"
    color="secondary"
    style="transform: translate(0px, 10px);"
    class="w3-right w3-large w3-margin-left">
        Trouver un troc
    </Button>

    <span class="w3-jumbo">TROCIO</span>
    
    <p class="w3-xxlarge" style="margin-top: 6px; margin-bottom: 66px;">
        Pour troquer organisé
    </p>
 
    <div class="w3-row">
        <div class="w3-col l4">
            <div style="position: relative; height: 400px;">
                <Logo duration="20" cubeSize="100"/>    
            </div>
        </div>


        <div class="w3-col l8">
            <div class="w3-card w3-round-large w3-padding">
                
                <p>
                    Trocio est un outil simple et éfficace pour échanger vos objects.
                </p><br>
                <p>
                    Que vous soyez organisateur ou amateur de bonnes affaires,
                    Trocio vous offre une structure pour améliorer votre expérience sur des évenements éphemères.
                </p><br>
                <p>
                    L'interface fournit de nombreuses fonctionalitées qui vous permettent de gagner un temps précieux,
                    d'éviter des erreurs et d'être informé en temps réel.
                </p><br>
                <p>
                    Vous pouvez enfin dire adieux à vos vieux tableurs 🙂
                </p><br>     
            </div>
        </div>
    </div>

    <br><br><br><br>
    

    <div class="w3-center w3-xlarge">
        
        <i class="fas fa-arrow-down" style="margin-right: 40px;"></i>

        <Button href="#discover" color="secondary" class="w3-large" style="width: 130px;">
            Découvrir
        </Button>

        <Button href="#propose" color="secondary" class="w3-large" style="width: 130px;">
            Proposer
        </Button>

        <Button href="#organize" color="secondary" class="w3-large" style="width: 130px;">
            Organiser
        </Button>
        <i class="fas fa-arrow-down" style="margin-left: 40px;"></i>
        <br>

    </div>

    <br><br><br>

    <hr>
    <section id="discover">

        <span class="w3-xlarge">Découvrir</span>

        <br><br>

        <div class="w3-row">
            
            <div class="w3-col l6">
                
                <br>

                <p>Trouvez un troc qui correspond à vos attentes près de chez vous et fouillez dans les articles qui y sont proposés.</p>
                
                <br>
                
                <p>Il ne vous reste plus qu'à vous rendre sur place pour profiter de l'évènement.</p> 

            </div>

            <div class="w3-col l6">
                <DrawingSearch/>
            </div>

        </div>

        <br>

        <Button
        href="/search"
        variant="outlined"
        color="secondary"
        class="w3-large">
            Trouver un troc
        </Button>

    </section>

    <br><hr>

    <section id="propose">

        <span class="w3-xlarge">Proposer</span>

        <br><br>

        <div class="w3-row">
            
            <div class="w3-col l6">

                <br>
                <p>Proposez vos articles avant l'évènement et faites gagner du temps à tout le monde.</p>
                <p>Rendez-vous à l'ouverture de l'évènement pour fournir vos objets à l'organisateur.</p>
                <p>Suivez en temps réel votre solde et l'état de vos ventes.</p>
                <p>Récupérez vos gains et vos invendus quand vous le souhaitez.</p>

            </div>

            <div class="w3-col l6">
                <DrawingSold/>
            </div>

        </div>    

        <br>

        <Button
        href="/search"
        variant="outlined"
        color="secondary"
        class="w3-large">
            Trouver un troc
        </Button>        

    </section>

    <br><hr>

    <section id="organize">

        <Button
        variant="outlined"
        color="secondary"
        disabled
        class="w3-right w3-large">
            Organiser un troc
        </Button>

        <span id="organize" class="w3-xlarge">Organiser</span>

        <br><br>

        <div class="feature">
            <div class="feature-title">
                <i class="far fa-calendar-alt"></i>
                <span>Planification</span>
            </div>
            <div class="feature-content">
                <p>Définisez un nom, un lieu et un horaire.</p>
                <p>Deux minutes suffisent pour créer votre troc.</p>
            </div>
        </div>

        <div class="feature">
            <div class="feature-title">
                <i class="fas fa-users"></i>
                <span>Collaborateurs</span>
            </div>
            <div class="feature-content">
                <p>Attribuez des droits d'accès à la page d'administration aux responsables.</p>
                <p>Désignez des caissiers.</p>
                <p>Listez vos plus gros commerçants et permettez-leur d'utiliser un préfixe dans la réference de leurs articles.</p>
            </div>
        </div>

        <div class="feature">
            <div class="feature-title">
                <i class="fas fa-coins"></i>
                <span>Tarifications</span>
            </div>
            <div class="feature-content">
                <p>Définisez votre part sur les articles vendus ainsi que les frais de traitement.</p>
                <p>Établissez la liste des utilisateurs soumis à un tarif.</p>
            </div>
        </div>

        <div class="feature">
            <div class="feature-title">
                <i class="fas fa-tags"></i>
                <span>Étiquetage</span>
            </div>
            <div class="feature-content">
                <p>Paramétrez le format de vos étiquettes pour qu'elles correspondent à vos imprimantes.</p>
                <p>Utilisez des QR-Codes pour réduire les temps de passage en caisse.</p>
            </div>
        </div>

        <div class="feature">
            <div class="feature-title">
                <i class="fas fa-cash-register"></i>
                <span>Caisse</span>
            </div>
            <div class="feature-content">

            </div>
        </div>

        <div class="feature">
            <div class="feature-title">

            </div>
            <div class="feature-content">

            </div>
        </div>

        <div class="feature">
            <div class="feature-title">

            </div>
            <div class="feature-content">

            </div>
        </div>

        <br><br><br>

        
        <p>Définisez le lieu et la date de votre événement.</p>
        <p>Montez ton équipe et définissez vos tarifs.</p>
        <p>Gèrez les dépôts, les récupérations, les achats, les retours et les paiements sur une interface simple et accessible.</p>
        <p>Accèdez à une vue d'ensemble du trafic de votre événement.</p>

    </section>

</main>

<footer>
    Hey, je suis le footer
</footer>

<svelte:head>
    <style>#waitLoaded {display: none;}</style>
</svelte:head>

<style>

    main {
        text-align: justify;
        font-size: 1.1em;
    }

    section {
        padding: 40px 0px;
    }

    section .w3-row .w3-col {
        margin-top: 30px;
        margin-bottom: 30px;
    }

    footer {
        background: #efefef;
    }

    main {
        max-width: 1200px;
        margin: auto;
    }

    @media only screen and (min-width: 850px) {
        main { padding: 50px 100px 100px 50px;}
    }
    @media only screen and (max-width: 850px) {
        main { padding: 10px;}
    }

    .fa-arrow-down {
        animation-name: scrollPlease;
        animation-duration: 5s;
        animation-iteration-count: infinite;
        opacity: .5;
    }

    @keyframes scrollPlease {
        0% {transform: translateY(0px);}
        80% {transform: translateY(0px);}
        85% {transform: translateY(5px);}
        90% {transform: translateY(0px);}
        95% {transform: translateY(5px);}
        100% {transform: translateY(0px);}
    }

    .feature-title {
        text-transform: uppercase;
        font-size: 1.1em;
    }
    .feature-title i {
        opacity: .6;
        font-size: 1.2em;
    }
    .feature-title span {
        margin-left: 10px;
    }

    .feature-content {
        margin-left: .6em;
        padding-left: 1em;
        border-left: 2px solid #ddd;
    }

    .feature-content p {
        line-height: 2;
        margin-top: .6em;
        margin-bottom: .6em;
    }

</style>