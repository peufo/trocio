<script>
    import { onMount } from 'svelte'
    import { slide, fade } from 'svelte/transition'
    import { getHeader } from './utils'
    import { me } from './stores'
    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    export let id = 'login' //For focus()

    let newUser = false
    let reset = false
    let name = ''
    let mail = ''
    let password = ''
    let password2 = ''
    let close = false

    onMount(() => {
       focus()
    })

    function focus() {
        setTimeout(() => {
            let loginForm = document.getElementById(`loginForm${id}`)
            loginForm.getElementsByTagName('input')[0].focus()
        }, 450)
    }

    function submit() {
        if (newUser) {
            Register()
        }else{
            Login()
        }
    }

    async function Login(){
        let res = await fetch('/users/login', getHeader({mail, password}))
        let json = await res.json()
        if (json.name) {
            $me = json
            dispatch('close')
            close = true
        }else{
            alert(json.message)
        }
    }
    
    async function Register() {
        let res = await fetch('/users', getHeader({name, mail, password}))
        let json = await res.json()
        if (json.success) {
            Login()
        }else{
            alert(json.message)
        }
    }

</script>

{#if !close} <!-- Belle rustine-->
<div id="{`loginForm${id}`}" class="w3-padding">
    {#if newUser}
        <h3 class="w3-center" in:fade>Nouveau compte</h3>
    {:else if reset}
        <h3 class="w3-center" in:fade>Reset</h3>
    {:else}
        <h3 class="w3-center" in:fade>Login</h3>
    {/if}

    {#if newUser}
    <div transition:slide>
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

    {#if !reset}
    <div transition:slide>
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

    {#if newUser}
    <div transition:slide>
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
        <div class="w3-margin-top w3-small">

            <div on:click="{() => {newUser = !newUser; reset = false; focus()}}" class="underline-div w3-padding">
                <span class="underline-span">
                    {newUser ? `Déjà un compte ?` : `Nouveau compte ?`} 
                </span>
            </div>
            
            {#if !newUser}
                <div on:click="{() => {reset = !reset; focus()}}" class="underline-div w3-padding">
                    <span class="underline-span">
                        {reset ? 'Login ?' : 'Oubli ?'} 
                    </span>
                </div>
            {/if}

            <input id="submit" on:click={submit} type="submit" class="w3-right w3-button w3-border w3-round">

        </div>
    </div>
</div>
{/if}



<style>

.iconInput{
    margin-top: 12px;
    width: 30px;
    color: #888;
}

.underline-div {
    display: inline-block;
}

</style>