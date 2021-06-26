<script lang="ts">
  import { onMount } from 'svelte'
  import { slide } from 'svelte/transition'
  import dayjs from 'dayjs'
  import {
    Button,
    TextField,
    Textarea,
    Table,
    Checkbox,
  } from 'svelte-materialify'
  import { faInfo } from '@fortawesome/free-solid-svg-icons'

  import type { TrocBase } from 'types'
  import { troc, useCreateTroc, useUpdateTroc } from '$lib/troc/store'
  import EditAddress from '$lib/troc/EditAddress.svelte'
  import EditSchedule from '$lib/troc/EditSchedule.svelte'

  import { user, userQuery } from '$lib/user/store'
  import IconLink from '$lib/util/IconLink.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import notify from '$lib/notify'
  import { getHeader } from '$lib/utils'
  // import AutoPatch from '$lib/AutoPatch.svelte'
  import autoPatch from '$lib/autoPatch'

  export let updateMode = true
  export const newTroc: TrocBase = {
    name: '',
    is_try: false,
    address: '',
    location: { lng: 0, lat: 0 },
    description: '',
    schedule: [],
    society: '',
    societyweb: '',
  }

  const createTroc = useCreateTroc()
  const updateTroc = useUpdateTroc()

  let offsetWidth = 0

  let invalid = ''
  function validation() {
    invalid = ''
    if (!newTroc.is_try) {
      if (!newTroc.address) invalid = 'Adresse incomplette'
      else if (!newTroc.location.lat) invalid = 'Adresse non localisé'
      else if (!newTroc.schedule.length) invalid = 'Pas de plage horaire'
      else if (newTroc.schedule.includes(undefined))
        invalid = 'Plage horaire incomplette'
    }
    if (newTroc.description.length < 10)
      invalid = `Déscription trop courte (${newTroc.description.length}/10)`
    else if (!newTroc.name) invalid = 'Pas de nom'
  }

  function handleCreateTroc() {
    if (invalid) return notify.warning(invalid)
    $createTroc.mutate(newTroc, {
      onSuccess: (createdTroc) => {
        if (!createdTroc.is_try)
          userQuery.set({ ...$user, creditTroc: $user.creditTroc - 1 })
      },
    })
  }

  function handleInput(event: any) {
    const { detail } = event
    if (detail) {
      // Handle custom event
      Object.keys(detail).forEach((key) => {
        newTroc[key] = detail[key]
      })
    } else {
      // Handle input event
      const { type, name, value } = event.target
      if (type === 'text' || type === 'textarea') {
        newTroc[name] = value
      } else if (type === 'checkbox') {
        newTroc[value] = event.target.checked
      }
    }

    console.log(newTroc)
    validation()
  }
</script>

<div bind:offsetWidth>
  <div class="container">
    <div class="troc">
      <h6>Le troc</h6>
      <div class="pb-3">
        <Checkbox
          value="is_try"
          checked={newTroc.is_try}
          on:change={handleInput}
          title="Troc d'entrainement"
        >
          Troc d'entrainement
        </Checkbox>
      </div>
      {#if newTroc.is_try || $troc?.is_try}
        <div
          transition:slide|local
          class="text--disabled d-flex"
          style="font-size: .8em;"
        >
          <div class="centered pb-3" style="width: 32px;">
            <IconLink icon={faInfo} size="1em" />
          </div>

          <div class="pb-3">
            Les trocs d'entrainement ne sont pas visible publiquement. <br />
            Ils permettent de tester l'interface et de préparer une équipe.
          </div>
        </div>
      {/if}

      <TextField
        name="name"
        on:input={handleInput}
        value={newTroc.name}
        outlined
      >
        Nom de l'évènement
      </TextField>
      <br />
      <Textarea
        name="description"
        on:input={handleInput}
        value={newTroc.description}
        autogrow
        rows={5}
        outlined
      >
        Déscription
      </Textarea>
    </div>

    <div class="location">
      <h6>Lieu</h6>
      <br />
      {#if newTroc.is_try || $troc?.is_try}
        <div class="icon-container">
          <br />
          <span class="w3-text-orange">
            Les trocs d'entrainements n'ont pas de lieu
          </span>
          <i class="fas fa-map-marked-alt" />
        </div>
      {:else}
        <EditAddress mapDelay={200} on:change={handleInput} />
      {/if}
    </div>

    <div class="schedule">
      <h6>Horaire</h6>
      <br />
      {#if newTroc.is_try || $troc?.is_try}
        <div class="icon-container">
          <br /><span class="w3-text-orange"
            >Les trocs d'entrainements n'ont pas d'horaire</span
          >
          <i class="far fa-calendar-alt" />
        </div>
      {:else}
        <EditSchedule on:change={handleInput} />
      {/if}
    </div>

    <div class="society">
      <h6>
        Organisation <span class="w3-small w3-opacity">Optionnel</span>
      </h6>
      <br />
      <TextField
        name="society"
        on:input={handleInput}
        value={newTroc.society}
        outlined>Nom de l'organisation</TextField
      >
      <br />
      <TextField
        name="societyweb"
        on:input={handleInput}
        value={newTroc.societyweb}
        outlined
      >
        Site internet de l'organisation
      </TextField>
    </div>
    {#if !$troc}
      <div class="buttons-container">
        <Button
          on:click={handleCreateTroc}
          text={$createTroc.isLoading}
          disabled={$createTroc.isLoading}
          title="Valider la création de mon troc"
          class="green white-text"
        >
          {#if $createTroc.isLoading}
            <Loader title="Création en cours" />
          {:else}
            Créer un troc
          {/if}
        </Button>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .buttons-container {
    display: flex;
    justify-content: flex-end;
    grid-column: 2;
  }

  .container {
    width: 100%;
    max-width: 600px;
    margin: auto;
  }

  .container > div {
    margin-bottom: 2em;
  }

  .schedule input {
    border: none;
    font-size: medium;
    padding: 5px 10px;
    background: rgba(0, 0, 0, 0);
  }

  .schedule i {
    transform: scale(0);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .schedule tr:hover i {
    transform: scale(1);
  }

  .icon-container {
    background: #f7f7f7;
    border: solid 1px #eee;
    width: 100%;
    height: 135px;
    position: relative;
    border-radius: 5px;
    text-align: center;
  }

  .icon-container i {
    left: 50%;
    top: 64%;
    position: absolute;
    transform: translate(-50%, -50%) scale(3);
    color: #fff;
  }

  :global(.theme--dark) .icon-container {
    border: none;
    background: #333;
  }
  :global(.theme--dark) .icon-container i {
    color: #666;
  }
</style>
