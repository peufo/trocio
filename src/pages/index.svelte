<!-- routify:options isFooterDisplay=true -->
<script lang="ts">
  import { Button, Card, CardText } from '$material'
  import DrawingSearch from '$lib/draw/Search.svelte'
  import DrawingSold from '$lib/draw/Sold.svelte'
  import Logo from '$lib/draw/LogoV2.svelte'

  // Ralentie considerablement l'animation de départ
  // import { prefetch } from '@roxi/routify'
  // prefetch('/search', { validFor: 60 * 1 })
</script>

<main>
  <div
    class="d-flex flex-wrap justify-space-between align-center pb-16 pt-10"
    style="gap: 2em;"
  >
    <div class="d-flex flex-column flex-grow-1">
      <div class="title">Troc.io</div>

      <div
        class="logo"
        style="width: 260px; height: 230px; z-index: 2; margin: auto;"
      >
        <Logo duration={40} cubeSize={100} />
      </div>
    </div>

    <div class="flex-grow-1">
      <div style="max-width: 630px; margin: auto;">
        <Card class="pa-4" style="z-index: 2;">
          <CardText>
            <p>Trocio facilite l'organisation de commerces éphémère.</p>
            <p>
              <b>Pour les organisateurs,</b><br /> c'est une gestion complette des
              flux d'articles, des utilisateurs et des paiements.
            </p>
            <p>
              <b>Pour les participants,</b><br /> c'est des passages en caisse fluidifier
              et un retour sur ses ventes en temps réel.
            </p>
          </CardText>
        </Card>
        <div class="d-flex">
          <div class="flex-grow-1" />
          <a href="/trocs" style="z-index: 2; translate: -10px -50%;">
            <Button class="secondary-color text-white">Trouver un troc</Button>
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="mt-16 mb-16 pt-16 text-center hideIfVerySmall">
    <i class="fas fa-arrow-down" style="margin-right: 40px;" />
    <a href="#discover">
      <Button text size="large" style="width: 130px;">Découvrir</Button>
    </a>
    <a href="#propose">
      <Button text size="large" style="width: 130px;">Proposer</Button>
    </a>
    <a href="#organize">
      <Button text size="large" style="width: 130px;">Organiser</Button>
    </a>

    <i class="fas fa-arrow-down" style="margin-left: 40px;" />
  </div>

  <section id="discover">
    <div
      class="d-flex justify-space-between align-center wrap-660"
      style="gap: 36px;"
    >
      <div>
        <h3>Découvrir</h3>
        <br />
        <p>
          Trouvez un troc qui correspond à vos attentes près de chez vous et
          fouillez dans les articles qui y sont proposés.
        </p>
        <br />
        <p>
          Il ne vous reste plus qu'à vous rendre sur place pour profiter de
          l'évènement.
        </p>
      </div>

      <div class="centered flex-grow-1">
        <DrawingSearch />
      </div>
    </div>
  </section>

  <section id="propose">
    <div
      class="d-flex justify-space-between align-center wrap-1000"
      style="gap: 36px;"
    >
      <div class="flex-grow-1 centered" style="min-width: 350px;">
        <DrawingSold />
      </div>
      <div class="pb-16">
        <h3>Proposer</h3>
        <br />
        <p>
          Proposez vos articles avant l'évènement pour gagner du temps lors de
          votre dépôt.
        </p>
        <p>
          Rendez-vous à l'ouverture de l'évènement pour fournir vos objets à
          l'organisateur.
        </p>
        <p>Suivez en temps réel votre solde et l'état de vos ventes.</p>
        <p>Récupérez vos gains et vos invendus quand vous le souhaitez.</p>
      </div>
    </div>
  </section>

  <section id="organize">
    <h3 class="pb-16 text-center">Organiser</h3>

    <div class="pt-16 d-flex flex-wrap justify-space-around">
      <div class="feature">
        <div class="feature-title">
          <i class="far fa-calendar-alt" />
          <span>Planification</span>
        </div>
        <div class="feature-content">
          <p>Définisez un nom, un lieu et un horaire.</p>
          <p>Deux minutes suffisent pour créer votre troc.</p>
        </div>
      </div>
      <div class="feature">
        <div class="feature-title">
          <i class="fas fa-coins" />
          <span>Tarifications</span>
        </div>
        <div class="feature-content">
          <p>
            Définisez votre part sur les articles vendus ainsi que les frais de
            traitement.
          </p>
          <p>Établissez la liste des utilisateurs soumis à un tarif.</p>
        </div>
      </div>
      <div class="feature">
        <div class="feature-title">
          <i class="fas fa-eraser" />
          <span>Gestion</span>
        </div>
        <div class="feature-content">
          <p>
            Identifiez et gerer facilement de nombreux cas comme les changements
            de prix, les erreurs d'étiquetages et les soldes impayés.
          </p>
        </div>
      </div>
      <div class="feature">
        <div class="feature-title">
          <i class="fas fa-chart-pie" />
          <span>Statistique</span>
        </div>
        <div class="feature-content">
          <p>Ayez une vue d'ensemble sur l'activité de votre troc.</p>
          <p>
            Fournissez de précieux rapport à votre équipe pour vous améliorer.
          </p>
        </div>
      </div>

      <div class="feature">
        <div class="feature-title">
          <i class="fas fa-users" />
          <span>Collaborateurs</span>
        </div>
        <div class="feature-content">
          <p>
            Attribuez des droits d'accès à la page d'administration aux
            responsables.
          </p>
          <p>Désignez des caissiers.</p>
          <p>
            Listez vos plus gros commerçants et permettez-leur d'utiliser un
            préfixe dans la réference de leurs articles.
          </p>
        </div>
      </div>

      <div class="feature">
        <div class="feature-title">
          <i class="fas fa-tags" />
          <span>Étiquetage</span>
        </div>
        <div class="feature-content">
          <p>
            Paramétrez le format de vos étiquettes pour qu'elles correspondent à
            vos imprimantes.
          </p>
          <p>
            Utilisez votre téléphone comme scanner pour réduire les temps de
            passage en caisse.
          </p>
        </div>
      </div>
      <div class="feature">
        <div class="feature-title">
          <i class="fas fa-cash-register" />
          <span>Caisse</span>
        </div>
        <div class="feature-content">
          <p>Validez les articles proposés par vos fournisseurs.</p>
          <p>Vendez ou rendez votre stock.</p>
          <p>Visualisez le compte de vos clients et effectuez des paiements</p>
        </div>
      </div>

      <div class="feature">
        <div class="feature-title">
          <i class="fas fa-dumbbell" />
          <span>Zone d'entrainement</span>
        </div>
        <div class="feature-content">
          <p>Testez l'application de manière libre et privée.</p>
          <p>Formez vos caissiers afin qu'ils soient parés le jour J.</p>
        </div>
      </div>
    </div>

    <div class="text-center mt-16">
      <Card class="pa-4" style="max-width: 500px; margin: auto;">
        L'organisation d'un troc est <b class="green-text">gratuit</b>
      </Card>

      <br /><br />
      <a href="/trocs/create">
        <Button class="secondary-color white-text">Organiser un troc</Button>
      </a>
    </div>
  </section>
