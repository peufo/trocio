<script lang="ts">
  import { List, ListItem, Avatar } from "$lib/material";
  import {
    faSpinner,
    faTimes,
    faUser,
  } from "@fortawesome/free-solid-svg-icons";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";

  import { api, useApi } from "$lib/api";
  import { troc } from "$lib/troc/store";
  import { user } from "$lib/user/store";
  import IconLink from "$lib/util/IconLink.svelte";
  import ExpansionCard from "$lib/util/ExpansionCard.svelte";
  import Loader from "$lib/util/Loader.svelte";
  import Share from "$lib/troc/Share.svelte";
  import type {
    SubscribeLookup,
    RoleEnum,
    ParamsSubscribeAPI,
    ISubscribe,
  } from "$lib/types";
  import { useInfinitApi } from "$lib/api";
  import SubscribeMenu from "$lib/user/SubscribeMenu.svelte";

  import MagicSelect from "$lib/util/MagicSelect.svelte";
  import { param } from "$lib/param";

  let open = [false, false, false, false];
  const queryClient = useQueryClient();
  let subscribeMenu: SubscribeMenu;

  /**
   * Getters
   */
  let searchSubscribes = "";
  let searchAdmins = "";
  let searchCashiers = "";
  let searchTraders = "";
  $: queryAdminsCount = useApi<ParamsSubscribeAPI, number>([
    "subscribes/count",
    { exact_trocId: $param.get("trocId") || "", exact_role: "admin" },
  ]);
  $: queryAdmins = useInfinitApi<ParamsSubscribeAPI, SubscribeLookup>([
    "subscribes",
    {
      exact_trocId: $param.get("trocId") || "",
      q: searchAdmins,
      exact_role: "admin",
    },
  ]);
  $: queryCashiersCount = useApi<ParamsSubscribeAPI, number>([
    "subscribes/count",
    { exact_trocId: $param.get("trocId") || "", exact_role: "cashier" },
  ]);
  $: queryCashiers = useInfinitApi<ParamsSubscribeAPI, SubscribeLookup>([
    "subscribes",
    {
      exact_trocId: $param.get("trocId") || "",
      q: searchCashiers,
      exact_role: "cashier",
    },
  ]);
  $: queryTradersCount = useApi<ParamsSubscribeAPI, number>([
    "subscribes/count",
    { exact_trocId: $param.get("trocId") || "", exact_role: "trader" },
  ]);
  $: queryTraders = useInfinitApi<ParamsSubscribeAPI, SubscribeLookup>([
    "subscribes",
    {
      exact_trocId: $param.get("trocId") || "",
      q: searchTraders,
      exact_role: "trader",
    },
  ]);
  $: querySubscribesCount = useApi<ParamsSubscribeAPI, number>([
    "subscribes/count",
    { exact_trocId: $param.get("trocId") || "", exact_role: "basic" },
  ]);
  $: querySubscribes = useInfinitApi<ParamsSubscribeAPI, SubscribeLookup>([
    "subscribes",
    {
      exact_trocId: $param.get("trocId") || "",
      q: searchSubscribes,
      exact_role: "basic",
    },
  ]);

  interface AssignRoleBody {
    subscribeId: string;
    role: RoleEnum;
  }
  interface CreateSubscribeBody {
    userId: string;
    trocId: string;
    role?: RoleEnum;
  }

  function invalidateSubscribes() {
    queryClient.invalidateQueries({ queryKey: ["subscribes"] });
    queryClient.invalidateQueries({ queryKey: ["subscribes/count"] });
  }

  const assignRole = createMutation({
    mutationFn: (data: AssignRoleBody) =>
      api<AssignRoleBody, SubscribeLookup>("/api/subscribes/role", {
        method: "post",
        data,
        success: data.role === "basic" ? "Rôle retiré" : `Rôle attribué`,
      }),
    onSuccess: invalidateSubscribes,
  });

  const createSubscribe = createMutation({
    mutationFn: (data: CreateSubscribeBody) =>
      api<CreateSubscribeBody, ISubscribe>("/api/subscribes", {
        method: "post",
        data,
        success: "Nouvelle participation créée",
      }),
    onSuccess: invalidateSubscribes,
  });

  function assignRoleHandler(role: RoleEnum) {
    return (event: any | string) => {
      if ($assignRole.isPending) return;
      if (typeof event === "string") {
        $assignRole.mutate({
          subscribeId: event,
          role,
        });
      } else if (event.detail._id) {
        $assignRole.mutate({
          subscribeId: event?.detail?._id,
          role,
        });
      } else {
        $createSubscribe.mutate({
          trocId: $param.get("trocId") || "",
          userId: event.detail.userId,
          role,
        });
      }
    };
  }

  function handleClick(event: MouseEvent, subscribe: SubscribeLookup) {
    subscribeMenu.open(event, subscribe);
  }

  function handleOpenCard(index: number) {
    open = open.map((o, i) => i === index);
  }

  const magicSelectProps = {
    path: "/subscribes",
    searchKey: "q",
    queryParams: { exact_trocId: $troc._id },
    getValue: (sub: SubscribeLookup) => sub.user?.name || sub.name,
    getValue2: (sub: SubscribeLookup) => sub.user?.mail || "",
    getKey: (sub: SubscribeLookup) => sub._id || "",
    solo: true,
    icon: faUser,
  };

  const magicSelectPropsWithGlobalUser = {
    ...magicSelectProps,
    queryParams: { exact_trocId: $troc._id, includGlobalUser: true },
  };
