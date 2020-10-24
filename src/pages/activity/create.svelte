<script>
    import { goto } from '@sveltech/routify'
    import { user } from 'stores.js'
    import { onMount } from 'svelte'
    import EditForm from 'EditForm.svelte'
    
    function createTroc(e) {
        let troc = e.detail
        $goto(`/admin?troc=${troc._id}`)
    }

</script>

<h3 class="mdc-typography--headline6" style="margin: 0;">Organiser un troc</h3>

<EditForm mapDelay="250" on:create={createTroc}/>

