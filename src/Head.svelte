<script>
    import { me, troc } from './stores'
    import Login from './Login.svelte'
	import Button from '@smui/button'
	import Dialog from '@smui/dialog'
	import TopAppBar, {Row, Section, Title} from '@smui/top-app-bar'

	let dialogLogin

</script>

<TopAppBar variant="static" color="secondary" dense>
	<Row>

		<Section>
			<a href="/"><img src="/favicon.ico" alt="logo Trocio" height="35"></a>
			<a href="/">
				<Title>
					TROCIO
					{#if document.location.pathname == '/me'}
						<i>- Mon compte</i>
					{:else if $troc._id}
						<i>- {$troc.name}</i>
					{/if}
				</Title>
			</a>
		</Section>

		<Section align="end" toolbar>
			{#if $me._id}
				<Button color="secondary" class="w3-right w3-padding" href="/me">
					<i class="fas fa-user w3-large"></i>
					<span class="userName">&nbsp;{$me.name}</span>
				</Button>
			{:else}
				<Button color="secondary" class="w3-right w3-padding" on:click="{() => dialogLogin.open()}">
					<i class="far fa-user w3-large"></i>
					<span class="userName">&nbsp;Connexion</span>
				</Button>
			{/if}
		</Section>

	</Row>
</TopAppBar>

<Dialog bind:this={dialogLogin}>
	<Login on:close="{() => dialogLogin.close()}"/>
</Dialog>

<style>

	@media screen and (max-width: 500px) {
		.userName{display: none;}
	}

</style>
