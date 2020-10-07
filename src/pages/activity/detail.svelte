<script>
    import { user, trocDetailsPromise } from 'stores.js'
    import TrocInfo from 'TrocInfo.svelte'
    import Logo from 'Logo.svelte'
    import Resume from 'Resume.svelte'
    import ArticleCreateDialog from 'ArticleCreateDialog.svelte'
    import TarifInfoDialog from 'TarifInfoDialog.svelte'

    export let scoped

    let articleCreateDialog
    let tarifInfoDialog

</script>

<div style="max-width: 800px; margin: auto;">

    <TrocInfo troc={scoped.trocSelected} />

    <hr>
    <div style="position: relative; min-height: 250px;">
        {#await $trocDetailsPromise}
            <Logo/>
        {:then}
            <Resume on:openCreateDialog={articleCreateDialog.open} on:openTarifDialog={tarifInfoDialog.open}/>
        {/await}
    </div>
    <ArticleCreateDialog bind:dialog={articleCreateDialog}/>

    <TarifInfoDialog bind:dialog={tarifInfoDialog}/>

</div>
