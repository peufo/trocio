<script>
	import { user } from 'stores.js'
	import { goto } from '@sveltech/routify'
	import SearchTroc from 'SearchTroc.svelte'
	
</script>

{#if $user == null}
	<div class="w3-margin-top">
		<SearchTroc/>
	</div>
{:else}
	{$goto('/activity/search')}
{/if}

<style>
	div {
		max-width: 850px;
		margin: auto;
		padding: 1em;
	}
</style>