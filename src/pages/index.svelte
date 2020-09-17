<script>
    import DrawingSearch from 'DrawingSearch.svelte'
    import DrawingSold from 'DrawingSold.svelte'
    import Logo from 'LogoV2.svelte'
    import Button from '@smui/button'
    import { user } from "stores.js";

</script>

<img class="participeImg" class:w3-hide={!!$user} src="/images/participe.png" alt="Incitation à participer" style="float: right; margin-right: 60px;">

<main>
    
    <span class="w3-jumbo">TROCIO</span>
    
    <p class="w3-xxlarge" style="margin-top: 6px; margin-bottom: 66px;">
        Pour troquer organisé
        <Button
        href="/search"
        variant="outlined"
        color="secondary"
        style="transform: translate(0px, 10px);"
        class="w3-right w3-large w3-margin-left">
            Trouver un troc
        </Button>
        
    </p>

    <div class="w3-row">

        <div id="is-card" class="w3-col l7">
            <div id="is" class="w3-card-4">
                <div class="w3-xlarge w3-green w3-padding w3-center w3-opacity">
                    <span>C'est ...</span>
                </div>
                <ul class="w3-padding w3-large w3-ul">
                    <li>
                        <i class="fas fa-check w3-xlarge"></i>&nbsp;
                        <span>Des évenements pour échanger vos objets</span>
                    </li>
                    <li>
                        <i class="fas fa-check w3-xlarge"></i>&nbsp;
                        <span>Un outil d'organisation simple et efficace</span>
                    </li>
                </ul>
            </div>
        </div>

        <div id="isnt-card" class="w3-col l5">
            <div id="isnt" class="w3-card-4">
                <div class="w3-xlarge w3-red w3-padding w3-center w3-opacity">
                    Ce n'est pas ...
                </div>
                <ul class="w3-padding w3-large w3-ul">
                    <li>
                        <i class="fas fa-times w3-xlarge"></i>&nbsp;
                        <span>Un site de vente en ligne</span>
                    </li>
                    <li>
                        <i class="fas fa-times w3-xlarge"></i>&nbsp;
                        <span>Un intermédiaire à but lucratif</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <br>
    <div class="w3-row">
        <div class="w3-col l4" style="height: 250px;">
            <div style="position: relative; height: 100%;">
                <!--

                <Logo duration="30" cubeSize="90"/>
                -->
            </div>
        </div>

        <div class="w3-col l8">
            <div id="and" class="w3-card-4">
                <div class="w3-xlarge w3-blue w3-padding w3-center w3-opacity">
                    Et donc ?
                </div>
                <div class="w3-padding text-content">
                    <p>
                        Que vous soyez organisateur ou amateur de bonnes affaires,
                        Trocio vous offre une structure pour facilité vos échanges d'objets lors d'évenements éphemères.
                    </p>
                    <p>
                        L'interface fournis de nombreuse fonctionalitées qui vous permettrons de gagner un temps précieux,
                        d'éviter de grâves erreurs et d'être informé en temps réel.
                    </p>
                    <p>
                        Vous pouvez enfin dire adieux à vos vieux tableurs : )
                    </p>
                </div>
            </div>
        </div>

    </div>
    
   

    <br><br>

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

    <br><br>

    <hr>
    <section id="discover">

        <span class="w3-xlarge">Découvrir</span>

        <br><br>

        <div class="w3-row">
            
            <div class="w3-col l6 text-content">
                
                <br>

                <p>Trouvez un troc qui correspond à vos attentes près de chez vous et fouillez dans les articles qui y sont proposés.</p>
                
                <br>
                
                <p>Il ne vous reste plus qu'a vous rendre sur place pour profiter de l'évenement.</p> 

                <br><br>

                <Button
                href="/search"
                variant="outlined"
                color="secondary"
                class="w3-large">
                    Trouver un troc
                </Button>

            </div>

            <div class="w3-col l6">
                <DrawingSearch/>
            </div>

        </div>
    </section>

    <br><hr>

    <section id="propose">

        <Button
        href="/search"
        variant="outlined"
        color="secondary"
        class="w3-right w3-large w3-margin-left">
            Trouver un troc
        </Button>

        <span class="w3-xlarge">Proposer</span>

        <div class="w3-row">
            
            <div class="w3-col l6">
                <DrawingSold/>
            </div>

            <div class="w3-col l6 text-content">
                <p>Proposez vos articles avant l'événement et faite gagner du temps à tout le monde.</p>
                <p>Rendez-vous à l'ouverture de l'événement pour fournir vos objets à l'organisateur.</p>
                <p>Suivez en temps réel votre solde et l'état de vos ventes.</p>
                <p>Récupèrez vos gains et vos invendus quand vous le souhaité.</p>
            </div>

        </div>    
        

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

    @media only screen and (min-width: 992px) {
        #is-card {padding: 0px 12px 0px 0px;}
        #isnt-card { padding: 0px 0px 0px 12px;} 
    } 
    @media only screen and (max-width: 992px) {
        #is-card {padding: 0px 0px 12px 0px;}
        #isnt-card {padding: 0px 0px 0px 0px;} 
    }

    @media only screen and (max-width: 500px) {
        #is li , #isnt li {
            margin: 30px 5px 30px 5px;
            padding: 0px;
        }
    }

    li {
        margin: 30px;
    }

    #is, #isnt, #and {
       border-radius: 10px;
    }

    #is li , #isnt li {
        border: none;
    }

    #is li i, #isnt li i {
        transform: translateY(2px);
    }

    #is div, #isnt div, #and div {
        border-radius: 10px 10px 0px 0px;
    }

    #is ul, #isnt ul {
        border-radius: 0px 0px 10px 10px;
    }

    #is li .fa-check {
        color: #4CAF50;
    }

    #isnt li .fa-times {
        color: #F44336;
    }

    .text-content {
        text-align: justify;
        font-size: 1.1em;
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

</style>