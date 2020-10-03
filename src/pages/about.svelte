<script>
    import Footer from 'Footer.svelte'
</script>

<main>
    <br>
    <br>
    <h1 class="w3-center">À propos</h1>
    <br>
    <br>
    <div class="w3-row">
        <div class="w3-col m6 w3-padding">
            <p>
                Trocio est la première application public proposée par Jonas Voisard.
                Le projet démarre initialement pour tenter d'améliorer la gestion d'une bourse aux skis
                qui utilisait une interface maison fonctionnant sur Access.
                La réalité du défi technique et la soif d'apprendre ont été une
                source inépuisable de motivation.
            </p>
            <p>
                En 2018, une première version est développée avec JQuery, NodeJS et MySQL.
                Elle est alors testée sur un réseau local lors de l'évènement 
                durant lequel de nombreux problèmes sont identifés. 
                Les avantages d'une application web ne sont pas non plus resentis pour l'instant.
                Une refonte complète est donc nécessaire pour rendre l'application
                plus robuste, plus flexible, et surtout, plus accueillante.
            </p>
        </div>

        <div class="w3-col m6 w3-padding">
            <p>
                MongoDB prend alors la place de MySQL pour la gestion de la base de donnés et,
                côté interface, JQuery est remplacé par un framework moderne et plus complet (Svelte 3).
            </p>
            <p>
                C'est en 2019 que cette nouvelle version est mise en ligne et testée sur la bourse aux skis.
                Hormis un ou deux problèmes techniques, l'interface satisfait grandement les organisateurs.
                Les clients, gérant ou particulier, accueillent volontiers cette nouvelle manière de faire.
            </p>
            <p>
                L'application est donc corrigée, completée, et améliorée pendant encore une année avant
                d'être enfin ouverte au public.
            </p>
        </div>
    </div>
    
    <br><br><br>
</main>

<Footer/>

<style>
    main {
        min-height: 620px;
        max-width: 800px;
        margin: auto;
        text-align: justify;
    }
</style>
