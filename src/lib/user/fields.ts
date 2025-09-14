import type { TrocLookup, SubscribeResum } from "$lib/types";
import type { FieldInteface } from "types/magic";
import { ROLES } from "$lib/user/roles";

export function getFields(troc: TrocLookup): FieldInteface<SubscribeResum>[] {
  return [
    {
      label: "Nom",
      disabled: true,
      key: "user.name",
      cellWidth: 50,
      getValue: (item) => item.user?.name || item.name,
    },
    {
      label: "Mail",
      disabled: true,
      key: "user.mail",
      cellWidth: 50,
    },
    {
      label: "Rôle",
      key: "role",
      type: "select",
      getValue: (sub) =>
        sub.userId ? ROLES.find((r) => r.value === sub.role)?.label : "",
      options: [{ value: null, label: "Tous" }, ...ROLES],
    },
    {
      label: `Validé par l'utilisateur`,
      hidden: true,
      key: "validedByUser",
      type: "boolean",
      cellWidth: 50,
    },
    {
      label: "Tarif",
      key: "tarifId",
      type: "select",
      getValue: (sub) =>
        troc?.tarif.find((tarif) => tarif._id === sub.tarifId)?.name,
      options: [
        { value: null, label: "Tous" },
        ...troc?.tarif.map((tarif) => ({
          label: tarif.name,
          value: tarif._id!,
        })),
      ],
    },
    {
      label: "Solde",
      key: "resum.balance",
      type: "currency",
    },
    {
      label: "Frais",
      key: "resum.feeSum",
      type: "currency",
    },
    {
      label: "Marge",
      key: "resum.marginSum",
      type: "currency",
    },
    {
      label: `Nombre d'achats`,
      key: "resum.purchasesCount",
      type: "number",
    },
    {
      label: "Somme des achats",
      hidden: true,
      key: "resum.purchasesSum",
      type: "currency",
    },
    {
      label: "Nombre de paiements",
      hidden: true,
      key: "resum.paymentsCount",
      type: "number",
    },
    {
      label: "Somme des paiements",
      hidden: true,
      key: "resum.paymentsSum",
      type: "currency",
    },
    {
      label: `Nombre d'articles`,
      hidden: true,
      key: "resum.articleCount",
      type: "number",
    },
    {
      label: `Nombre d'articles proposés`,
      hidden: true,
      key: "resum.proposedCount",
      type: "number",
    },
    {
      label: "Somme des articles proposés",
      hidden: true,
      key: "resum.proposedSum",
      type: "currency",
    },
    {
      label: `Nombre d'articles en ventes`,
      key: "resum.validedCount",
      type: "number",
    },
    {
      label: "Somme des articles en ventes",
      hidden: true,
      key: "resum.validedSum",
      type: "currency",
    },
    {
      label: "Nombre de ventes",
      hidden: true,
      key: "resum.soldCount",
      type: "number",
    },
    {
      label: "Somme des ventes",
      hidden: true,
      key: "resum.soldSum",
      type: "currency",
    },
  ];
}
