<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import dayjs from 'dayjs'
  import { Button, Select, Table, TextField } from 'svelte-materialify'

  import type { Period } from 'types'

  export let schedule: Period[] = []

  /** Schedule formated for user input */
  let scheduleInput: {
    name?: Period['name'] | 'delete'
    _id?: string
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

  const dispatch = createEventDispatcher()
  let offsetWidth = 0
  $: smallDisplay = offsetWidth < 570

  onMount(() => {
    if (schedule.length) scheduleToScheduleInput()
    else addPeriod()
  })

  function handleInput() {
    setTimeout(() => {
      // Remove deleted period
      scheduleInput = scheduleInput.filter((period) => period.name !== 'delete')
      sheduleInputToSchedule()
    }, 0)
  }

  /** Schedule conversion */
  function scheduleToScheduleInput() {
    scheduleInput = schedule.map((period) => {
      return {
        name: period.name || 'open',
        _id: period._id,
        day: dayjs(period.open).format('YYYY-MM-DD'),
        open: dayjs(period.open).format('HH:mm'),
        close: dayjs(period.close).format('HH:mm'),
      }
    })
  }

  function sheduleInputToSchedule() {
    schedule = scheduleInput
      .filter(
        (period) =>
          period.day && period.open && period.close && period.name !== 'delete'
      )
      .map((period) => {
        let dayForSafari = dayjs(period.day).format('YYYY/MM/DD')
        return {
          name: period.name,
          _id: period._id,
          open: new Date(`${dayForSafari} ${period.open}`).toISOString(),
          close: new Date(`${dayForSafari} ${period.close}`).toISOString(),
        }
      })
    dispatch('change', { schedule })
  }

  function addPeriod(event: Event = null) {
    event?.preventDefault()
    const lastPeriod = scheduleInput[scheduleInput.length - 1] || undefined
    const newPeriod = {
      day: dayjs(lastPeriod?.day)
        .add(lastPeriod ? 1 : 7, 'day')
        .format('YYYY-MM-DD'),
      open: lastPeriod?.open || dayjs().hour(8).minute(0).format('HH:mm'),
      close: lastPeriod?.close || dayjs().hour(18).minute(0).format('HH:mm'),
    }
    scheduleInput = [...scheduleInput, { name: 'open', ...newPeriod }]
    sheduleInputToSchedule()
  }
</script>

<div bind:offsetWidth>
  {#if smallDisplay}
    <div>
      {#each scheduleInput as { name, day, open, close }, i}
        <div class="simple-card pt-6 mb-2">
          <Select
            bind:value={name}
            on:change={handleInput}
            solo
            items={nameItems}
          >
            Période
          </Select>
          <div class="pa-3 d-flex">
            <TextField type="date" bind:value={day} on:input={handleInput}>
              Jour
            </TextField>
            <TextField
              bind:value={open}
              on:input={handleInput}
              max={close}
              type="time">Début</TextField
            >
            <TextField
              bind:value={close}
              on:input={handleInput}
              min={open}
              type="time">Fin</TextField
            >
          </div>
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
            <td class="pt-2">
              <Select
                bind:value={name}
                solo
                items={nameItems}
                on:change={handleInput}
              />
            </td>
            <td>
              <input
                bind:value={day}
                on:input={handleInput}
                type="date"
                style="width: 120px;"
              />
            </td>
            <td>
              <input
                bind:value={open}
                max={close}
                on:input={handleInput}
                type="time"
                style="width: 70px;"
              />
            </td>
            <td>
              <input
                bind:value={close}
                min={open}
                on:input={handleInput}
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

<style>
  :global(.s-select .s-text-field__wrapper.solo) {
    box-shadow: none;
  }
</style>
