<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import {
    TextField,
    Button,
    CardActions,
    CardText,
    Table,
  } from 'svelte-materialify'

  import ExpansionCard from '$lib/util/ExpansionCard.svelte'
  import SelectUser from '$lib/user/Select.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import { faCubes, faPercent } from '@fortawesome/free-solid-svg-icons'
  import { faTrashAlt } from '@fortawesome/free-regular-svg-icons'

  export let name = ''
  export let apply = []
  export let margin = 0
  export let fee = []
  export let maxarticles = 0
  export let bydefault = false
  const dispatch = createEventDispatcher()

  function removeFee(i) {
    fee.splice(i, 1)
    fee = fee
  }
  function removeApply(i) {
    apply.splice(i, 1)
    dispatch('removeUser')
    apply = apply
  }

  function addFee() {
    let last = fee.length - 1
    if (last === -1) {
      fee = [...fee, { price: 0, value: 0.5 }]
    } else {
      fee = [...fee, { price: fee[last].price + 1, value: fee[last].value + 1 }]
    }
  }

  let pourcent = margin * 100
  //Pas util de calculé à chaque fois
  $: margin = pourcent / 100

  function checkRangePrice(e, i) {
    if (e.target.min && fee[i].price < e.target.min)
      fee[i].price = Number(e.target.min)
    if (e.target.max && fee[i].price > e.target.max)
      fee[i].price = Number(e.target.max)
  }

  function checkRangeValue(e, i) {
    if (e.target.min && fee[i].value < e.target.min)
      fee[i].value = Number(e.target.min)
    if (e.target.max && fee[i].value > e.target.max)
      fee[i].value = Number(e.target.max)
  }

  function remove() {
    if (confirm(`Etes-vous sur de vouloir supprimer le tarif "${name}"`)) {
      dispatch('remove')
    }
  }

  function addApply(e) {
    apply = [...apply, e.detail]
    dispatch('selectUser')
  }

  function handleInputTitle(event: any) {
    console.log('Input title', event.detail)
  }
</script>

<ExpansionCard
  open
  title={name}
  titleEditable={!bydefault}
  on:inputTitle={handleInputTitle}
  subtitle="Attribué {bydefault ? 'par défaut' : 'pour 52 participants'}"
>
  <div class="d-flex align-start">
    <TextField
      type="number"
      min="0"
      max="40"
      placeholder=" "
      hint="Votre part sur les articles vendus"
      bind:value={pourcent}
      style="max-width: 50%;"
      class="mr-2"
    >
      <span slot="append">
        <IconLink icon={faPercent} size="1em" />
      </span>
      Marge
    </TextField>

    <TextField
      type="number"
      min="1"
      max="5000"
      placeholder=" "
      hint="Nombre maximum d'article pouvant être proposé par un participant"
      bind:value={maxarticles}
      style="max-width: 50%;"
      class="ml-2"
    >
      <span slot="append">
        <IconLink icon={faCubes} size="1em" />
      </span>
      Nombre maximum
    </TextField>
  </div>

  <br />

  <div style="width: 400px; margin: auto;">
    <Table class="simple-card">
      <thead>
        <tr>
          <th>A partir du prix</th>
          <th>Les frais sont de</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {#each fee as f, i}
          <tr>
            <td>
              <input
                type="number"
                class="pa-3"
                style="width: 100px;"
                bind:value={f.price}
                on:keyup={(e) => checkRangePrice(e, i)}
                min={i == 0 ? 0 : fee[i - 1].price}
                max={i == fee.length - 1 ? '' : fee[i + 1].price}
              />
            </td>
            <td>
              <input
                type="number"
                class="pa-3"
                style="width: 100px;"
                bind:value={f.value}
                on:keyup={(e) => checkRangeValue(e, i)}
                min={i == 0 ? 0 : fee[i - 1].value}
                max={i == fee.length - 1 ? '' : fee[i + 1].value}
              />
            </td>
            <td>
              <IconLink
                icon={faTrashAlt}
                size=".8em"
                clickable
                opacity
                on:click={() => removeFee(i)}
              />
            </td>
          </tr>
        {/each}
      </tbody>
    </Table>

    <div class="d-flex mt-2">
      <span class="text--secondary text-caption">
        Frais que vous encaisser lors de la validation de l'article d'un
        participant
      </span>
      <div class="flex-grow-1" />
      <Button depressed on:click={addFee}>+1 règle</Button>
    </div>
  </div>

  <br />

  {#if !bydefault || true}
    <CardActions>
      <Button text size="small" class="red-text mr-2" on:click={remove}>
        Supprimer ce tarif
      </Button>
      <div class="flex-grow-1" />
      <Button>Valider la modification</Button>
    </CardActions>
  {/if}
</ExpansionCard>

<style>
</style>
