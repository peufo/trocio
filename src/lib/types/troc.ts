import type { Article } from "$lib/types";
import type { User } from "$lib/types";
import type { IPayment } from "./payment";
import type { ISubscribe } from "./subscribe";

/** Période dont est composé l'horaire */
export type Period = {
  _id?: string;
  name?: "open" | "deposit" | "recovery" | "sale" | "delete";
  open: string;
  close: string;
};

/** Tarif */
export type Tarif = {
  _id?: string;
  name: string;
  bydefault: boolean;
  margin: number;
  apply: { _id: string }[];
  fee: {
    price: number;
    value: number;
  }[];
  maxarticles: number;
};

/** Tag (config étiquettes) */
export type TagInterface = {
  width: number;
  height: number;
  padding: number;
  fontSize: 16;
  border: boolean;
  useTagPrinter: boolean;
  useScanner: boolean;
};

/** Information minimal pour la création d'un troc */
export type TrocBase = {
  name: string;
  description: string;
  is_try: boolean;
  currency: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  schedule?: Period[];
  society: string;
  societyMail: string;
  societyweb?: string;
  societyPhone?: string;
};

/** Information complette d'un troc */
export type Troc = TrocBase & {
  _id: string;
  tag: TagInterface;
  articlelastref: number;
  creator: string | User;
  tarif: Tarif[];
  open: string;
  createdAt: string;
  updatedAt: string;
  __v: 0;
  id: string;
  isAdmin: boolean;
  isCashier: boolean;
  isSubscribed: boolean;
  // Computed from schedule
  isClosed: boolean;
  isOpen: boolean;
};

/** Information complette avec les informations collaborateurs */
export type TrocLookup = Troc & {
  creator: User;
  subscribe: ISubscribe;
};

/** Statistique d'un troc */
export type TrocStats = {
  articlesProposed: Article[];
  articlesBuyed: Article[];
  payments: IPayment[];
};

type ITrocsMapQuery = {
  north?: number;
  east?: number;
  sud?: number;
  west?: number;
};
type ITrocsFilterQuery = {
  search?: string;
  start?: string;
  end?: string;
};

export type SearchTrocsQuery = ITrocsMapQuery &
  ITrocsFilterQuery & {
    _id?: string;
  };
