<script>
    import { user } from 'stores.js'
    import TrocInfo from 'TrocInfo.svelte'
    import Resume from '../../components/Resume.svelte'

    export let scoped

</script>

<TrocInfo troc={scoped.trocSelected} />
<hr>
<Resume trocId={scoped.trocSelected} userId={$user._id}/>
