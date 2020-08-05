<script>
    import { user } from 'stores.js'
    import TrocInfo from 'TrocInfo.svelte'
    import Resume from '../../components/Resume.svelte'
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

    <Resume on:openCreateDialog={articleCreateDialog.open} on:openTarifDialog={tarifInfoDialog.open}/>


    <ArticleCreateDialog bind:dialog={articleCreateDialog}/>

    <TarifInfoDialog bind:dialog={tarifInfoDialog}/>

</div>
