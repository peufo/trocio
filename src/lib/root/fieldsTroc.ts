import type { TrocLookup } from "$lib/types";
import type { FieldInteface } from "types/magic";

export const fieldsTroc: FieldInteface<TrocLookup>[] = [
  {
    label: "Nom",
    key: "name",
  },
  { label: "Éssai", key: "is_try", type: "boolean" },
  {
    label: "Création",
    key: "createdAt",
    type: "date",
  },
  {
    label: "Société",
    key: "society",
  },
  {
    label: "Société mail",
    key: "societyMail",
  },
  {
    label: "Société Tel.",
    key: "societyPhone",
  },
  {
    label: "Société site",
    key: "societyweb",
  },
  {
    label: "Créateur",
    key: "creator",
    type: "selectAsync",
    getValue: (item) => `${item.creator.name} - ${item.creator.mail}`,
    selectAsync: {
      path: "root/users",
      searchKey: "or_search_name",
      getKey: (item) => item._id,
      getValue: (item) => item.name,
      getValue2: (item) => item.mail,
    },
  },
];
