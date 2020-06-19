<script context="module">
    import { getDetail } from './_utils.js'

    export async function preload(page, { user }) {
        let { troc, client } = page.query
        if (!troc) return this.error(400, 'troc query is required')
        if (!user) return this.error(401, 'authentication is required')
        if (client) {
            let details = getDetail.call(this, troc, client)
            client = await this.fetch(`/users/${client}`).then(res => res.json())

        }

        console.log('CASHIER EXECUTED !!!!')

        return { user, client }
    }
</script>

<script>
    import Cashier from '../components/Cashier.svelte'
    export let user = {}
    export let client = {}
    export let troc = ''
    let mobileDisplay = false

    function updateMobileDisplay() {
        mobileDisplay = window.innerWidth < 720;
    }

</script>

<svelte:window on:resize={updateMobileDisplay} />

<Cashier {user} {troc} {client} {mobileDisplay}/>