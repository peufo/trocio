<script>
    export let offsetHeight
</script>

<footer class="w3-center" bind:offsetHeight>
   
    <div>
        <div class="underline-div">
            <a class="underline-span" href="/about">À propos</a>
        </div>
        <div class="underline-div">
            <a class="underline-span" href="/contact">Contact</a>
        </div>
        <div class="underline-div">
            <a class="underline-span" href="/terms-of-use">Conditions d'utilisation</a>
        </div>
        <div class="underline-div">
            <a class="underline-span" href="/legal-notice">Mentions légales</a>
        </div>
    </div>

    <span>
        <i class="far fa-copyright"></i>
        2020 - Jonas Voisard
    </span>

</footer>

<style>
    footer {
        background: #efefef;
        height: 150px;
    }

    footer>div {
        height: 100px;
        padding-top: 40px;
    }

    footer>div>div {
        display: inline-block;
        padding: 5px 10px;
    }

    footer>div>div:not(:first-child){
        border-left: solid 1px rgba(0, 0, 0, 0.1);
    }

</style>
