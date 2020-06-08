<script>
    import { me, troc } from './stores'
	import Menu from '@smui/menu'
	import List, { Item, Graphic } from '@smui/list'
	import Button from '@smui/button'
	import Dialog, {Content} from '@smui/dialog'
	import TopAppBar, {Row, Section, Title} from '@smui/top-app-bar'

	import Login from './Login.svelte'
	import AppLink from './AppLink.svelte'
	
	export let title = ''
	
	let dialogLogin
	let userMenu


</script>

<TopAppBar variant="static" color="secondary" dense>
	<Row>
		<Section>
			<AppLink href="/">
				<Title>
					<img src="/favicon.ico" alt="logo Trocio" height="35">
					TROCIO
					<i>{title}</i>
				</Title>
			</AppLink>
		</Section>

		<Section align="end" toolbar>
			{#if $me._id}
				<div>
					<Button on:click={() => userMenu.setOpen(true)} color="secondary" class="w3-right w3-padding w3-text-white">
						<i class="fas fa-user w3-large"></i>
						<span class="userName">&nbsp;{$me.name}</span>
					</Button>

					<Menu bind:this={userMenu} style="min-width: 200px;" anchorCorner="BOTTOM_LEFT">
						<List>
							<AppLink href="/activity">
								<Item>
									<Graphic><i class="far fa-star"></i></Graphic>
									Vos activités
								</Item>
							</AppLink>
							<AppLink href="/profile">
								<Item>
									<Graphic><i class="fas fa-info-circle"></i></Graphic>
									Votre profil
								</Item>
							</AppLink>
						</List>
					</Menu>					
				</div>
				
			{:else}
				<Button color="secondary" class="w3-right w3-padding w3-text-white" on:click="{() => dialogLogin.open()}">
					<i class="far fa-user w3-large"></i>
					<span class="userName">&nbsp;Connexion</span>
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
		.userName{display: none;}
	}

</style>
