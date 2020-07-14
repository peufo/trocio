<script>
	import { troc, user } from './stores'

	import Menu from '@smui/menu'
	import List, { Item, Graphic } from '@smui/list'
	import Button from '@smui/button'
	import Dialog, {Content} from '@smui/dialog'
	import TopAppBar, {Row, Section, Title} from '@smui/top-app-bar'

	import Login from './Login.svelte'

	export let title = ''
	
	let dialogLogin
	//let userMenu


</script>

<TopAppBar variant="static" color="secondary" dense>
	<Row>
		<Section>
			<a href="/">
				<Title>
					<img src="/favicon.ico" alt="logo Trocio" height="35">
					TROCIO
					<i>{title}</i>
				</Title>
			</a>
		</Section>

		<Section align="end" toolbar>
			{#if $user}
				<div>

					<Button href='/profile' color="secondary" class="w3-right w3-padding w3-text-white">
						<i class="fas fa-user w3-large"></i>
						<span class="button-label">&nbsp;{$user.name}</span>
					</Button>

					<Button href='/activity' color="secondary" class="w3-right w3-padding w3-text-white">
						<i class="fas fa-star w3-large"></i>
						<span class="button-label">&nbsp;Actualités</span>
					</Button>

					<!--
					<Menu bind:this={userMenu} style="min-width: 200px;" anchorCorner="BOTTOM_LEFT">
						<List>
							<a href="/activity">
								<Item>
									<Graphic><i class="far fa-star"></i></Graphic>
									Vos activités
								</Item>
							</a>
							<a href="/profile">
								<Item>
									<Graphic><i class="fas fa-info-circle"></i></Graphic>
									Votre profil
								</Item>
							</a>
						</List>
					</Menu>
					-->

				</div>
				
			{:else}
				<Button color="secondary" class="w3-right w3-padding w3-text-white" on:click="{() => dialogLogin.open()}">
					<i class="far fa-user w3-large"></i>
					<span class="button-label">&nbsp;Connexion</span>
				</Button>
			{/if}
		</Section>

	</Row>
</TopAppBar>

<Dialog bind:this={dialogLogin}>
	<Content>
		<Login on:close="{() => dialogLogin.close()}"/>
	</Content>
</Dialog>

<style>

	@media screen and (max-width: 500px) {
		.button-label{display: none;}
	}

</style>
