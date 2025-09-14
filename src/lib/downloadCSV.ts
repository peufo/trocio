import { api } from "$lib/api";
import notify from "$lib/notify";
import { getState } from "$lib/utils";
import { getFields } from "$lib/user/fields";
import type { TrocLookup } from "$lib/types";
import objectPath from "object-path";
import type { FieldInteface } from "types/magic";

export default {
  proposed,
  purchases,
  payments,
  subscribes,
};

export async function proposed(subscribeId: string) {
  try {
    const articles = await api("/api/articles", {
      params: {
        exact_providerSubId: subscribeId,
        limit: 10_000,
      },
    });
    articles.forEach((art) => (art.status = getState(art)));

    downloadFile("Trocio-articles-proposed.txt", arrToCSV(articles));
    notify.success("Fichier téléchargé");
  } catch (error) {
    notify.error(error);
  }
}

export async function purchases(subscribeId: string) {
  try {
    const articles = await api("/api/articles", {
      params: {
        exact_buyerSubId: subscribeId,
        limit: 10_000,
      },
    });
    downloadFile("Trocio-articles-purchases.txt", arrToCSV(articles));
    notify.success("Fichier téléchargé");
  } catch (error) {
    notify.error(error);
  }
}

export async function payments(subscribeId: string) {
  try {
    const payments = await api("/api/payments", {
      params: { subscribeId, limit: 10_000 },
    });
    downloadFile("Trocio-payments.txt", arrToCSV(payments));
    notify.success("Fichier téléchargé");
  } catch (error) {
    notify.error(error);
  }
}

export async function subscribes(troc: TrocLookup) {
  try {
    const subscribes = await api("/api/subscribes", {
      params: { trocId: troc._id, limit: 10_000, includResum: true },
    });

    const fields = getFields(troc);
    function getValue(item: any, field: FieldInteface): string | number {
      if (typeof field.getValue === "function") return field.getValue(item);
      const value = objectPath.get(item, field.key);
      return typeof value === "number" ? value.toLocaleString() : value;
    }
    const headers = fields.map((field) => field.label).join("\t");
    const rows = subscribes.map((sub) =>
      fields.map((field) => getValue(sub, field)).join("\t")
    );

    downloadFile("Trocio-subscribes.txt", [headers, ...rows].join("\r\n"));
    notify.success("Fichier téléchargé");
  } catch (error) {
    notify.error(error);
  }
}

function downloadFile(title: string, content: string) {
  const blob = new Blob([content], { type: "application/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = title;
  document.body.append(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function arrToCSV(arr: object[]): string {
  const ignoreKeys = [/_id/, /__v/, /Id$/, /Sub$/, /giveback/];

  const keys = new Set<string>();
  for (const item of arr) {
    for (const key in item) {
      keys.add(key);
    }
  }

  let _keys = [...keys.values()];
  _keys.forEach((key) => {
    for (const ignoreKey of ignoreKeys) {
      if (key.match(ignoreKey)) keys.delete(key);
    }
  });

  const lines: string[] = [[...keys.values()].join("\t")];
  for (const item of arr) {
    const cells: string[] = [];
    keys.forEach((key) => {
      const value = item[key] || "";
      if (typeof value === "string") cells.push(value.replace("\n", " "));
      else if (typeof value === "number") cells.push(value.toString());
      else if (typeof value === "object") cells.push(value.name as string);
    });
    lines.push(cells.join("\t"));
  }
  return lines.join("\n");
}
