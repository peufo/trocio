<script lang="ts">
  import { onMount } from 'svelte'
  import dayjs from 'dayjs'
  import { Button, Select, Table } from 'svelte-materialify'

  import type { Period } from 'types'

  export let schedule: Period[] = []

  let offsetWidth = 0
  $: smallDisplay = offsetWidth < 570

  /** Schedule formated for user input */
  let scheduleInput: {
    name?: Period['name']
    day: string
    open: string
    close: string
  }[] = []

  const nameItems = [
    { name: 'Ouvert', value: 'open' },
    { name: 'Dépot', value: 'deposit' },
    { name: 'Vente', value: 'sale' },
    { name: 'Récupération', value: 'recovery' },
    { name: '❌ Supprimer', value: 'delete' },
  ]

  if (!schedule.length) onMount(addPeriod)

  /** Schedule conversion */
  function scheduleToScheduleInput() {
    scheduleInput = schedule.map((s) => {
      return {
        day: dayjs(s.open).format('YYYY-MM-DD'),
        open: dayjs(s.open).format('HH:mm'),
        close: dayjs(s.close).format('HH:mm'),
      }
    })
  }

  function sheduleInputToSchedule() {
    schedule = scheduleInput.map((s) => {
      if (s.day && s.open && s.close) {
        let dayForSafari = dayjs(s.day).format('YYYY/MM/DD')
        return {
          open: new Date(`${dayForSafari} ${s.open}`).toISOString(),
          close: new Date(`${dayForSafari} ${s.close}`).toISOString(),
        }
      }
    })
  }

  function addPeriod(event: Event = null) {
    event?.preventDefault()

    if (scheduleInput.length == 0) {
      scheduleInput = [
        ...scheduleInput,
        {
          day: dayjs().add(7, 'day').format('YYYY-MM-DD'),
          open: dayjs().hour(8).minute(0).format('HH:mm'),
          close: dayjs().hour(18).minute(0).format('HH:mm'),
        },
      ]
    } else {
      let lastPeriod = scheduleInput[scheduleInput.length - 1]
      scheduleInput = [
        ...scheduleInput,
        {
          day: dayjs(lastPeriod.day).add(1, 'day').format('YYYY-MM-DD'),
          open: lastPeriod.open,
          close: lastPeriod.close,
        },
      ]
    }
    sheduleInputToSchedule()
    return
  }

  function removeSchedule(index: number) {
    scheduleInput.splice(index, 1)
    scheduleInput = scheduleInput
    sheduleInputToSchedule()
  }
</script>

<div bind:offsetWidth>
  {#if smallDisplay}
    <div>
      {#each scheduleInput as { name, day, open, close }, i}
        <div class="simple-card">
          <Select bind:value={name} solo dense items={nameItems} />

          TODO
        </div>
      {/each}
    </div>
  {:else}
    <Table class="simple-card" style="overflow: visible;">
      <thead>
        <tr>
          <td>Période</td>
          <td>Date</td>
          <td>Début</td>
          <td>Fin</td>
        </tr>
      </thead>
      <tbody>
        {#each scheduleInput as { name, day, open, close }, i}
          <tr>
            <td>
              <Select bind:value={name} solo dense items={nameItems} />
            </td>
            <td>
              <input bind:value={day} type="date" style="width: 120px;" />
            </td>
            <td>
              <input
                bind:value={open}
                max={close}
                on:input={sheduleInputToSchedule}
                type="time"
                style="width: 70px;"
              />
            </td>
            <td>
              <input
                bind:value={close}
                min={open}
                on:input={sheduleInputToSchedule}
                type="time"
                style="width: 70px;"
              />
            </td>
          </tr>
        {/each}
      </tbody>
    </Table>
  {/if}
</div>

<Button on:click={addPeriod} text class="mt-3 mb-3">Ajouter une période</Button>

<br />
<span class="w3-opacity w3-text-orange">
  L'horaire n'est plus modifiable une fois que l'évenement a débuté.
</span>

<style>
  :global(.s-select .s-text-field__wrapper.solo) {
    box-shadow: none;
    min-width: 140px;
  }
</style>
