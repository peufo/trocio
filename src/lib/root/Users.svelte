<script lang="ts">
  import { useQueryClient } from "@tanstack/svelte-query";
  import { mdiMail, mdiPlus } from "@mdi/js";

  import notify from "$lib/notify";
  import { useInfinitApi, api } from "$lib/api";
  import { onMount } from "svelte";
  import MagicTable from "$lib/util/MagicTable.svelte";
  import { layout } from "$lib/store/layout";
  import type { DynamicQuery, User, UserWithRootInfo } from "$lib/types";
  import { fieldsUser } from "$lib/root/fieldsUser";
  import { Icon, List, ListItem } from "$lib/material";
  import logo from "$lib/assets/logo";

  let searchValue = "";
  let queryParams = {};
  $: query = useInfinitApi<DynamicQuery<User>, UserWithRootInfo>([
    "root/users",
    {
      or_search_name: searchValue,
      or_search_mail: searchValue,
      ...queryParams,
    },
  ]);

  let userCount = 0;
  onMount(async () => {
    userCount = await api<number>("/api/root/users/count");
  });

  const queryClient = useQueryClient();

  async function addCredit(user: UserWithRootInfo) {
    try {
      if (!confirm(`Etes-vous sur d'accorder un crédit à ${user.name}`)) return;
      const res = await fetch(`/api/root/addcredit`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: user?._id }),
      });
      const json = await res.json();
      if (json.error) return notify.error(json.message);
      queryClient.invalidateQueries({ queryKey: ["root/users"] });
      return notify.success(json.message);
    } catch (error) {
      console.trace(error);
    }
  }
</script>

<div class="pa-4">
  <MagicTable
    {query}
    fields={fieldsUser}
    bind:queryParams
    bind:searchValue
    wrapperStyle="max-height: {$layout.mainHeight - 76}px;"
  >
    <h6 slot="title">Users ({userCount})</h6>

    <div slot="menu" let:item let:menu>
      <List dense>
        <ListItem href="/root/trocs?exact_creator={item._id}">
          <Icon {...logo} class="mr-2" />
          Vers les trocs
        </ListItem>
        <ListItem href="mailto:{item.mail}">
          <Icon path={mdiMail} class="mr-2" />
          Contacter
        </ListItem>
        <ListItem
          on:click={() => {
            addCredit(item);
            menu.close();
          }}
        >
          <Icon path={mdiPlus} class="mr-2" />
          Ajouter un crédit
        </ListItem>
      </List>
    </div>
  </MagicTable>
</div>
