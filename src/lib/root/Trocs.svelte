<script lang="ts">
  import { mdiMail, mdiTrashCanOutline } from "@mdi/js";

  import type { DynamicQuery, Troc, TrocLookup } from "$lib/types";
  import { List, ListItem, Icon } from "$lib/material";
  import { useInfinitApi } from "$lib/api";
  import { layout } from "$lib/store/layout";
  import { fieldsTroc } from "$lib/root/fieldsTroc";
  import notify from "$lib/notify";
  import MagicTable from "$lib/util/MagicTable.svelte";
  import logo from "$lib/assets/logo";

  let searchValue = "";
  let queryParams = {};
  $: query = useInfinitApi<DynamicQuery<Troc>, TrocLookup>([
    "root/trocs",
    {
      or_search_name: searchValue,
      or_search__id: searchValue,
      ...queryParams,
    },
  ]);

  async function deleteTroc(troc: Troc) {
    if (prompt(`Tapez "${troc.name}" pour le supprimer`) === troc.name) {
      try {
        let res = await fetch("/api/root/remove-troc", {
          method: "post",
          body: JSON.stringify({ trocId: troc._id }),
          headers: {
            "Content-type": "application/json",
          },
        });
        let json = await res.json();
        if (json.error) throw json.message;
        notify.success(json.message);
      } catch (error: any) {
        notify.error(error);
      }
    } else {
      notify.warning("Nom incorrect");
    }
  }
</script>

<div class="pa-4">
  <MagicTable
    searchColSpan={1}
    {query}
    fields={fieldsTroc}
    bind:queryParams
    bind:searchValue
    wrapperStyle="max-height: {$layout.mainHeight - 76}px;"
  >
    <h6 slot="title">Trocs</h6>

    <div slot="menu" let:item let:menu>
      <List dense>
        <ListItem href="/admin?trocId={item._id}">
          <Icon {...logo} class="mr-2" />
          vers le troc
        </ListItem>
        <ListItem target="_blank" href="mailto:{item.societyMail}">
          <Icon path={mdiMail} class="mr-2" />
          Contacter la société
        </ListItem>
        <ListItem target="_blank" href="mailto:{item.creator.mail}">
          <Icon path={mdiMail} class="mr-2" />
          Contacter le créateur
        </ListItem>

        <ListItem
          class="red-text"
          on:click={() => {
            menu.close();
            deleteTroc(item);
          }}
        >
          <Icon path={mdiTrashCanOutline} class="mr-2" />
          Supprimer le troc
        </ListItem>
      </List>
    </div>
  </MagicTable>
</div>
