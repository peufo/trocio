<script lang="ts">
  import { onMount } from "svelte";
  import { Card, CardTitle, Button } from "$lib/material";
  import { faUsers } from "@fortawesome/free-solid-svg-icons";

  import type { ISubscribe, DynamicQuery } from "$lib/types";
  import IconLink from "$lib/util/IconLink.svelte";
  import { ROLES } from "$lib/user/roles";
  import { api } from "$lib/api";
  import { param } from "$lib/param";

  export let trocId: string;

  let counts = ROLES.map(() => 0);
  let countGuest = 0;
  let total = 0;

  onMount(async () => {
    counts = await Promise.all(
      ROLES.map((role) =>
        api<DynamicQuery<ISubscribe>, number>("/api/subscribes/count", {
          params: {
            exact_trocId: trocId,
            exact_role: role.value,
          },
        })
      )
    );
    countGuest = await api<DynamicQuery<ISubscribe>, number>(
      "/api/subscribes/count",
      {
        params: {
          exact_trocId: trocId,
          exact_validedByUser: false,
        },
      }
    );

    total = counts.reduce((acc, cur) => (acc += cur));
  });
</script>

<!-- Participants  -->
<Card>
  <CardTitle class="mr-4">
    <Button
      href="/admin/management_users{$param.withOnly({ trocId })}"
      title="Acceder à la caisse"
      depressed
    >
      <IconLink icon={faUsers} class="mr-4" opacity />
      Participation{total > 1 ? "s" : ""}
    </Button>

    <div class="flex-grow-1"></div>
    {total}
  </CardTitle>

  <div class="pa-4 d-flex flex-column" style="gap: 0.5em;">
    {#each ROLES as role, index (role.value)}
      <Button
        depressed
        style="width: 100%;"
        href="/admin/management_users{$param.withOnly({
          trocId,
          exact_role: role.value,
        })}"
      >
        {#if role.icon}
          <IconLink icon={role.icon} opacity class="mr-2" size="1.2em" />
        {/if}
        {role.label}{counts[index] > 1 ? "s" : ""}
        <div class="flex-grow-1"></div>
        {counts[index]}
      </Button>
    {/each}

    {#if countGuest}
      <Button
        text
        class="mb-2 "
        size="x-small"
        title={`${countGuest} utilsateurs n'ont pas validées leur participation`}
        href="/admin/management_users{$param.withOnly({
          trocId,
          exact_validedByUser: false,
        })}"
      >
        dont
        {countGuest}
        participation{countGuest > 1 ? "s" : ""}
        non validée{countGuest > 1 ? "s" : ""}
      </Button>
    {/if}
  </div>
</Card>
