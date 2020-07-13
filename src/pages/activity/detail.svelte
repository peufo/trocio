<!--
<script context="module">
    import { getDetail } from '../_utils.js'

    export async function preload(page, { user }) {
        let { troc } = page.query
        if (!troc) return this.error(400, 'troc query is required')
        if (!user) return this.error(401, 'authentication is required')

        return getDetail.call(this, troc, user._id)
    }
</script>
-->

<script>
    import qs from 'qs'
    import { onMount } from 'svelte'
    import { user, userPromise, troc } from 'stores.js'
    import TrocInfo from 'TrocInfo.svelte'
    import Resume from '../../components/Resume.svelte'

    export let scoped
    export let trocId
    export let userId
    export let provided = []
    export let purchases = []
    export let payments = []
    export let tarif = undefined
    export let traderPrefix = ''

</script>

<TrocInfo troc={scoped.trocSelected} />
<hr>
<Resume {trocId} {userId} {provided} {purchases} {payments} {tarif} {traderPrefix}/>
