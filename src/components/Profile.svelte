<script>
    import { slide, fade } from 'svelte/transition'
    import { Button, TextField, Icon, Card } from 'svelte-materialify'
    import notify from './notify.js'
    import { user } from './stores'
    import { getHeader } from './utils'
    import RULES from './rules'
    
    let userName = $user?.name
    let userNameError = false
    
    let patchNamePromise
    
    let userMail = $user?.mail
    let patchMailPromise
    let sendMailValidatorPromise
    let mailValidatorSent = false
    let userMailError = false

    let changePassword = false
    let oldPassword = ''
    let newPassword = ''
    let newPasswordError = false
    let newPassword2 = ''
    let newPassword2Error = false
    const RULE_NEW_PASSWORD = [() => newPassword !== newPassword2 && 'Pas identique']

    // FETCH FUNCTIONS

    async function patchName() {
        try {
            let res = await fetch('/__API__/users/me', getHeader({name: userName}, 'PATCH'))
            let json = await res.json()
            if (!json.success) throw json.message
            $user.name = userName
            notify.success('Votre nom à bien été modifié')
        } catch(error) {
			notify.error(error)
		}
    }
    
    async function patchMail() {
        try {
            let res = await fetch('/__API__/users/me', getHeader({mail: userMail}, 'PATCH'))
            let json = await res.json()
            if (!json.success) throw json.message
            $user.mailvalided = false
            $user.mail = userMail
            console.log(json)
            notify.success('Votre mail à bien été modifié') 
        } catch(error) {
            notify.error(error)
		}
    }

    async function sendMailValidator() {
        try {
            let res = await fetch('/__API__/users/sendvalidmail', getHeader({}))
            let json = await res.json()
            if (!json.success) throw json.message
            mailValidatorSent = true
            notify.success('Un mail de validation vuos à été envoyé')
        } catch(error) {
			notify.error(error)
		}
    }

    async function validChangePassword() {
        try {
            let res = await fetch('/__API__/users/changepwd', getHeader({oldPassword, newPassword}))
            let json = await res.json()
            if (!json.success) throw json.message
            changePassword = false
            oldPassword = ''
            newPassword = ''
            newPassword2 = ''
            notify.success('Changement du mot de passe accepté')
        } catch(error) {
			notify.error(error)
		}
    }

    $: patchNamePromise?.then(() => patchNamePromise = null)
    $: patchMailPromise?.then(() => patchMailPromise = null)

</script>

{#if $user}
    <br>
    <Card class="pa-8" style="max-width: 850px; margin: auto;">
        <div style="max-width: 500px; margin: auto;">
            <br><br>
    
            <TextField
                bind:value={userName}
                rules={RULES.NAME}
                bind:error={userNameError}>
                <div slot="prepend">
                    <Icon class="far fa-user"/>
                </div>
                Nom & Prénom
            </TextField>
    
            {#if userName !== $user.name}
                <div transition:slide|local>
                    <Button
                    on:click={() => patchNamePromise = patchName()}
                    disabled={userNameError || !!patchNamePromise}
                    class="w3-right">
                        {#if !!patchNamePromise}
                            <i class="fas fa-circle-notch w3-spin"></i>
                            &nbsp;Validation ...
                        {:else}
                            Valider la modification
                        {/if}
                    </Button>
                    <br><br>
                </div>
            {/if}
    
            <br><br><br>
    
            <TextField
            bind:value={userMail}
            rules={RULES.MAIL}
            bind:error={userMailError}>
                <div slot="prepend">
                    <Icon class="far fa-envelope"/>
                </div>
                Mail
            </TextField>
    
            {#if userMail !== $user.mail}
                <div transition:slide|local>
                    <Button
                    on:click="{() => patchMailPromise = patchMail()}"
                    disabled={userMailError || !!patchMailPromise}
                    class="w3-right">
                        {#if !!patchMailPromise}
                            <i class="fas fa-circle-notch w3-spin"></i>
                            &nbsp;Validation ...
                        {:else}
                            Valider la modification
                        {/if}
                    </Button>
                    <br><br>
                </div>
            {/if}
            <br>
    
            {#if !$user.mailvalided}
    
                {#if mailValidatorSent}
                    <span>
                        Un mail de validation vous à été envoyé.
                    </span>
                {:else}
    
                    {#await sendMailValidatorPromise}
                        <Button text disabled class="w3-right">
                            <i class="fas fa-circle-notch w3-spin"></i>&nbsp;Envoie du mail ...
                        </Button>
                    {:then}
                    
                        <div class="w3-text-red w3-left" style="transform: translateY(6px);">
                            <i class="fas fa-exclamation-triangle"></i>
                            mail non validé
                        </div>
    
                        <Button text
                        on:click="{() => sendMailValidatorPromise = sendMailValidator()}"
                        class="w3-right">
                            Envoyer un mail de validation ?
                        </Button>   
                    {/await}
    
                {/if}
                
            {/if}
    
            <br><br><br>
    
            {#if !changePassword}
                <div out:slide|local>
                    <Button
                    on:click="{() => changePassword = true}"
                    color="secondary"
                    class="w3-margin-top w3-right">
                        Changer votre mot de passe ?
                    </Button>
                    <br>
                </div>
            {:else}
                <div in:slide|local>
                    <br>
                    <TextField type="password" bind:value={oldPassword}>
                        <div slot="prepend">
                            <Icon class="fas fa-unlock"/>
                        </div>
                        Mot de passe actuel
                    </TextField>
                    
                    <br><br>
    
                    <TextField type="password"
                        bind:value={newPassword}
                        rules={RULES.NEW_PASSWORD}
                        bind:error={newPasswordError}>
                        <div slot="prepend">
                            <Icon class="fas fa-key"/>
                        </div>
                        Nouveau mot de passe
                    </TextField>
                    
                    <br>
    
                    <TextField type="password"
                        bind:value={newPassword2}
                        rules={RULE_NEW_PASSWORD}
                        bind:error={newPassword2Error}>
                        <div slot="prepend">
                            <Icon class="fas fa-key"/>
                        </div>
                        Confirmation
                    </TextField>
    
    
                    <br>
    
                    <Button 
                    variant="raised"
                    on:click={validChangePassword}
                    disabled={!newPassword || newPasswordError || newPassword2Error}
                    class="w3-margin-top w3-right">
                        Valider la modification
                    </Button>
    
                    <br>
    
                </div>
            {/if}
            <br><br><br>
    
            <Button
            on:click={user.logout}
            color="secondary"
            class="w3-margin-top w3-right">
                Déconnexion
            </Button>
    
            <br><br><br>
        </div>

    </Card>
    


    <br>
{/if}

<svelte:head>
	<style>#waitLoaded { display: none; }</style>
</svelte:head>
