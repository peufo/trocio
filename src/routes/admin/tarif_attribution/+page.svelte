<script lang="ts">
  import { Ripple } from "$lib/material";
  import MagicTableWrapper from "$lib/util/MagicTableWrapper.svelte";
  import { layout } from "$lib/store/layout";
  import type { SubscribeLookup, ParamsAPI, TrocLookup } from "$lib/types";
  import IconLink from "$lib/util/IconLink.svelte";
  import { api, useInfinitApi } from "$lib/api";
  import SearchTextField from "$lib/util/SearchTextField.svelte";
  import { troc } from "$lib/troc/store";
  import {
    faCheck,
    faEyeSlash,
    faEye,
  } from "@fortawesome/free-solid-svg-icons";
  import notify from "$lib/notify";
  import { param, urlParam } from "$lib/param";
  import { goto } from "$app/navigation";
  import { derived } from "svelte/store";
  import { createMutation } from "@tanstack/svelte-query";

  let searchUserDebounced = "";

  const addApply = createMutation({
    mutationFn: ({
      trocId,
      tarifId,
      userId,
    }: {
      trocId: string;
      tarifId: string;
      userId: string;
    }) =>
      api<{}, TrocLookup>(
        `/api/trocs/${trocId}/tarif/${tarifId}/apply/${userId}`,
        { method: "post" }
      ),
    onSuccess: troc.set,
  });

  $: subscribesQuery = useInfinitApi<
    ParamsAPI & { trocId: string; filtredTarifs: string },
    SubscribeLookup[]
  >([
    "subscribes",
    {
      trocId: $param.get("trocId") || "",
      filtredTarifs: $param.get("filtredTarifs") || "",
      q: searchUserDebounced,
    },
  ]);

  $: subscribes = $subscribesQuery.data
    ? $subscribesQuery.data.pages.flat()
    : [];

  $: tarifByDefaultId = $troc?.tarif.find((tarif) => tarif.bydefault)?._id;
  $: attributed = subscribes.map((subscribe) => {
    const userId = subscribe.user?._id;
    const attribution =
      userId !== undefined &&
      $troc.tarif.find((tarif) =>
        tarif.apply?.map((user) => user._id).includes(userId)
      );
    if (attribution) return attribution._id;
    return tarifByDefaultId;
  });

  const filtredTarifs = derived(
    param,
    ({ get }) => JSON.parse(get("filtredTarifs") || "[]") as string[]
  );

  function handleClickFilter(event: PointerEvent, tarifId: string) {
    event.stopPropagation();
    const index = $filtredTarifs.indexOf(tarifId);
    const newFiltredTarifs =
      index === -1
        ? [...$filtredTarifs, tarifId]
        : [
            ...$filtredTarifs.slice(0, index),
            ...$filtredTarifs.slice(index + 1),
          ];
    if (!newFiltredTarifs.length) {
      goto($urlParam.without("newFiltredTarifs"));
      return;
    }
    goto(
      $urlParam.with({
        filtredTarifs: JSON.stringify(newFiltredTarifs),
      })
    );
  }
</script>

<div class="container">
  <h6 class="mb-5">Attribution des tarifs</h6>

  <MagicTableWrapper
    class="simple-card"
    query={subscribesQuery}
    style="max-height: {$layout.mainHeight - 94}px;"
  >
    <thead>
      <tr>
        <th style="padding-left: 0px; width: 340px;">
          <SearchTextField
            bind:search={searchUserDebounced}
            placeholder="Chercher un participant"
          />
        </th>
        {#each $troc.tarif as tarif}
          <th
            class="clickable"
            style="text-align: center;"
            on:click={() => {
              goto(
                `/admin/tarif_edition${$param.with({ tarif_selected: tarif._id })}`
              );
            }}
          >
            {tarif.name}
            <IconLink
              icon={tarif._id && $filtredTarifs.includes(tarif._id)
                ? faEyeSlash
                : faEye}
              size=".8em"
              class={tarif._id && $filtredTarifs.includes(tarif._id)
                ? "primary-text"
                : ""}
              clickable
              on:click={(event) => handleClickFilter(event, tarif._id || "")}
            />
          </th>
        {/each}
      </tr>
    </thead>

    <tbody>
      {#each subscribes as subscribe, subscribeIndex (subscribe._id)}
        <tr class="row">
          <td>
            {subscribe.user?.name}
            <br />
            <span class="text-caption text--disabled">
              {subscribe.user?.mail}
            </span>
          </td>

          {#each $troc.tarif as tarif (tarif._id)}
            <td
              class="clickable"
              style="text-align: center;"
              use:Ripple={{ centered: true }}
              on:click={() =>
                $addApply.mutate(
                  {
                    trocId: $troc._id,
                    tarifId: tarif._id || "",
                    userId: subscribe.user?._id || "",
                  },
                  {
                    onSuccess: () => {
                      notify.success(
                        `${tarif.name} attribué à ${subscribe.user?.name}`
                      );
                    },
                  }
                )}
            >
              {#if tarif._id === attributed[subscribeIndex]}
                <IconLink icon={faCheck} />
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </MagicTableWrapper>
</div>

<style>
  .container {
    max-width: 1400px;
    margin: auto;
  }

  .row:hover {
    background: var(--theme-tables-active);
  }
  .clickable:hover {
    background: var(--theme-tables-hover);
  }
</style>
