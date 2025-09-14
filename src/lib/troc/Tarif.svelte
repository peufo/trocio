<script lang="ts">
  import { fade } from "svelte/transition";
  import { TextField, Button, CardActions, Table } from "$lib/material";
  import { faCubes, faPercent } from "@fortawesome/free-solid-svg-icons";
  import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
  import { createMutation } from "@tanstack/svelte-query";

  import type { Tarif, TrocLookup } from "$lib/types";
  import { api, useApi } from "$lib/api";
  import { troc } from "$lib/troc/store";
  import { isMobile } from "$lib/store/layout";
  import ExpansionCard from "$lib/util/ExpansionCard.svelte";
  import IconLink from "$lib/util/IconLink.svelte";
  import notify from "$lib/notify";
  import { urlParam } from "$lib/param";

  let klass = "";
  export { klass as class };
  export let open = false;
  export let tarif: Tarif;
  let margin = tarif.margin * 100;
  let fees = tarif.fee;

  // Copie de tarif
  let _tarif: Tarif = getClone();
  $: isModified = JSON.stringify(tarif) !== JSON.stringify(_tarif);
  $: queryTarifApplyCount = useApi([
    "subscribes/count",
    { exact_trocId: $troc._id, exact_tarifId: _tarif._id },
  ]);

  const queryDeleteTarif = createMutation({
    mutationFn: (data: { trocId: string; tarifId: string }) =>
      api<{}, TrocLookup>("/api/trocs/tarif", {
        method: "delete",
        data,
        success: "Tarif supprimé",
      }),
    onSuccess: troc.set,
  });

  const queryEditTarif = createMutation({
    mutationFn: (data: { trocId: string; tarifId: string } & Partial<Tarif>) =>
      api<Partial<Tarif>, TrocLookup>("/api/trocs/tarif", {
        method: "patch",
        data,
        success: "Tarif mis à jour",
      }),
    onSuccess: troc.set,
  });

  function getClone(): Tarif {
    return {
      ...tarif,
      fee: [...tarif.fee.map((fee) => ({ ...fee }))],
    };
  }

  function handleDeleteTarif() {
    if (tarif.bydefault)
      return notify.warning("Le tarif par défaut ne peut pas être supprimé");
    if (!confirm(`Etes-vous sur de vouloir supprimer le tarif "${tarif.name}"`))
      return;
    $queryDeleteTarif.mutate({ trocId: $troc._id, tarifId: tarif._id || "" });
  }

  type InputEvent = Event & {
    currentTarget: EventTarget & HTMLInputElement;
  };

  function handleInputName(event: Event) {
    _tarif.name = (event as InputEvent).currentTarget.value;
  }

  function handleChangeTarif(event: Event) {
    _tarif.margin =
      Math.round(+(event as InputEvent).currentTarget.value * 1_000) / 100_000;
  }

  function handleChangeMax(event: Event) {
    _tarif.maxarticles = parseInt((event as InputEvent).currentTarget.value);
  }
  function handleChangeFeePrice(event: InputEvent, index: number) {
    _tarif.fee[index].price = +event.currentTarget.value;
    _tarif = { ..._tarif };
  }
  function handleChangeFeeValue(event: InputEvent, index: number) {
    _tarif.fee[index].value = +event.currentTarget.value;
    _tarif = { ..._tarif };
  }

  function addFee() {
    const lastIndex = _tarif.fee.length - 1;
    const nextFee =
      lastIndex === -1
        ? { price: 0, value: 0.5 }
        : {
            price: _tarif.fee[lastIndex].price + 1,
            value: _tarif.fee[lastIndex].value + 1,
          };
    const updatedFees = [..._tarif.fee, nextFee];
    fees = updatedFees;
    _tarif.fee = updatedFees;
  }

  function removeFee(index: number) {
    const updatedFees = [
      ..._tarif.fee.slice(0, index),
      ..._tarif.fee.slice(index + 1),
    ];
    fees = updatedFees;
    _tarif.fee = updatedFees;
  }

  function handleSubmit() {
    $queryEditTarif.mutate(
      {
        trocId: $troc._id,
        tarifId: _tarif._id || "",
        ..._tarif,
      },
      {
        onSuccess: () => {
          _tarif = getClone();
        },
      }
    );
  }
</script>

<ExpansionCard
  {open}
  on:open
  on:close
  title={_tarif.name}
  titleEditable
  on:input={handleInputName}
  on:submit={handleSubmit}
  class={klass}
>
  <div slot="subtitle">
    <a
      href="/admin/management_users?{$urlParam.with({
        exact_tarifId: _tarif._id,
      })}"
    >
      {`Attribué ${
        _tarif.bydefault
          ? "par défaut"
          : `à ${$queryTarifApplyCount.data} participants`
      }`}
    </a>
  </div>

  <form on:submit|preventDefault={handleSubmit}>
    <div class="pa-4">
      <div class="d-flex align-start">
        <TextField
          type="number"
          bind:value={margin}
          on:input={handleChangeTarif}
          min="0"
          max="100"
          step="0.01"
          placeholder=" "
          hint="Votre part sur les articles vendus"
          style="max-width: 50%;"
          class="mr-2"
          rules={[
            (value: number) =>
              value <= 100 || "( doit être égal ou inférieur à 100 )",
          ]}
        >
          <span slot="append">
            <IconLink icon={faPercent} size="1em" />
          </span>
          Marge
        </TextField>

        <TextField
          type="number"
          value={_tarif.maxarticles}
          on:input={handleChangeMax}
          min="1"
          max="5000"
          rules={[
            (value: number) =>
              value <= 5000 || "( doit être égal ou inférieur à 5000 )",
          ]}
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

      <div style="max-width: 400px; margin: auto;">
        <Table class="simple-card">
          <thead>
            <tr>
              <th>À partir de</th>
              <th>{false ? "Frais" : "Les Frais sont de"}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each _tarif.fee as fee, i}
              <tr>
                <td>
                  <input
                    bind:value={fees[i].price}
                    on:input={(event) => handleChangeFeePrice(event, i)}
                    type="number"
                    class="pa-3"
                    style="max-width: {$isMobile ? 80 : 130}px;"
                    step="0.01"
                    min={i === 0 ? 0 : _tarif.fee[i - 1].price}
                    max={i === _tarif.fee.length - 1
                      ? ""
                      : _tarif.fee[i + 1].price}
                  />
                </td>
                <td>
                  <input
                    bind:value={fees[i].value}
                    on:input={(event) => handleChangeFeeValue(event, i)}
                    type="number"
                    class="pa-3"
                    style="max-width: {$isMobile ? 80 : 130}px;"
                    step="0.01"
                    min={i === 0 ? 0 : _tarif.fee[i - 1].value}
                    max={i === _tarif.fee.length - 1
                      ? ""
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
          <div class="flex-grow-1"></div>
          <Button depressed on:click={addFee}>+1 règle</Button>
        </div>
      </div>
    </div>
    <br />

    <CardActions>
      {#if !_tarif.bydefault}
        <Button
          disabled={$queryDeleteTarif.isPending}
          text
          class="red-text mr-2"
          on:click={handleDeleteTarif}
        >
          Supprimer ce tarif
        </Button>
      {/if}
      <div class="flex-grow-1"></div>
      {#if isModified}
        <div transition:fade|local>
          <Button
            disabled={$queryEditTarif.isPending}
            class={$queryEditTarif.isPending ? "" : "primary-color"}
            type="submit"
          >
            Valider
          </Button>
        </div>
      {/if}
    </CardActions>
  </form>
</ExpansionCard>
