<script lang="ts">
  import { onMount } from 'svelte'
  import { slide } from 'svelte/transition'
  import { goto } from '@roxi/routify'
  import clone from 'clone'

  import { Button, TextField, Textarea, Checkbox } from 'svelte-materialify'
  import { faInfo } from '@fortawesome/free-solid-svg-icons'

  import type { TrocBase } from 'types'
  import { troc, useCreateTroc, useUpdateTroc } from '$lib/troc/store'
  import UpdateButton from '$lib/util/UpdateButton.svelte'
  import EditAddress from '$lib/troc/EditAddress.svelte'
  import EditSchedule from '$lib/troc/EditSchedule.svelte'

  import { user, userQuery } from '$lib/user/store'
  import IconLink from '$lib/util/IconLink.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import notify from '$lib/notify'

  /**
   * createMode permet de créer un troc
   * Sinon, le troc du store est utilisé
   */
  export let createMode = false
  export let newTroc: TrocBase = {
    name: '',
    is_try: true,
    currency: 'EUR',
    address: '',
    location: undefined,
    description: '',
    schedule: [],
    society: '',
    societyweb: '',
  }
  const createTroc = useCreateTroc()
  const updateTroc = useUpdateTroc()

  let isNewTrocCloned = false
  let error = ''

  onMount(() => {
    if (!createMode) {
      newTroc = clone($troc)
    }
    isNewTrocCloned = true
    validation()
  })

  function validation() {
    error = ''
    if (!newTroc?.is_try) {
      if (newTroc.description.length < 10)
        error = `Description trop courte (${newTroc.description.length}/10)`
      else if (!newTroc.address) error = 'Adresse incomplette'
      else if (!newTroc.location?.lat) error = 'Adresse non localisé'
      else if (!newTroc.schedule?.length) error = 'Pas de plage horaire'
      else if (newTroc.schedule?.includes(undefined))
        error = 'Plage horaire incomplette'
    }
    if (!newTroc.name) error = 'Pas de nom'
  }

  function handleCreateTroc() {
    if (error) return notify.warning(error)
    if (newTroc.is_try && !newTroc.description)
      newTroc.description = 'Pas de description'
    $createTroc.mutate(newTroc, {
      onSuccess: (createdTroc) => {
        if (!createdTroc.is_try)
          userQuery.set({ ...$user, creditTroc: $user.creditTroc - 1 })
        $goto('/admin', { trocId: createdTroc._id })
      },
    })
  }

  function handleUpdateTroc() {
    if (error) return notify.warning(error)
    $updateTroc.mutate(
      { ...newTroc, _id: $troc._id },
      { onSuccess: testIsModifed }
    )
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

    validation()
    if (!createMode) testIsModifed()
  }

  /**
   * Test de difference entre newTroc and $troc
   */
  let blockIsModifed = {
    troc: false,
    location: false,
    schedule: false,
    society: false,
  }

  type TrocBaseKey = keyof TrocBase
  function isModified(keys: TrocBaseKey[]): boolean {
    if (!$troc || !isNewTrocCloned) return false
    keys = Array.isArray(keys) ? keys : [keys]
    console.log('new', JSON.stringify(newTroc.schedule))
    console.log('old', JSON.stringify($troc.schedule))
    return (
      keys.filter((key) => {
        return typeof newTroc[key] === 'object'
          ? JSON.stringify(newTroc[key]) === JSON.stringify($troc[key])
          : newTroc[key] === $troc[key]
      }).length < keys.length
    )
  }

  function testIsModifed() {
    blockIsModifed = {
      troc: isModified(['name', 'description']),
      location: isModified(['address', 'location', 'currency']),
      schedule: isModified(['schedule']),
      society: isModified(['society', 'societyweb']),
    }
  }
</script>

<div class="container">
  <div class="troc">
    <h6>Le troc</h6>
    <br />
    {#if createMode || newTroc?.is_try}
      <div class="pb-3">
        <Checkbox
          value="is_try"
          checked={newTroc?.is_try}
          on:change={handleInput}
          disabled={!createMode}
        >
          Troc d'entrainement
        </Checkbox>
      </div>
    {/if}

    {#if isNewTrocCloned && newTroc?.is_try}
      <div
        transition:slide|local
        class="text--disabled d-flex"
        style="font-size: .8em;"
      >
        <div class="centered pb-5" style="width: 32px;">
          <IconLink icon={faInfo} size="1em" />
        </div>

        <div class="pb-5">
          Les trocs d'entrainement ne sont pas visible publiquement. <br />
          Ils permettent de tester l'interface et de préparer une équipe.
        </div>
      </div>
    {/if}

    <TextField name="name" on:input={handleInput} value={newTroc.name} outlined>
      Nom de l'évènement
    </TextField>
    <br />
    <Textarea
      name="description"
      on:input={handleInput}
      value={newTroc.description}
      autogrow
      rows={5}
      placeholder=" "
      outlined
    >
      Description
    </Textarea>

    <UpdateButton
      visible={blockIsModifed.troc}
      updateQuery={updateTroc}
      clickHandler={handleUpdateTroc}
    />
  </div>

  <div class="location">
    <h6>Lieu</h6>
    <br />

    <EditAddress
      on:change={handleInput}
      address={newTroc.address}
      location={newTroc.location}
      currency={newTroc.currency}
      mapDelay={200}
    />

    <UpdateButton
      visible={blockIsModifed.location}
      updateQuery={updateTroc}
      clickHandler={handleUpdateTroc}
    />
  </div>

  <div class="schedule">
    <h6>Horaire</h6>
    <br />
    {#if newTroc?.is_try}
      <div class="icon-container">
        <br />
        <span class="w3-text-orange">
          Les trocs d'entrainements n'ont pas d'horaire
        </span>
        <i class="far fa-calendar-alt" />
      </div>
    {:else}
      <EditSchedule schedule={newTroc.schedule} on:change={handleInput} />
      <UpdateButton
        visible={blockIsModifed.schedule}
        updateQuery={updateTroc}
        clickHandler={handleUpdateTroc}
      />
      <br />
      <span class="w3-opacity w3-text-orange">
        L'horaire n'est plus modifiable une fois que l'évenement a débuté.
      </span>
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

    <UpdateButton
      visible={blockIsModifed.society}
      updateQuery={updateTroc}
      clickHandler={handleUpdateTroc}
    />
  </div>

  {#if createMode}
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

<style>
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
