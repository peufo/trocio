<script>
    import { goto } from '@sveltech/routify'
    import { user } from 'stores.js'
    import EditForm from 'EditForm.svelte'

    function createTroc(e) {
        let troc = e.detail
        $goto(`/admin?troc=${troc._id}`)
    }

</script>

<svelte:head>
    <title>Organiser - Trocio</title>
</svelte:head>

<h3 class="mdc-typography--headline6" style="margin: 0;">Organiser un troc</h3>

<EditForm createMode mapDelay="250" on:create={createTroc}/>
