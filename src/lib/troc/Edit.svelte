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
  import { user, userQuery } from '$lib/user/store'
  import IconLink from '$lib/util/IconLink.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import notify from '$lib/notify'
  import { getHeader } from '$lib/utils'
  // import AutoPatch from '$lib/AutoPatch.svelte'
  import autoPatch from '$lib/autoPatch'
  import SearchAddress from '$lib/control/SearchAddress.svelte'

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
  let smallDisplay = false

  $: smallDisplay = offsetWidth < 800

  // Schedule conversion
  /*
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
  */

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

<div id="editForm" bind:offsetWidth>
  <div class="container" class:smallDisplay>
    <div class="item troc">
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

    <div class="item location">
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
        <SearchAddress mapDelay={200} on:change={handleInput} />
      {/if}
    </div>

    <div class="item schedule">
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
            <!--
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
            -->
          </tbody>
        </Table>
        <!--

          <Button
            on:click={addSchedule}
            outlined
            class="patchButton w3-right"
            title="Ajouter un période"
          >
            +1 période
          </Button>
        -->

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
