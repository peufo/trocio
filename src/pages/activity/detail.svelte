<script>
    import { user } from 'stores.js'
    import TrocInfo from 'TrocInfo.svelte'
    import Resume from '../../components/Resume.svelte'

    export let scoped

</script>

<div style="max-width: 800px; margin: auto;">

    <h3 class="mdc-typography--headline6" style="margin: 0;">{scoped.trocSelected.name}</h3>

    <TrocInfo troc={scoped.trocSelected} />

    <hr>

    <Resume/>

</div>
