<script>
	import { redirect } from '@roxi/routify'
	
	import { user } from '$/stores.js'
	import SearchTroc from '$/SearchTroc.svelte'
	
</script>

{#if $user == null}
	<div>
		<SearchTroc/>
	</div>
{:else}
	{$redirect('/activity/search')}
{/if}

<style>
	div {
		max-width: 850px;
		margin: auto;
		padding: 1em;
	}
</style>
