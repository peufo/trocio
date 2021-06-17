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

  import { troc, useCreateTroc, useUpdateTroc } from '$lib/troc/store'
  import { user, userQuery } from '$lib/user/store'
  import IconLink from '$lib/util/IconLink.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import notify from '$lib/notify'
  import { getHeader } from '$lib/utils'
  // import AutoPatch from '$lib/AutoPatch.svelte'
  import autoPatch from '$lib/autoPatch'
  import SearchAddress from '$lib/control/SearchAddress.svelte'

  export let newTroc = {
    name: '',
    is_try: true,
    address: '',
    location: { lng: 0, lat: 0 },
    description: '',
    schedule: [],
    society: '',
    societyweb: '',
    mapDelay: 0,
  }

  export let name = ''
  export let is_try = true
  export let address = ''
  export let location = { lng: 0, lat: 0 }
  export let description = ''
  export let schedule = []
  export let society = ''
  export let societyweb = ''
  export let mapDelay = 0

  export let updateMode = true

  const createTroc = useCreateTroc()
  const updateTroc = useUpdateTroc()

  let offsetWidth = 0
  let smallDisplay = false

  $: smallDisplay = offsetWidth < 800

  // Schedule conversion
  if (!schedule.length) onMount(addSchedule)
  let scheduleIn = schedule.map((s) => {
    return {
      day: dayjs(s.open).format('YYYY-MM-DD'),
      open: dayjs(s.open).format('HH:mm'),
      close: dayjs(s.close).format('HH:mm'),
    }
  })

  function addSchedule(e) {
    if (!!e) e.preventDefault()
    if (scheduleIn.length == 0) {
      scheduleIn = [
        ...scheduleIn,
        {
          day: dayjs().add(7, 'day').format('YYYY-MM-DD'),
          open: dayjs().hour(8).minute(0).format('HH:mm'),
          close: dayjs().hour(18).minute(0).format('HH:mm'),
        },
      ]
    } else {
      let last = scheduleIn[scheduleIn.length - 1]
      scheduleIn = [
        ...scheduleIn,
        {
          day: dayjs(last.day).add(1, 'day').format('YYYY-MM-DD'),
          open: last.open,
          close: last.close,
        },
      ]
    }
    convertSchedule()
    return
  }

  function removeSchedule(i) {
    scheduleIn.splice(i, 1)
    scheduleIn = scheduleIn
    convertSchedule()
  }

  function convertSchedule() {
    schedule = scheduleIn.map((s) => {
      if (s.day && s.open && s.close) {
        let dayForSafari = dayjs(s.day).format('YYYY/MM/DD')
        return {
          open: new Date(`${dayForSafari} ${s.open}`).toISOString(),
          close: new Date(`${dayForSafari} ${s.close}`).toISOString(),
        }
      }
    })
  }

  let invalid = ''
  $: {
    invalid = ''
    if (!is_try) {
      if (!address) invalid = 'Adresse incomplette'
      else if (!location.lat) invalid = 'Adresse non localisé'
      else if (!scheduleIn.length) invalid = 'Pas de plage horaire'
      else if (schedule.indexOf(undefined) != -1)
        invalid = 'Plage horaire incomplette'
    }
    if (description.length < 10)
      invalid = `Déscription trop courte (${description.length}/10)`
    else if (!name) invalid = 'Pas de nom'
  }

  function handleCreateTroc() {
    if (invalid) return notify.warning(invalid)
    $createTroc.mutate(newTroc, {
      onSuccess: () => {
        if (!is_try)
          userQuery.set({ ...$user, creditTroc: $user.creditTroc - 1 })
      },
    })
  }

  function handleInput(event) {
    const { type, name } = event.target
    console.log(type, name, event)
    if (type && newTroc[name] !== undefined) {
      switch (type) {
        case 'text':
        case 'textarea':
          newTroc[name] = event.target.value
          break
        case 'checkbox':
          newTroc[name] = event.target.checked
          break
      }
    }
    console.log(newTroc)
  }

  //For SearchLocation to Autopatch
  //Très bof bof, mais ca marche
  let changeFlag = false
</script>

