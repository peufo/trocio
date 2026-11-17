<script lang="ts">
  import {
    Dialog,
    Card,
    CardTitle,
    CardText,
    CardActions,
    Button,
    Textarea,
  } from '$material'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'

  import { api } from '$lib/api'
  import type { SubscribeLookup } from 'types'
  import Loader from '$lib/util/Loader.svelte'

  const MAX_LENGTH = 1000

  let active = false
  let subscribe: undefined | SubscribeLookup = undefined
  let note = ''

  export function open(sub: SubscribeLookup) {
    subscribe = sub
    note = sub.staffNote || ''
    active = true
  }

  export function close() {
    active = false
  }

  const queryClient = useQueryClient()

  interface SetStaffNoteBody {
    subscribeId: string
    staffNote: string
  }

  const setStaffNote = useMutation(
    (data: SetStaffNoteBody) =>
      api<SetStaffNoteBody, { _id: string; staffNote: string }>(
        '/api/subscribes/note',
        {
          method: 'post',
          data,
          success: 'Note enregistrée',
        }
      ),
    {
      onSuccess: (data) => {
        if (subscribe) subscribe.staffNote = data.staffNote
        queryClient.invalidateQueries('subscribes')
        queryClient.invalidateQueries('subscribes/resum')
        active = false
      },
    }
  )

  $: tooLong = note.length > MAX_LENGTH
</script>

<Dialog bind:active>
  {#if subscribe}
    <Card>
      <CardTitle>
        <h6>Note interne · {subscribe.user?.name || subscribe.name}</h6>
      </CardTitle>

      <CardText>
        <p class="text-caption mb-4">
          Visible uniquement par les organisateurs du troc (administrateurs et
          caissiers).
        </p>
        <Textarea
          bind:value={note}
          rows={5}
          autogrow
          outlined
          placeholder="Ex : CNI n° 123456789, délivrée le 01/02/2020 par la préfecture de Haute-Savoie. 12 rue du Lac, 74320 Sevrier"
          rules={[
            (v) =>
              v.length <= MAX_LENGTH || `${MAX_LENGTH} caractères maximum`,
          ]}
        >
          Note
        </Textarea>
      </CardText>

      <CardActions class="justify-end">
        <Button text on:click={close}>Annuler</Button>
        {#if $setStaffNote.isLoading}
          <Button text disabled>
            <Loader title="Enregistrement" />
          </Button>
        {:else}
          <Button
            text
            disabled={tooLong}
            on:click={() =>
              $setStaffNote.mutate({
                subscribeId: subscribe?._id || '',
                staffNote: note,
              })}
          >
            Enregistrer
          </Button>
        {/if}
      </CardActions>
    </Card>
  {/if}
</Dialog>
