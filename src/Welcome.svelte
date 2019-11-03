<script>
    import { me } from './stores'
    import Button from '@smui/button'


</script>

<img class="participeImg" class:w3-hide={!!$me._id} src="/images/participe.png" alt="Incitation à participer" style="float: right; margin-right: 60px;">

<div class="content">
    
    <span class="w3-jumbo">TROCIO</span>

    <p class="w3-xxlarge" style="margin-top: 6px; margin-bottom: 66px;">

        Pour troquer organisé

        <Button
        href="/search"
        variant="outlined"
        color="secondary"
        class="w3-right w3-large w3-margin-left">
            Trouver un troc
        </Button>
        
        <Button
        variant="outlined"
        color="secondary"
        disabled
        class="w3-right w3-large">
            Organiser un troc
        </Button>          
    </p>

    <div class="w3-row">
        <div class="w3-col l6">
            <div id="is" class="w3-card-4">
                <div class="w3-xlarge w3-green w3-padding w3-center">
                    <span>C'est ...</span>
                </div>
                <ul class="w3-padding w3-large w3-ul">
                    <li>
                        <i class="fas fa-check w3-xlarge"></i>&nbsp;
                        <b>Des points de rendez-vous pour faire de bonnes affaires</b>
                    </li>
                    <li>
                        <i class="fas fa-check w3-xlarge"></i>&nbsp;
                        <b>Un moyen d'offrir une nouvelle vie à vos objets</b>
                    </li>
                    <li>
                        <i class="fas fa-check w3-xlarge"></i>&nbsp;
                        <b>Un outil efficace pour organiser des magasins éphémères</b>
                    </li>
                </ul>
            </div>
        </div>

        <div class="w3-col l6">
            <div id="is" class="w3-card-4">
                <div class="w3-xlarge w3-red w3-padding w3-center">
                    Ce n'est pas ...
                </div>
                <ul class="w3-padding w3-large w3-ul">
                    <li>
                        <i class="fas fa-times w3-xlarge"></i>&nbsp;
                        <b>Un site de vente en ligne</b>
                    </li>
                    <li>
                        <i class="fas fa-times w3-xlarge"></i>&nbsp;
                        <b>Un intermédiaire à but lucratif</b>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <br><br><br>

    <div class="w3-center w3-xlarge">
        
        <Button href="#buy" color="secondary" class="w3-large" style="width: 130px;">
            Acheter
        </Button>

        <Button href="#sale" color="secondary" class="w3-large" style="width: 130px;">
            Vendre
        </Button>

        <Button href="#organize" color="secondary" class="w3-large" style="width: 130px;">
            Organiser
        </Button>
        
        <br><br>

        <i class="fas fa-arrow-down"></i>

    </div>

    <br><br>

    <hr>
    <div id="buy">

        <Button
        href="/search"
        variant="outlined"
        color="secondary"
        class="w3-right w3-large w3-margin-left">
            Trouver un troc
        </Button>
        <span class="w3-xlarge">Acheter</span>
        <p>Trouve un troc qui correspond à tes attentes près de chez toi et regarde les articles qui y sont proposés.</p>
        <p>Rends-toi à l'événement pour effectuer tes achats.</p>
        
    </div>


    <br><hr>
    <div id="sale">

        <Button
        href="/search"
        variant="outlined"
        color="secondary"
        class="w3-right w3-large w3-margin-left">
            Trouver un troc
        </Button>

        <span class="w3-xlarge">Vendre</span>
        <p>Trouve un troc dans ta région qui correspond aux objets dont tu souhaites te débarrasser.</p>
        <p>Propose tes articles avant l'événement en leur donnant une désignation et un prix.</p>
        <p>Rends-toi à l'ouverture de l'événement pour les fournir à un bénévole.</p>
        <p>Suis en temps réel l'état de tes ventes.</p>
        <p>Récupère tes gains ou tes invendus quand tu le souhaites.</p>

    </div>


    <br><hr>
    <div id="organize">

        <Button
        variant="outlined"
        color="secondary"
        disabled
        class="w3-right w3-large">
            Organiser un troc
        </Button>

        <span id="organize" class="w3-xlarge">Organiser</span>
        <p>Définis le lieu et la date de ton événement.</p>
        <p>Monte ton équipe et définis tes tarifs.</p>
        <p>Gère les dépôts, les récupérations, les achats, les retours et les paiements sur une interface simple et accessible.</p>
        <p>Accède à une vue d'ensemble du trafic de ton événement.</p>
    </div>

</div>

<svelt:head>
	<style>#waitLoaded { display: none; }</style>
</svelt:head>

<style>

    @media only screen and (min-width: 850px) {
        .content {
            padding: 50px 100px 100px 50px;
        }
    }

    @media only screen and (max-width: 850px) {
        .content {
            padding: 10px;
        }
    }

    @media only screen and (min-width: 992px) {
        .w3-col:first-child {
            padding: 0px 12px 0px 0px;
        }
        .w3-col:last-child {
            padding: 0px 0px 0px 12px;
        } 
    } 
    @media only screen and (max-width: 992px) {
        .w3-col:first-child {
            padding: 0px 0px 12px 0px;
        }

        .w3-col:last-child {
            padding: 0px 0px 0px 0px;
        } 
    }

    .content {
        max-width: 1200px;
        margin: auto;
    }

    li {
        margin: 30px;
    }

    #is {
       border-radius: 10px;
    }

    #is li {
        border: none;
    }

    #is li .fa-check {
        color: #4CAF50;
    }

    #is li .fa-times {
        color: #F44336;
    }

    #is div {
        border-radius: 10px 10px 0px 0px;
    }

    #is ul {
        border-radius: 0px 0px 10px 10px;
    }

</style>