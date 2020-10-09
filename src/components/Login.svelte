<script>
    import { onMount, onDestroy } from 'svelte'
    import { slide, fade } from 'svelte/transition'
    import { createEventDispatcher } from 'svelte'
    const dispatch = createEventDispatcher()
    import { afterPageLoad, goto } from '@sveltech/routify'
    import Button from '@smui/button'

    import { getHeader } from './utils'
    import { user } from './stores'
    
    export let newUser = !!$user

    let reset = false
    let name = ''
    let mail = ''
    let password = ''
    let password2 = ''

    let submitPromise

    let loginError = ''
    let EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    const googleAuthApiParams = new URLSearchParams({
        scope: 'email profile',
        access_type: 'online',
        response_type: 'code',
        redirect_uri: `${location.origin}__API__/users/login-with-google`,
        client_id: '__GOOGLE_CLIENT_ID__'
    })
    let googleAuthApi = `https://accounts.google.com/o/oauth2/v2/auth?${googleAuthApiParams.toString()}&state=${location.href}`
    $afterPageLoad(() => {
        googleAuthApi = `https://accounts.google.com/o/oauth2/v2/auth?${googleAuthApiParams.toString()}&state=${location.href}`
    })

    function submit() {
        if (!loginError) {
            if (newUser || $user) {
                submitPromise = Register()
            }else if(reset){
                submitPromise = Reset()
            }else{
                submitPromise = Login()
            }
        }
    }

    async function Register() {
        try {
            let res = await fetch('__API__/users', getHeader({name, mail, password}))
            let json = await res.json()
            if (json.success) {
                if ($user) {//Un Cassier à créer un utilisateur
                    alert(`Transmettez les information de compte à ${json.message.name}\n\nMail : ${json.message.mail}\nMot de passe : ${json.message.password}`)
                    dispatch('newClient', json.message)
                }else{
                    await Login()
                }
                return
            }else{
                alert(json.message)
            }
        } catch(error) {
			console.trace(error)
		}
    }   

    async function Login() {
        return user.login(mail, password, err => {
            if (err) return alert(err.message)
            dispatch('close')
            dispatch('done')
            return
        })
    }

    async function Reset() {
        try {
            let res = await fetch('__API__/users/resetpwd', getHeader({mail}))
            let json = await res.json()
            if (res.ok) {
                alert('Votre nouveau mot de passe vous à été envoyé par mail')
                reset = false
                password = ''
                password2 = ''
                return
            }else{
                alert(json.message)
            }
        } catch(error) {
			console.trace(error)
		}
    }

    $: {
        loginError = ''
        if (!mail.match(EMAIL_REGEX)) loginError = 'Mail invalide !'
        if (!newUser && !reset && password.length < 3) loginError = 'Mot de passe trop court'
        if (newUser && name.length < 3) loginError = 'Nom trop court'
        if (!$user && newUser && password != password2) loginError = 'Mot de passe de confirmation pas identique'
    }

</script>


<div class="w3-padding" style="min-width: 330px;">

    {#if newUser}
        <h3 class="w3-center" in:fade>Nouveau compte</h3>
    {:else if reset}
        <h3 class="w3-center" in:fade>Récupération</h3>
    {:else}
        <h3 class="w3-center" in:fade>Login</h3>
    {/if}

    <br>

    {#if newUser}
    <div transition:slide|local>
        <div class="w3-col iconInput"><i class="w3-large far fa-user"></i></div>
        <div class=" w3-rest">
            <input
                bind:value={name}
                class="userInput w3-input"
                type="text"
                placeholder="Nom & prénom"
                on:keyup="{e => e.which == 13 && submit()}">
        </div>
    </div>
    {/if}


    <div class="w3-col iconInput"><i class="w3-large far fa-envelope"></i></div>
    <div  class="w3-rest">
        <input
            bind:value={mail}
            class="userInput w3-input"
            type="email"
            placeholder="Email"
            on:keyup="{e => e.which == 13 && submit()}">
    </div>							

    {#if !reset && !$user}
    <div transition:slide|local>
        <div class="w3-col iconInput"><i class="w3-large fas fa-key"></i></div>
        <div class="w3-rest">
            <input
                bind:value={password}
                class="userInput w3-input"
                type="password"
                placeholder="Mot de passe"
                on:keyup="{e => e.which == 13 && submit()}">
        </div>	
    </div>					
    {/if}

    {#if newUser && !$user}
    <div transition:slide|local>
        <div class="w3-col iconInput"><i class="w3-large fas fa-key"></i></div>
        <div  class="w3-rest">
            <input
                bind:value={password2}
                class="userInput w3-input"
                type="password"
                placeholder="Pour être sûr :)"
                on:keyup="{e => e.which == 13 && submit()}">
        </div>						
    </div>
    {/if}

    <div>
        <div class="w3-margin-top w3-small w3-center">

            {#if !$user}
                <div on:click={() => {newUser = !newUser; reset = false}} class="underline-div w3-padding">
                    <span class="underline-span">
                        {newUser ? `Déjà un compte` : `Nouveau compte`} 
                    </span>
                </div>
                
                {#if !newUser}
                    <div on:click={() => {reset = !reset}} class="underline-div w3-padding">
                        <span class="underline-span">
                            {reset ? 'Login' : 'Oubli'} 
                        </span>
                    </div>
                {/if}
            {/if}

            {#await submitPromise}
                <Button disabled>
                    <i class="fas fa-circle-notch w3-spin"></i>
                    Validation...
                </Button>
            {:then}
                <Button on:click={submit} disabled={!!loginError}>
                    Envoyer
                </Button>
            {/await}

        </div>
    </div>

    {#if !$user}
        <br><br>
        <div class="w3-center w3-border-top">
            <div class="or">
                <span>OU</span> 
            </div>
            <Button href={googleAuthApi}>
                <i class="fab fa-google"></i>&nbsp;
                Login avec Google
            </Button>
        </div>
    {/if}


</div>


<style>

    .or {
        transform: translateY(-50%);
        background: #fff;
        width: 35px;
        margin: auto;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 50%;
    }

    .underline-span {
        text-transform: uppercase;
    }

    .iconInput{
        margin-top: 12px;
        width: 30px;
        color: #888;
    }

    .underline-div {
        display: inline-block;
    }

</style>