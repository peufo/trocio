import { writable } from "svelte/store";
import type L from "leaflet";
import { createMutation } from "@tanstack/svelte-query";

import type {
  SubscribeLookup,
  Troc,
  TrocLookup,
  SearchTrocsQuery,
} from "$lib/types";
import {
  addAdmin,
  removeAdmin,
  addCashier,
  removeCashier,
  addTrader,
  removeTrader,
  setTraderPrefix,
  createTroc,
  updateTroc,
  createTarif,
  deleteTarif,
  editTarif,
  removeApply,
} from "$lib/troc/api";

/**
 * Get troc
 * Info détaillé d'un troc + liste des participants
 */
export const troc = writable<TrocLookup>(undefined);

/**
 * Search Subscribers
 */
interface SearchSubscribersQuery {
  trocId: string;
  q: string;
  filtredTarifs?: string[];
}
export const subscribes = writable<SubscribeLookup[]>([]);

/**
 * Search trocs
 * Liste de trocs selon un recherche
 */

export const queryTrocsParams = writable<SearchTrocsQuery>({});
export const trocs = writable<TrocLookup[]>([]);
export const trocsElement = writable<{ [key: string]: HTMLElement }>({});
export const map = writable<L.Map>();

/**
 * Creation
 * @deprecated
 */
export const useCreateTroc = () =>
  createMutation({ mutationFn: createTroc, onSuccess });

/**
 * Mise à jour
 */

/** @deprecated */
export const useUpdateTroc = () =>
  createMutation({ mutationFn: updateTroc, onSuccess });

/**
 * Collaborators
 */
/** @deprecated */
export const useAddAdmin = () =>
  createMutation({ mutationFn: addAdmin, onSuccess });
/** @deprecated */
export const useRemoveAdmin = () =>
  createMutation({ mutationFn: removeAdmin, onSuccess });
/** @deprecated */
export const useAddCashier = () =>
  createMutation({ mutationFn: addCashier, onSuccess });
/** @deprecated */
export const useRemoveCashier = () =>
  createMutation({ mutationFn: removeCashier, onSuccess });
/** @deprecated */
export const useAddTrader = () =>
  createMutation({ mutationFn: addTrader, onSuccess });
/** @deprecated */
export const useRemoveTrader = () =>
  createMutation({ mutationFn: removeTrader, onSuccess });
/** @deprecated */
export const useSetTraderPrefix = () =>
  createMutation({ mutationFn: setTraderPrefix, onSuccess });

/**
 * Tarif
 */
/** @deprecated */
export const useCreateTarif = () =>
  createMutation({ mutationFn: createTarif, onSuccess });
/** @deprecated */
export const useEditTarif = () =>
  createMutation({ mutationFn: editTarif, onSuccess });
/** @deprecated */
export const useDeleteTarif = () =>
  createMutation({ mutationFn: deleteTarif, onSuccess });

/** @deprecated */
export const useRemoveApply = () =>
  createMutation({ mutationFn: removeApply, onSuccess });

/**
 * Update troc on success
 */
/** @deprecated */
function onSuccess(newTroc: TrocLookup) {
  troc.set(newTroc);
}
