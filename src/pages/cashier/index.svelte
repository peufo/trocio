<!--
<script context="module">
    export async function preload(page, { user }) {
        let { troc , client} = page.query
        if (!troc) return this.error(404, 'troc query is required')
		if (!user) return this.error(401, 'authentication is required')
        return this.redirect(300, `${page.path}/resume?troc=${troc}${client ? `&client=${client}`: ''}`)
    }
</script>
-->