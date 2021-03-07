<script>
    import { slide, fade } from 'svelte/transition'
    import { Button, TextField, Icon } from 'svelte-materialify'
    //TODO: import HelperText from '@smui/textfield/helper-text/index'
    import notify from './notify.js'
    import { user } from './stores'
    import { getHeader } from './utils'
    
    let EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    let userName = $user.name
    let userNameError = false
    const userNameRules = [v => v.trim().length < 3 && 'Nom & prénom trop court']

    let changePassword = false
    let oldPassword = ''
    let newPassword = ''
    let newPassword2 = ''

    let changeMail = false

    let patchNamePromise
    let patchMailPromise
    let sendMailValidatorPromise
    let mailValidatorSent = false



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
            let res = await fetch('/__API__/users/me', getHeader({mail: $user.mail}, 'PATCH'))
            let json = await res.json()
            if (!json.success) throw json.message
            changeMail = false
            $user.mailvalided = false
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

</script>

{#if $user}
    <br>
    <div class="w3-padding w3-card w3-round" style="max-width: 850px; margin: auto;">

        <div style="max-width: 500px; margin: auto;">
            <br><br>

            <TextField placeholder="Nom & Prénom"
                bind:value={userName}
                rules={userNameRules}
                bind:error={userNameError}>
                <div slot="prepend">
                    <Icon class="far fa-user"/>
                </div>
            </TextField>

            {#if userName !== $user.name}
                <div in:fade|local class="w3-right">
                    {#await patchNamePromise}
                        <Button disabled>
                            <i class="fas fa-circle-notch w3-spin"></i>&nbsp;Validation ...
                        </Button>
                    {:then}
                        <Button
                        on:click="{() => patchNamePromise = patchName()}"
                        disabled={userNameError}>
                            Valider modification
                        </Button>
                    {/await}
                    <br><br>
                </div>
            {/if}
            <br><br>

            <i class="w3-xlarge far fa-envelope" style="margin-right: 13px;"></i>
            <TextField
            bind:value="{$user.mail}"
            on:input="{() => changeMail = true}"
            label="Mail"
            variant="outlined"
            style="width: calc(100% - 43px);"
            class="w3-margin-top"
            />
            
            <!-- TODO
                {#if !changeMail}
                    <HelperText id="helper-text-mail" persistent style="margin-left: 37px;">
                    {#if $user.mailvalided}
                        <span class="w3-text-green"><i class="fas fa-check"></i> mail validé</span>
                    {:else}
                        <span class="w3-text-red"><i class="fas fa-exclamation-triangle"></i> mail non validé</span>
                    {/if}
                    </HelperText>
                {/if}
            -->

            {#if changeMail}

                <div in:fade|local>
                    {#await patchMailPromise}
                        <Button variant="outlined" color="secondary" class="w3-right w3-margin-top">
                            <i class="fas fa-circle-notch w3-spin"></i>&nbsp;Validation ...
                        </Button>
                    {:then}
                        <Button
                        on:click="{() => patchMailPromise = patchMail()}"
                        variant="raised"
                        disabled="{!$user.mail.match(EMAIL_REGEX)}"
                        class="w3-right w3-margin-top"
                        style="color: white;">
                            Valider votre nouveau mail
                        </Button>
                    {/await}
                    <br><br>
                </div>
                <br>

            {:else if !$user.mailvalided}

                {#if mailValidatorSent}
                    <Button color="secondary" class="w3-right">
                        <i class="fas fa-check"></i>&nbsp;Mail de validation envoyer
                    </Button>
                {:else}

                    {#await sendMailValidatorPromise}
                        <Button color="secondary" class="w3-right">
                            <i class="fas fa-circle-notch w3-spin"></i>&nbsp;Envoie du mail ...
                        </Button>
                    {:then}
                        <Button
                        on:click="{() => sendMailValidatorPromise = sendMailValidator()}"
                        class="w3-right"
                        variant="outlined"
                        color="secondary">
                            Envoyer un mail de validation ?
                        </Button>   
                    {/await}

                {/if}
                
            {/if}
            <br><br>

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
                    <i class="w3-xlarge fas fa-unlock" style="margin-right: 16px;"></i>
                    <TextField
                    bind:value="{oldPassword}"
                    label="Mot de passe actuel"
                    type="password"
                    variant="outlined"
                    style="width: calc(100% - 43px);"
                    class="w3-margin-top"
                    />

                    <i class="w3-xlarge fas fa-key" style="margin-right: 13px;"></i>
                    <TextField
                    bind:value="{newPassword}"
                    label="Nouveau mot de passe"
                    type="password"
                    variant="outlined"
                    style="width: calc(100% - 43px);"
                    class="w3-margin-top"
                    />

                    <i class="w3-xlarge fas fa-key" style="margin-right: 13px;"></i>
                    <TextField
                    bind:value="{newPassword2}"
                    label="Confirmation"
                    type="password"
                    variant="outlined"
                    style="width: calc(100% - 43px);"
                    class="w3-margin-top"
                    />

                    <br>

                    <Button 
                    variant="raised"
                    on:click={validChangePassword}
                    disabled={oldPassword.trim().length < 4 || newPassword.trim().length < 4 || newPassword != newPassword2}
                    class="w3-margin-top w3-right"
                    style="color: white;">
                        Valider votre nouveau mot de passe
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

    </div>
    <br>
{/if}

<svelte:head>
	<style>#waitLoaded { display: none; }</style>
</svelte:head>
