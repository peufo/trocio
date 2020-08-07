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

    <h3 class="mdc-typography--headline6" style="margin: 0;">{scoped.trocSelected.name}</h3>

    <TrocInfo troc={scoped.trocSelected} />

    <hr>
    {#await $trocDetailsPromise}
        <div style="position: relative; height: 383px;">
            <Logo/>
        </div>
    {:then}
        <Resume on:openCreateDialog={articleCreateDialog.open} on:openTarifDialog={tarifInfoDialog.open}/>
    {/await}
    <ArticleCreateDialog bind:dialog={articleCreateDialog}/>

    <TarifInfoDialog bind:dialog={tarifInfoDialog}/>

</div>
