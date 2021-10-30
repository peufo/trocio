<script lang="ts">
  import { slide } from 'svelte/transition'
  import { Button, Dialog, Select } from 'svelte-materialify'
  import type { SubscribeLookup } from 'types'

  export let active = false
  export let subscribe: undefined | SubscribeLookup = undefined
  export let newSubscribe: undefined | SubscribeLookup = undefined

  export function openSubscribe(sub: SubscribeLookup) {
    subscribe = { ...sub }
    newSubscribe = { ...sub }
    active = true
  }

  $: isModified = JSON.stringify(subscribe) !== JSON.stringify(newSubscribe)

  const roles = [
    { value: 'basic', name: 'Participant' },
    { value: 'trader', name: 'Commerçants' },
    { value: 'cashier', name: 'Caissier' },
    { value: 'admin', name: 'Administrateur' },
  ]
</script>

{#if subscribe && newSubscribe}
  <Dialog bind:active class="pa-4">
    <div style="height: 200px;">
      <div class="text-h6">
        {subscribe.user.name}
      </div>

      <br />

      <div class="d-flex">
        <Select outlined items={roles} bind:value={subscribe.role} class="mr-1">
          Rôle
        </Select>

        <Select outlined items={roles} bind:value={subscribe.role} class="ml-1">
          Tarif
        </Select>
      </div>
      <div class="d-flex">
        <Button>N propositions</Button>
        <Button>N Achats</Button>
      </div>
    </div>

    {#if isModified}
      <div transition:slide|local>
        <Button
          disabled={false}
          class={false ? '' : 'primary-color'}
          on:click={() => {}}
        >
          Valider la modification
        </Button>
      </div>
    {/if}
  </Dialog>
{/if}