</main>

<div class="background-grey" />

<style>
  :global #app {
    overflow-x: hidden;
  }

  .title {
    font-family: Dongle;
    font-size: 8em;
    text-align: center;
    width: 100%;
  }

  section {
    margin-top: 200px;
    padding: 40px 0px;
  }

  main {
    max-width: 1260px;
    margin: auto;
    font-size: 1.1em;
  }

  .background-grey {
    position: absolute;
    top: 0;
    left: 0;
    width: 150%;
    height: 580px;
    background: rgba(204, 204, 204, 0.404);
    transform-origin: bottom left;
    transform: rotate(-10deg);
  }

  @media only screen and (max-width: 660px) {
    .wrap-660 {
      flex-wrap: wrap;
    }
    section {
      margin-top: 100px;
    }
  }
  @media only screen and (max-width: 1000px) {
    .wrap-1000 {
      flex-wrap: wrap-reverse;
    }
  }

  @media only screen and (min-width: 850px) {
    main {
      padding: 50px 50px;
    }
  }
  @media only screen and (max-width: 850px) {
    main {
      padding: 10px;
    }
  }

  @media only screen and (max-width: 1045px) {
    .logo {
      display: none;
    }
  }

  .fa-arrow-down {
    animation-name: scrollPlease;
    animation-duration: 5s;
    animation-iteration-count: infinite;
    opacity: 0.5;
  }

  @keyframes scrollPlease {
    0% {
      transform: translateY(0px);
    }
    80% {
      transform: translateY(0px);
    }
    85% {
      transform: translateY(5px);
    }
    90% {
      transform: translateY(0px);
    }
    95% {
      transform: translateY(5px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  .feature-title {
    text-transform: uppercase;
    font-size: 1.1em;
  }
  .feature-title i {
    opacity: 0.6;
    font-size: 1.2em;
  }
  .feature-title span {
    margin-left: 10px;
  }

  .feature-content {
    margin-left: 0.6em;
    padding-left: 1em;
    border-left: 2px solid #ddd;
  }

  .feature-content p {
    margin-top: 0.6em;
    margin-bottom: 0.6em;
  }

  .feature {
    margin: 0 3em 4em 2em;
    max-width: 360px;
  }

  @media only screen and (max-width: 600px) {
    .hideIfVerySmall {
      display: none;
    }
  }
</style>