<div id="editForm" bind:offsetWidth>
  <div class="container" class:smallDisplay>
    <div class="item troc">
      <h6>Le troc</h6>
      <div class="pb-3">
        <Checkbox
          name="is_try"
          bind:checked={is_try}
          on:change={handleInput}
          title="Troc d'entrainement"
        >
          Troc d'entrainement
        </Checkbox>
      </div>
      {#if is_try}
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

      <TextField bind:value={name} on:input={handleInput} name="name" outlined>
        Nom de l'évènement
      </TextField>
      <br />
      <Textarea
        bind:value={description}
        on:input={handleInput}
        name="description"
        autogrow
        rows={5}
        outlined
      >
        Déscription
      </Textarea>
    </div>

    <div class="item location">
      <h6>Lieu</h6>
      <br />
      {#if is_try || $troc?.is_try}
        <div class="icon-container">
          <br />
          <span class="w3-text-orange">
            Les trocs d'entrainements n'ont pas de lieu
          </span>
          <i class="fas fa-map-marked-alt" />
        </div>
      {:else}
        <SearchAddress {mapDelay} bind:address bind:location bind:changeFlag />
      {/if}
    </div>

    <div class="item schedule">
      <h6>Horaire</h6>
      <br />
      {#if is_try || $troc?.is_try}
        <div class="icon-container">
          <br /><span class="w3-text-orange"
            >Les trocs d'entrainements n'ont pas d'horaire</span
          >
          <i class="far fa-calendar-alt" />
        </div>
      {:else}
        <Table class="w3-margin-bottom" style="min-width: 100%;">
          <thead>
            <tr>
              <td>Date</td>
              <td>Ouverture</td>
              <td>Fermeture</td>
              <td style="width: 20px;" />
            </tr>
          </thead>
          <tbody>
            {#each scheduleIn as { day, open, close }, i}
              <tr>
                <td>
                  <input bind:value={day} type="date" />
                </td>
                <td
                  ><input
                    bind:value={open}
                    max={close}
                    on:input={convertSchedule}
                    type="time"
                  /></td
                >
                <td style="width: 20px; padding: 1px 0px 1px 16px">
                  <input
                    bind:value={close}
                    min={open}
                    on:input={convertSchedule}
                    type="time"
                  />
                </td>
                <td style="width: 20px; padding: 0px">
                  <i
                    on:click={() => removeSchedule(i)}
                    class="patchButton far fa-trash-alt w3-right w3-large w3-padding"
                    title="supprimer la période"
                  />
                </td>
              </tr>
            {/each}
          </tbody>
        </Table>

        <Button
          on:click={addSchedule}
          outlined
          class="patchButton w3-right"
          title="Ajouter un période"
        >
          +1 période
        </Button>

        <br />
        <span class="w3-opacity w3-text-orange">
          L'horaire n'est plus modifiable une fois que l'évenement a débuté.
        </span>
      {/if}
    </div>

    <div class="item society">
      <h6>
        Organisation <span class="w3-small w3-opacity">Optionnel</span>
      </h6>
      <br />
      <TextField bind:value={society} outlined>Nom de l'organisation</TextField>
      <br />
      <TextField bind:value={societyweb} outlined>
        Site internet de l'organisation
      </TextField>
    </div>
    {#if !$troc}
      <div class="item buttons-container">
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
    <!--

      <AutoPatch
      source="editForm"
      path={`/trocs/${$troc._id}`}
      {invalid}
      body={{
        name,
        address,
        location,
        description,
        schedule,
          society,
          societyweb,
        }}
        trocRefresh
        bind:changeFlag
        />
        {/if}
      -->
  </div>
</div>

<style lang="scss">
  .buttons-container {
    display: flex;
    justify-content: flex-end;
    grid-column: 2;
  }

  .container {
    display: grid;
    width: 100%;
    max-width: 1000px;
    margin: auto;
    grid-template-columns: minmax(50%, 500px) minmax(40%, 50%);
    gap: 2rem;
    padding-bottom: 2em;
  }

  .container.smallDisplay {
    grid-template-columns: 100%;
    .buttons-container {
      grid-column: 1;
    }
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
