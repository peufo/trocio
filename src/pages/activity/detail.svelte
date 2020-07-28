<script>
    import { user } from 'stores.js'
    import TrocInfo from 'TrocInfo.svelte'
    import Resume from '../../components/Resume.svelte'

    export let scoped

    $: console.log({$user})
    $: console.log({scoped})

</script>

<TrocInfo troc={scoped.trocSelected} />
<hr>
<Resume troc={scoped.trocSelected} userId={$user._id}/>
