<script lang="ts">
  import { fade } from 'svelte/transition'
  import {
    TextField,
    Button,
    CardActions,
    CardText,
    Table,
  } from 'svelte-materialify'

  import type { Tarif } from 'types'

  import { troc, useDeleteTarif, useEditTarif } from '$lib/troc/store'

  import ExpansionCard from '$lib/util/ExpansionCard.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import { faCubes, faPercent } from '@fortawesome/free-solid-svg-icons'
  import { faTrashAlt } from '@fortawesome/free-regular-svg-icons'
  import notify from '$lib/notify'

  let klass = ''
  export { klass as class }

  export let open = false
  export let tarif: Tarif
  const queryDeleteTarif = useDeleteTarif()
  const queryEditTarif = useEditTarif()

  // la copie tarif
  let _tarif: Tarif = getClone()
  $: isModified = JSON.stringify(tarif) !== JSON.stringify(_tarif)

  function getClone(): Tarif {
    return {
      ...tarif,
      fee: [...tarif.fee.map((fee) => ({ ...fee }))],
    }
  }

  function handleDeleteTarif() {
    if (tarif.bydefault)
      return notify.warning('Le tarif par défaut ne peut pas être supprimé')
    if (!confirm(`Etes-vous sur de vouloir supprimer le tarif "${tarif.name}"`))
      return
    $queryDeleteTarif.mutate({ trocId: $troc._id, tarifId: tarif._id })
  }

  function handleInputName(event: any) {
    _tarif.name = event.target.value
  }

  function handleChangeTarif(event: any) {
    _tarif.margin = Number(event.target.value) / 100
  }

  function handleChangeMax(event: any) {
    _tarif.maxarticles = parseInt(event.target.value)
  }

  function addFee() {
    let last = _tarif.fee.length - 1
    if (last === -1) {
      _tarif.fee = [..._tarif.fee, { price: 0, value: 0.5 }]
    } else {
      _tarif.fee = [
        ..._tarif.fee,
        {
          price: _tarif.fee[last].price + 1,
          value: _tarif.fee[last].value + 1,
        },
      ]
    }
  }

  function removeFee(index: number) {
    _tarif.fee = [..._tarif.fee.slice(0, index), ..._tarif.fee.slice(index + 1)]
  }

  function handleChangeFeePrice(event: any, index: number) {
    _tarif.fee[index].price = +event.target.value
  }
  function handleChangeFeeValue(event: any, index: number) {
    _tarif.fee[index].value = +event.target.value
  }
</script>

<ExpansionCard
  {open}
  on:open
  on:close
  title={_tarif.name}
  titleEditable
  on:input={handleInputName}
  subtitle={`Attribué ${
    _tarif.bydefault ? 'par défaut' : `à ${_tarif.apply?.length} participants`
  }`}
  class={klass}
>
  <div class="pa-4">
    <div class="d-flex align-start">
      <TextField
        type="number"
        value={(_tarif.margin * 100).toFixed(0)}
        on:input={handleChangeTarif}
        min="0"
        max="40"
        placeholder=" "
        hint="Votre part sur les articles vendus"
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
        value={_tarif.maxarticles.toString()}
        on:input={handleChangeMax}
        min="1"
        max="5000"
        placeholder=" "
        hint="Nombre maximum d'article pouvant être proposé par un participant"
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
          {#each _tarif.fee as fee, i}
            <tr>
              <td>
                <input
                  value={fee.price}
                  on:input={(event) => handleChangeFeePrice(event, i)}
                  type="number"
                  class="pa-3"
                  style="width: 100px;"
                  min={i == 0 ? 0 : _tarif.fee[i - 1].price}
                  max={i == _tarif.fee.length - 1
                    ? ''
                    : _tarif.fee[i + 1].price}
                />
              </td>
              <td>
                <input
                  value={fee.value}
                  on:input={(event) => handleChangeFeeValue(event, i)}
                  type="number"
                  class="pa-3"
                  style="width: 100px;"
                  min={i == 0 ? 0 : _tarif.fee[i - 1].value}
                  max={i == _tarif.fee.length - 1
                    ? ''
                    : _tarif.fee[i + 1].value}
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
  </div>

  <CardActions>
    {#if !_tarif.bydefault}
      <Button
        disabled={$queryDeleteTarif.isLoading}
        text
        class="red-text mr-2"
        on:click={handleDeleteTarif}
      >
        Supprimer ce tarif
      </Button>
    {/if}
    <div class="flex-grow-1" />
    {#if isModified}
      <div transition:fade|local>
        <Button
          disabled={$queryEditTarif.isLoading}
          class={$queryEditTarif.isLoading ? '' : 'primary-color'}
          on:click={() => {
            $queryEditTarif.mutate(
              {
                trocId: $troc._id,
                tarifId: _tarif._id,
                ..._tarif,
              },
              {
                onSuccess: () => {
                  _tarif = getClone()
                },
              }
            )
          }}
        >
          Valider la modification
        </Button>
      </div>
    {/if}
  </CardActions>
</ExpansionCard>

<style>
</style>
