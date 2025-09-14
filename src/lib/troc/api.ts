import type {
  SubscribeLookup,
  Troc,
  TrocBase,
  TrocLookup,
  Tarif,
} from "$lib/types";
import { api } from "$lib/api";

/** @deprecated */
export function createTroc(trocBase: TrocBase) {
  return api<TrocBase, TrocLookup>("/api/trocs", {
    method: "post",
    data: trocBase,
    success: "Nouveau troc créer",
  });
}

/** @deprecated */
export function updateTroc(troc: Partial<Troc>) {
  return api<Troc, TrocLookup>(`/api/trocs/${troc._id}`, {
    method: "patch",
    data: troc,
    success: "Troc mis à jour",
  });
}

interface TrocUserQuery {
  trocId: string;
  userId: string;
}

/** @deprecated */
export function addAdmin({ trocId, userId }: TrocUserQuery) {
  return api<{ admin: string }, TrocLookup>(
    `/api/trocs/${trocId}/admin/${userId}`,
    {
      method: "post",
      success: "Administrateur ajouté",
    }
  );
}

/** @deprecated */
export function removeAdmin({ trocId, userId }: TrocUserQuery) {
  return api<{ admin: string }, TrocLookup>(
    `/api/trocs/${trocId}/admin/${userId}`,
    {
      method: "delete",
      success: "Administrateur supprimé",
    }
  );
}

/** @deprecated */
export function addCashier({ trocId, userId }: TrocUserQuery) {
  return api<{ cashier: string }, TrocLookup>(
    `/api/trocs/${trocId}/cashier/${userId}`,
    {
      method: "post",
      success: "Caisser ajouté",
    }
  );
}

/** @deprecated */
export function removeCashier({ trocId, userId }: TrocUserQuery) {
  return api<{ cashier: string }, TrocLookup>(
    `/api/trocs/${trocId}/cashier/${userId}`,
    {
      method: "delete",
      success: "Caisser supprimé",
    }
  );
}

/** @deprecated */
export function addTrader({ trocId, userId }: TrocUserQuery) {
  return api<{ trader: string }, TrocLookup>(
    `/api/trocs/${trocId}/trader/${userId}`,
    {
      method: "post",
      success: "Commerçant ajouté",
    }
  );
}

/** @deprecated */
export function removeTrader({ trocId, userId }: TrocUserQuery) {
  return api<{ trader: string }, TrocLookup>(
    `/api/trocs/${trocId}/trader/${userId}`,
    {
      method: "delete",
      success: "Commerçant supprimé",
    }
  );
}

/** @deprecated */
export function setTraderPrefix({
  trocId,
  userId,
  prefix,
}: TrocUserQuery & { prefix: string }) {
  return api<{ prefix: string }, TrocLookup>(
    `/api/trocs/${trocId}/trader/${userId}/prefix`,
    {
      method: "post",
      data: { prefix },
      success: "Préfix mis à jour",
    }
  );
}

interface TrocQuery {
  trocId: string;
}
interface TarifQuery {
  tarifId: string;
}
interface UserQuery {
  userId: string;
}
interface TrocTarifQuery extends TrocQuery, TarifQuery {}
interface TrocTarifUserQuery extends TrocTarifQuery, UserQuery {}

/** @deprecated */
export function createTarif({
  trocId,
  name,
  margin,
  maxarticles,
  fee,
}: TrocQuery & Partial<Tarif>) {
  return api<{}, TrocLookup>(`/api/trocs/${trocId}/tarif`, {
    method: "post",
    data: { name, margin, maxarticles, fee },
    success: "Nouveau tarif créé",
  });
}

/** @deprecated */
export function deleteTarif({ trocId, tarifId }: TrocTarifQuery) {
  return api<{}, TrocLookup>(`/api/trocs/${trocId}/tarif/${tarifId}`, {
    method: "delete",
    success: "Tarif supprimé",
  });
}

/** @deprecated */
export function editTarif({
  trocId,
  tarifId,
  name,
  margin,
  maxarticles,
  fee,
}: TrocTarifQuery & Partial<Tarif>) {
  return api<Partial<Tarif>, TrocLookup>(
    `/api/trocs/${trocId}/tarif/${tarifId}`,
    {
      method: "patch",
      data: { name, margin, maxarticles, fee },
      success: "Tarif mis à jour",
    }
  );
}

/** @deprecated */
export function addApply({ trocId, tarifId, userId }: TrocTarifUserQuery) {
  return api<{}, TrocLookup>(
    `/api/trocs/${trocId}/tarif/${tarifId}/apply/${userId}`,
    {
      method: "post",
    }
  );
}

// Not util ?
/** @deprecated */
export function removeApply({ trocId, tarifId, userId }: TrocTarifUserQuery) {
  return api<{}, TrocLookup>(
    `/api/trocs/${trocId}/tarif/${tarifId}/apply/${userId}`,
    {
      method: "delete",
    }
  );
}
