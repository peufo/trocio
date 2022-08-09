<script lang="ts">
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import { Dialog, Button, Textarea, TextField } from 'svelte-materialify'

  import { api } from '$lib/api'
  import Loader from '$lib/util/Loader.svelte'
  import type { IPaymentCreate, SubscribeLookup } from 'types'

  export let active = false

  let subscribe: SubscribeLookup | undefined
  let message = ''
  let amount = '0'

  const queryClient = useQueryClient()

  export function open(
    sub: SubscribeLookup | undefined,
    _message = '',
    _amount = '0'
  ) {
    subscribe = sub
    message = _message
    amount = _amount
    if (!subscribe) return (active = false)
    active = true
  }

  const queryPayment = useMutation(
    () =>
      api<IPaymentCreate>('/api/payments', {
        method: 'post',
        data: {
          userSubId: subscribe?._id,
          amount: +amount,
          message,
        },
        success: 'Transaction enregistrée',
      }),
    {
      onSuccess: () => {
        active = false
        queryClient.invalidateQueries('subscribes')
        queryClient.invalidateQueries('subscribes/resum')
      },
    }
  )
</script>

{#if subscribe}
  <Dialog bind:active class="pa-4">
    <div class="text-h6">
      Correction du solde de <b>{subscribe.user?.name || subscribe.name}</b>
    </div>
    <div class="mt-3">
      <Textarea bind:value={message} rows={2} autogrow>Commentaire</Textarea>
    </div>

    <div class="d-flex mt-3">
      <TextField
        bind:value={amount}
        type="number"
        hint={+amount > 0 ? 'En faveur du client' : 'En votre faveur'}
      >
        Montant
      </TextField>

      <div class="flex-grow-1" />

      {#if $queryPayment.isLoading}
        <Button outlined disabled>
          <Loader />
        </Button>
      {:else}
        <Button class="primary-color" on:click={() => $queryPayment.mutate()}>
          Valider
        </Button>
      {/if}
    </div>
  </Dialog>
{/if}
