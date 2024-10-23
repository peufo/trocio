<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { useMutation } from '@sveltestack/svelte-query'

  import type { ISubscribe } from 'types'
  import { Dialog, Button, TextField } from '$material'
  import { api } from '$lib/api'
  import { troc } from '$lib/troc/store'
  import Loader from '$lib/util/Loader.svelte'

  export let active = false

  const dispatch = createEventDispatcher<{ success: ISubscribe }>()

  interface CreateGuestBody {
    trocId: string
    guestName: string
    isGuest: true
  }

  let guestNameInput: HTMLInputElement
  let guestName = ''

  export function open() {
    active = true
    setTimeout(() => {
      guestNameInput.focus()
    })
  }

  export function close() {
    active = false
  }

  /** Créer un client invité */
  const createSubscribeGuest = useMutation(
    () =>
      api<CreateGuestBody, ISubscribe>('/api/subscribes', {
        method: 'post',
        data: { trocId: $troc._id, guestName, isGuest: true },
        success: 'Nouveau participant invité',
      }),
    {
      onSuccess: (newSubscribe) => {
        close()
        dispatch('success', newSubscribe)
      },
    }
  )
</script>

<Dialog bind:active class="pa-4">
  <div class="text-h6">Nouveau client</div>
  <form on:submit|preventDefault={() => $createSubscribeGuest.mutate()}>
    <div class="d-flex mt-3" style="gap: 0.5em;">
      <TextField
        bind:inputElement={guestNameInput}
        bind:value={guestName}
        color="secondary"
        placeholder="Client xy"
      >
        Nom du client
      </TextField>

      <div class="flex-grow-1" />

      {#if $createSubscribeGuest.isLoading}
        <Button outlined disabled>
          <Loader />
        </Button>
      {:else}
        <Button class="primary-color" type="submit">Valider</Button>
      {/if}
    </div>
  </form>
</Dialog>
