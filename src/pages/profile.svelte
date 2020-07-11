<!--
<script context="module">
    export async function preload(page, { user }) {
        return { user }
    }
</script>
-->
<script>
    import Profile from '../components/Profile.svelte'
    export let user = {}
</script>

<Profile {user} />