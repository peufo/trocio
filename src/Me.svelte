
<script>
    import { me } from './stores'
    import { slide, fade } from 'svelte/transition'
    import { getHeader } from './utils'

    import Login from './Login.svelte'

    import Textfield from '@smui/Textfield'
    import HelperText from '@smui/Textfield/helper-text/index'
    import Button from '@smui/Button'

    let EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    let tabSelected = 0
	let tabs = [
		{name: 'Mes informations', icon: '<i class="fas fa-info-circle"></i>'},
		{name: 'Mes activités', icon: '<i class="far fa-star"></i>'},
    ]

    let changePassword = false
    let oldPassword = ''
    let newPassword = ''
    let newPassword2 = ''

    let changeMail = false
    let changeName = false

    $: console.log($me)

    let patchNamePromise
    let patchMailPromise
    let sendMailValidatorPromise
    let mailValidatorSent = false

    async function patchName() {
        let res = await fetch('/users/me', getHeader({name: $me.name}, 'PATCH'))
        let json = await res.json()
        if (json.success) {
            changeName = false
            return
        }else{
            alert(json.message)
        }
    }
    
    async function patchMail() {
        let res = await fetch('/users/me', getHeader({mail: $me.mail}, 'PATCH'))
        let json = await res.json()
        if (json.success) {
            changeMail = false
            $me.mailvalided = false
            return
        }else{
            //Pas sur mais ca ira...
            alert('Le mail indiqué est invalide ou déjà pris !')
        }
    }

    async function sendMailValidator() {
        let res = await fetch('/users/sendvalidmail', getHeader({}))
        let json = await res.json()
        if (json.success) {
            mailValidatorSent = true
            return
        }else{
            alert(json.message)
        }
    }

    async function validChangePassword() {
        let res = await fetch('/users/changepwd', getHeader({oldPassword, newPassword}))
        let json = await res.json()
        if (json.success) {
            changePassword = false
            oldPassword = ''
            newPassword = ''
            newPassword2 = ''
            alert('Changement du mot de passe accepté')
        }else {
            alert('Changement du mot de passe refusé')
        }
    }

</script>


{#if !$me._id}

    <div class="w3-display-container" style="height: calc(100% - 96px);">
        <div class="w3-display-middle w3-card w3-round" style="width: 400px;">
            <Login/>
        </div>
    </div>

{:else}

    <div class="onglets">
        {#each tabs as tab, i}
            <div class="w3-padding underline-div onglet"
                on:click="{() => tabSelected = i}"
                class:actived="{tabSelected == i}">
                {@html tab.icon}
                <span class="underline-span">{tab.name}</span>
            </div>
        {/each}
    </div>

    <div class="tabs" style="height:  calc(100% - 96px);">

        <!-- Informations personel -->
        <div class="tab" class:center={tabSelected == 0} class:left={tabSelected > 0}>
            <br>
            <div class="w3-padding w3-card w3-round" style="max-width: 850px; margin: auto;">

                <div style="max-width: 500px; margin: auto;">
                    <br><br>

                    <i class="w3-xlarge far fa-user" style="margin-right: 16px;"></i>
                    <Textfield
                    bind:value="{$me.name}"
                    on:input="{() => changeName = true}"
                    label="Nom & Prénom"
                    variant="outlined"
                    style="width: calc(100% - 43px);"
                    class="w3-margin-top"
                    />

                    {#if changeName}
                        <div in:fade>
                            {#await patchNamePromise}
                                <Button
                                variant="outlined"
                                color="secondary"
                                class="w3-right w3-margin-top">
                                    <i class="fas fa-circle-notch w3-spin"></i>&nbsp;Validation ...
                                </Button>
                            {:then}
                                <Button
                                on:click="{() => patchNamePromise = patchName()}"
                                variant="raised"
                                disabled={$me.name.trim().length < 2}
                                class="w3-right w3-margin-top"
                                style="color: white;">
                                    Valider votre nouveau nom & prénom
                                </Button>
                            {/await}
                            <br><br>
                        </div>
                    {/if}
                    <br><br>

                    <i class="w3-xlarge far fa-envelope" style="margin-right: 13px;"></i>
                    <Textfield
                    bind:value="{$me.mail}"
                    on:input="{() => changeMail = true}"
                    label="Mail"
                    variant="outlined"
                    style="width: calc(100% - 43px);"
                    class="w3-margin-top"
                    />

                    {#if !changeMail}
                        <HelperText id="helper-text-mail" persistent style="margin-left: 37px;">
                        {#if $me.mailvalided}
                            <span class="w3-text-green"><i class="fas fa-check"></i> mail validé</span>
                        {:else}
                            <span class="w3-text-red"><i class="fas fa-exclamation-triangle"></i> mail non validé</span>
                        {/if}
                        </HelperText>
                    {/if}

                    {#if changeMail}

                        <div in:fade>
                            {#await patchMailPromise}
                                <Button variant="outlined" color="secondary" class="w3-right w3-margin-top">
                                    <i class="fas fa-circle-notch w3-spin"></i>&nbsp;Validation ...
                                </Button>
                            {:then}
                                <Button
                                on:click="{() => patchMailPromise = patchMail()}"
                                variant="raised"
                                disabled="{!$me.mail.match(EMAIL_REGEX)}"
                                class="w3-right w3-margin-top"
                                style="color: white;">
                                    Valider votre nouveau mail
                                </Button>
                            {/await}
                            <br><br>
                        </div>
                        <br>

                    {:else if !$me.mailvalided}

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
                        <div out:slide>
                            <Button
                            on:click="{() => changePassword = true}"
                            color="secondary"
                            class="w3-margin-top w3-right">
                                Changer votre mot de passe ?
                            </Button>
                            <br>
                        </div>
                    {:else}
                        <div in:slide>
                            <i class="w3-xlarge fas fa-unlock" style="margin-right: 16px;"></i>
                            <Textfield
                            bind:value="{oldPassword}"
                            label="Mot de passe actuel"
                            type="password"
                            variant="outlined"
                            style="width: calc(100% - 43px);"
                            class="w3-margin-top"
                            />

                            <i class="w3-xlarge fas fa-key" style="margin-right: 13px;"></i>
                            <Textfield
                            bind:value="{newPassword}"
                            label="Nouveau mot de passe"
                            type="password"
                            variant="outlined"
                            style="width: calc(100% - 43px);"
                            class="w3-margin-top"
                            />

                            <i class="w3-xlarge fas fa-key" style="margin-right: 13px;"></i>
                            <Textfield
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
                    href="/users/logout"
                    color="secondary"
                    class="w3-margin-top w3-right">
                        Déconnexion
                    </Button>

                    <br><br><br>
                </div>

            </div>
            <br>
        </div>

        <!-- Activités -->
        <div class="tab" class:center={tabSelected == 1} class:right={tabSelected < 1}>
            <br>
            <div class="w3-padding w3-card w3-round w3-center" style="max-width: 850px; margin: auto;">
                Ici, vous pourrez bientôt voir un syntèse de votre activité
            </div>
            <br>
        </div>

    </div>

{/if}



<svelt:head>
	<style>#waitLoaded { display: none; }</style>
</svelt:head>

<style>

</style>