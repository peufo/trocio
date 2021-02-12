<script>
    import Footer from '$/Footer.svelte'
</script>

<main>
    <br>
    <br>
    <h4 class="w3-center">Mentions légales</h4>
    <br>
    <br>

    <div class="w3-row">
        <div class="w3-col s6">
            <b class="w3-right">Exploitation</b>
        </div>
        <div class="w3-col s6">
            <span>Jonas Voisard</span><br>
            <span>Rue pierre péquignat 15</span><br>
            <span>2900 Porrentruy</span><br>
            <span>Suisse</span><br>
        </div>
    </div>

    <div class="w3-row">
        <div class="w3-col s6">
            <b class="w3-right">Domaines</b>
        </div>
        <div class="w3-col s6">
            <span>troc.io</span><br>
            <span>trocio.ch</span><br>
            <span class="w3-opacity">trocio.fr</span><br>
            <span class="w3-opacity">trocio.org</span>
        </div>
    </div>

    <div class="w3-row">
        <div class="w3-col s6">
            <b class="w3-right">Hébergement</b>
        </div>
        <div class="w3-col s6">
            <span>Infomaniak</span><br>
        </div>
    </div>

    <div class="w3-row">
        <div class="w3-col s6">
            <b class="w3-right">Licence</b>
        </div>
        <div class="w3-col s6">
            <span>GPL-3.0</span><br>
        </div>
    </div>
    
    <br><br><br>
</main>

<Footer/>

<style>
    .w3-col {
        padding: 1em;
    }
    main {
        min-height: 620px;
        max-width: 800px;
        margin: auto;
        text-align: justify;
    }
</style>
