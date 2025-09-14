import type { Article, IPayment, TrocStats } from "$lib/types";

export type ArticleState = "createdAt" | "valided" | "sold" | "recover";

export interface TrocEvent {
  pay?: IPayment;
  art?: Article;
  event: "payment" | "buyed" | ArticleState;
  date: Date;
  time: number;
}

export interface StatsPropertiesNumber {
  proposed: number;
  provided: number;
  solded: number;
  recovered: number;
  buyed: number;
  payment: number;
  paymentPositif: number;
  paymentNegatif: number;
}

export interface StatsPropertiesSum extends StatsPropertiesNumber {
  fee: number;
  margin: number;
}

export interface TrocStatsFormatted {
  payments: IPayment[];
  articlesProposed: Article[];
  articlesProvided: Article[];
  articlesSolded: Article[];
  articlesRecovered: Article[];
  articlesBuyed: Article[];
  events: TrocEvent[];
  numbers: StatsPropertiesNumber;
  sums: StatsPropertiesSum;
}

/** Formate les states  */
export function formatStats(statsBrut: TrocStats): TrocStatsFormatted {
  const { articlesProposed, articlesBuyed, payments } = statsBrut;
  const articlesProvided = articlesProposed.filter((art) => art.valided);
  const articlesSolded = articlesProvided.filter((art) => art.sold);
  const articlesRecovered = articlesProvided.filter((art) => art.recover);

  const numbers: StatsPropertiesNumber = {
    proposed: articlesProposed.filter((art) => !art.valided).length,
    provided: articlesProvided.length,
    solded: articlesSolded.length,
    recovered: articlesRecovered.length,
    buyed: articlesBuyed.length,
    payment: payments.length,
    paymentPositif: payments.filter((pay) => pay.amount > 0).length,
    paymentNegatif: payments.filter((pay) => pay.amount < 0).length,
  };

  const sums: StatsPropertiesSum = {
    proposed: sumOf(
      articlesProposed.filter((art) => !art.valided),
      "price"
    ),
    provided: sumOf(articlesProvided, "price"),
    solded: sumOf(articlesSolded, "price"),
    recovered: sumOf(articlesRecovered, "price"),
    buyed: sumOf(articlesBuyed, "price"),
    fee: sumOf(articlesProvided, "fee"),
    margin: sumOf(articlesSolded, "margin"),
    payment: sumOf(payments.map((pay) => Math.abs(pay.amount))),
    paymentPositif: sumOf(
      payments.map((pay) => pay.amount).filter((p) => p > 0)
    ),
    paymentNegatif: -sumOf(
      payments.map((pay) => pay.amount).filter((p) => p < 0)
    ),
  };

  const events: TrocEvent[] = getEvents({
    payments,
    articlesProposed,
    articlesBuyed,
  });

  return {
    payments,
    articlesBuyed,
    articlesProposed,
    articlesProvided,
    articlesRecovered,
    articlesSolded,
    numbers,
    sums,
    events,
  };
}

function sumOf(arr: any[], key?: string): number {
  if (!arr.length) return 0;
  if (!key) return arr.reduce((acc, cur) => acc + cur) || 0;
  return arr.map((item) => item[key]).reduce((acc, cur) => acc + cur) || 0;
}

function getEvents({
  payments,
  articlesProposed,
  articlesBuyed,
}: {
  payments: IPayment[];
  articlesProposed: Article[];
  articlesBuyed: Article[];
}): TrocEvent[] {
  // payments
  const paymentsEvents: TrocEvent[] = payments.map((p) => {
    return {
      pay: p,
      event: "payment",
      date: p.createdAt,
      time: new Date(p.createdAt).getTime(),
    };
  });

  // Provider events
  let articlesEvents: TrocEvent[] = [];
  const trocEventToCapture: ArticleState[] = [
    "createdAt",
    "valided",
    "sold",
    "recover",
  ];
  trocEventToCapture.forEach((capturedEvent) => {
    articlesEvents = [
      ...articlesEvents,
      ...articlesProposed
        .filter((art) => art[capturedEvent])
        .map((art) => {
          const date = new Date(art[capturedEvent] as Date);
          return {
            art,
            event: capturedEvent,
            date,
            time: date.getTime(),
          };
        }),
    ];
  });

  // Buyer events
  const articlesBuyedEvents: TrocEvent[] = articlesBuyed.map((art) => {
    const date = new Date(art.sold!);
    return {
      art,
      event: "buyed",
      date,
      time: date.getTime(),
    };
  });

  return [...paymentsEvents, ...articlesEvents, ...articlesBuyedEvents].sort(
    (a, b) => a.time - b.time
  );
}
