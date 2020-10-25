<script>
	import Menu from '@smui/menu'
	import List, { Item, Graphic } from '@smui/list'
	import Button from '@smui/button'
	import Dialog, { Content, Title as TitleDialog, Actions } from '@smui/dialog'
	import TopAppBar, {Row, Section, Title} from '@smui/top-app-bar'

	import { user, userPromise, troc } from './stores'
	import Login from './Login.svelte'
	import TermsOfUse from 'Terms-of-use.svelte'
	import notify from 'notify.js'
	import { getHeader } from 'utils.js'
	
	export let offsetHeight
	let dialogLogin
	let dialogAcceptTerms
	//let userMenu

	$: if (!!$user && !$user.acceptTerms && !!dialogAcceptTerms.open) dialogAcceptTerms.open()

	async function acceptTerms() {
		try {
			let res = await fetch('__API__/users/me', getHeader({acceptTerms: true}, 'PATCH'))
			let json = await res.json()
			if (json.error) return notify.error(json.message)
			$user.acceptTerms = true
			notify.success({title: 'Merci et bienvenue !', text: `Vous avez accepté nos conditions d'utilisations`})
		} catch (error) {
			notify.error(error)
		}
	}

</script>

<svelte:head>
	<title>
		Trocio {$troc ? ` - ${$troc.name}` : ''}
	</title>
</svelte:head>

<div bind:offsetHeight>
	<TopAppBar variant="static" color="secondary" dense>
		<Row>
			<Section>
				<a href="/">
					<Title>
						<img src="/favicon.ico" alt="logo Trocio" height="35">
						TROCIO {$troc ? ` - ${$troc.name}` : ''}
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
							<i class="fas fa-bars w3-large"></i>
							<span class="button-label">&nbsp;Mes trocs</span>
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
</div>

<Dialog bind:this={dialogLogin}>
	<Content>
		<Login on:close={dialogLogin.close}/>
	</Content>
</Dialog>

<Dialog bind:this={dialogAcceptTerms} escapeKeyAction='' scrimClickAction=''>
	<TitleDialog>Conditions d'utilisation</TitleDialog>
	<Content>
		<TermsOfUse/>
	</Content>
	<Actions>
		<Button on:click={user.logout} color="secondary">
			Refuser
		</Button>
		<Button on:click={acceptTerms}>
			Accepter
		</Button>
	</Actions>
</Dialog>

<style>

	@media screen and (max-width: 500px) {
		.button-label{display: none;}
	}

</style>
