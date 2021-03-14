<!-- routify:options isFooterDisplay=true -->

<script>
    import Login from '$/Login.svelte'
    import Profile from '$/Profile.svelte'
    import { user } from '$/stores.js'
    import { Button, Icon, Card } from 'svelte-materialify'

    export let scoped

</script>

{#if $user === null}
    <div class="container" style="height: {scoped.mainHeight}px;">
        <div class="half w3-center">
            <a href="/">
                <Button>
                    <Icon class="fas fa-home"></Icon>&nbsp;
                    Retour à l'acceuil
                </Button>
            </a>
            <br><br><br>
            <a href="/search">
                <Button>
                    <Icon class="fas fa-search"></Icon>&nbsp;
                    Chercher des Trocs
                </Button>
            </a>
        </div>
        <div class="half">
            <Card class="pa-4">
                <Login />
            </Card>
        </div>
    </div>
{:else if $user !== undefined}
    <Profile/>
{/if}

<style>

    .container {
        max-width: 1200px;
        margin: auto;
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-wrap: wrap-reverse;
    }
    
</style>