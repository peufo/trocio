<script context="module">
    import { getDetail } from '../_utils.js'

    export async function preload(page, { user }) {
        let { troc } = page.query
        if (!troc) return this.error(400, 'troc query is required')
        if (!user) return this.error(401, 'authentication is required')

        return getDetail.call(this, troc, user._id)
    }
</script>

<script>
    import Resume from '../../components/Resume.svelte'

    export let trocId
    export let userId
    export let provided = []
    export let purchases = []
    export let payments = []
    export let tarif = undefined
    export let traderPrefix = ''

</script>

<Resume {trocId} {userId} {provided} {purchases} {payments} {tarif} {traderPrefix}/>