</script>

<SubscribeMenu bind:this={subscribeMenu} />

<div style="max-width: 700px; margin: auto;">
  <h6 class="mb-5">Gestion des collaborateurs</h6>

  <!-- Administrateurs -->
  <ExpansionCard
    title="{$queryAdminsCount.data} Administrateur{($queryAdminsCount.data ||
      0) > 1
      ? 's'
      : ''}"
    class="mb-3"
    open={open[0]}
    on:open={() => handleOpenCard(0)}
    hasSearchInput
    bind:searchValueDebounced={searchAdmins}
    query={$queryAdmins}
  >
    <List>
      {#each $queryAdmins.data?.pages.flat() || [] as subscribe}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          role="button"
          tabindex="0"
          on:click={(event) => handleClick(event, subscribe)}
        >
          <ListItem>
            <span>{subscribe.user?.name || subscribe.name}</span>
            <span slot="subtitle">{subscribe.user?.mail || ""}</span>
            <div
              slot="append"
              class="remove-icon"
              role="button"
              tabindex="0"
              on:click|stopPropagation={() =>
                assignRoleHandler("basic")(subscribe._id)}
            >
              {#if subscribe.user?._id !== $troc.creator._id && subscribe.user?._id !== $user._id}
                <IconLink
                  icon={$assignRole.isPending ? faSpinner : faTimes}
                  disabled={$assignRole.isPending}
                  spin={$assignRole.isPending}
                  opacity
                />
              {/if}
            </div>
          </ListItem>
        </div>
      {/each}
    </List>

    <div class="pa-4">
      {#if $assignRole.isPending || $createSubscribe.isPending}
        <Loader title="Ajout en cours" />
      {:else}
        <MagicSelect
          placeholder="Nouvel administrateur"
          on:select={assignRoleHandler("admin")}
          {...magicSelectProps}
        />
      {/if}
    </div>
  </ExpansionCard>

  <!-- Caissier -->
  <ExpansionCard
    title="{$queryCashiersCount.data} Caissier{$queryCashiersCount.data || 0 > 1
      ? 's'
      : ''}"
    open={open[1]}
    class="mb-3"
    on:open={() => handleOpenCard(1)}
    hasSearchInput
    bind:searchValueDebounced={searchCashiers}
    query={$queryCashiers}
  >
    <List>
      {#each $queryCashiers.data?.pages.flat() || [] as subscribe}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          role="button"
          tabindex="0"
          on:click={(event) => handleClick(event, subscribe)}
        >
          <ListItem>
            <span>{subscribe.user?.name || subscribe.name}</span>
            <span slot="subtitle">{subscribe.user?.mail || ""}</span>
            <div
              class="remove-icon"
              slot="append"
              role="button"
              tabindex="0"
              on:click|stopPropagation={() =>
                assignRoleHandler("basic")(subscribe._id)}
            >
              <IconLink
                icon={$assignRole.isPending ? faSpinner : faTimes}
                disabled={$assignRole.isPending}
                spin={$assignRole.isPending}
                opacity
              />
            </div>
          </ListItem>
        </div>
      {/each}
    </List>

    <div class="pa-4">
      {#if $assignRole.isPending || $createSubscribe.isPending}
        <Loader title="Ajout en cours" />
      {:else}
        <MagicSelect
          placeholder="Nouveau caissier"
          on:select={assignRoleHandler("cashier")}
          {...magicSelectProps}
        />
      {/if}
    </div>
  </ExpansionCard>

  <!-- Commercant -->
  <ExpansionCard
    title="{$queryTradersCount.data} Commerçant{$queryTradersCount.data || 0 > 1
      ? 's'
      : ''}"
    open={open[2]}
    class="mb-3"
    on:open={() => handleOpenCard(2)}
    hasSearchInput
    bind:searchValue={searchTraders}
    query={$queryTraders}
  >
    <List>
      {#each $queryTraders.data?.pages.flat() || [] as subscribe}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          role="button"
          tabindex="0"
          on:click={(event) => handleClick(event, subscribe)}
        >
          <ListItem>
            <div slot="prepend" role="button" tabindex="0">
              <Avatar class="secondary-color">
                {subscribe.prefix}
              </Avatar>
            </div>

            {subscribe.user?.name || subscribe.name}

            <span slot="subtitle">{subscribe.user?.mail || ""}</span>

            <div
              role="button"
              tabindex="0"
              class="remove-icon"
              slot="append"
              on:click|stopPropagation={() =>
                assignRoleHandler("basic")(subscribe._id)}
            >
              <IconLink
                icon={$assignRole.isPending ? faSpinner : faTimes}
                disabled={$assignRole.isPending}
                spin={$assignRole.isPending}
                opacity
              />
            </div>
          </ListItem>
        </div>
      {/each}
    </List>

    <div class="pa-4">
      {#if $assignRole.isPending || $createSubscribe.isPending}
        <Loader title="Ajout en cours" />
      {:else}
        <MagicSelect
          placeholder="Nouveau commerçant"
          on:select={assignRoleHandler("trader")}
          {...magicSelectProps}
        />
      {/if}
    </div>
  </ExpansionCard>

  <!-- Participants -->
  <ExpansionCard
    title="{$querySubscribesCount.data} Participant{$querySubscribesCount.data ||
    0 > 1
      ? 's'
      : ''}"
    open={open[3]}
    class="mb-3"
    on:open={() => handleOpenCard(3)}
    hasSearchInput
    bind:searchValueDebounced={searchSubscribes}
    query={$querySubscribes}
  >
    <List>
      {#each $querySubscribes.data?.pages.flat() || [] as subscribe}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          role="button"
          tabindex="0"
          on:click={(event) => handleClick(event, subscribe)}
        >
          <ListItem>
            {subscribe.user?.name || subscribe.name}
            <span slot="subtitle">{subscribe.user?.mail || ""}</span>
          </ListItem>
        </div>
      {/each}
    </List>

    <div class="pa-4">
      {#if $assignRole.isPending || $createSubscribe.isPending}
        <Loader title="Ajout en cours" />
      {:else}
        <MagicSelect
          placeholder="Inviter un nouveau particiant"
          on:select={assignRoleHandler("basic")}
          {...magicSelectPropsWithGlobalUser}
        />
      {/if}
    </div>
  </ExpansionCard>

  <div class="d-flex">
    <div class="flex-grow-1"></div>
    <Share troc={$troc} label="Partager le troc" />
  </div>
</div>

<style>
  :global(.s-list-item:hover .remove-icon) {
    transform: translateX(0);
    transition-delay: 250ms;
  }

  .remove-icon {
    transform: translateX(50px);
    transition: transform 200ms;
  }
</style>
