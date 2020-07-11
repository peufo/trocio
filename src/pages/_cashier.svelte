<!--
<script context="module">
    import { getDetail } from './_utils.js'

    export async function preload(page, { user }) {
        let { troc, client } = page.query
        let detail = {}
        if (!troc) return this.error(400, 'troc query is required')
        if (!user) return this.error(401, 'authentication is required')
        if (client) {
            console.log('New client !!! == new Detail')
            detail = await getDetail.call(this, troc, client)
            client = await this.fetch(`/users/${client}`).then(res => res.json())
        }

        console.log('CASHIER EXECUTED !!!!')

        return { user, client, detail}
    }
</script>
-->

<script>
    import Cashier from '../components/Cashier.svelte'
    import { onMount } from 'svelte'
    export let user = {}
    export let client = {}
    export let troc = ''

    export let detail = {}

    $: console.log('client', client)
    
    let mobileDisplay = false

    function updateMobileDisplay() {
        mobileDisplay = window.innerWidth < 720
    }

    onMount(updateMobileDisplay)

</script>

<svelte:window on:resize={updateMobileDisplay} />

<Cashier {user} {troc} {client} {...detail} {mobileDisplay}/>