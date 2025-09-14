<script lang="ts">
  import { renderAmount } from "$lib/utils";
  import type { SubscribeResum, Article } from "$lib/types";

  export let subscribe: SubscribeResum;
  export let validedArticles: Article[];
  export let soldArticles: Article[];
  export let recoverArticles: Article[];

  const dateFormat = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "2-digit",
    year: "2-digit",
    hour: "numeric",
    minute: "numeric",
  }).format;

  function sumOf(arr: number[]) {
    if (!arr.length) return 0;
    return arr.reduce((acc, cur) => (acc += cur));
  }
</script>

<main style="font-family: monospace;">
  <header>
    <span style="font-size: 2em;">{subscribe.troc.name}</span>
    <span>
      {#if subscribe.troc.society}
        {subscribe.troc.society} -
      {/if}
      {new Date(subscribe.troc.open).toLocaleDateString()}
    </span>
    <br /><br />
    <span class="h2">
      Compte de <b>{subscribe.user?.name || subscribe.name}</b>
    </span>
  </header>

  <br />

  <div style="display: flex;">
    <div>
      <span class="h2">Solde</span>
    </div>
    <div style="flex-grow: 1;"></div>
    <div>
      <span class="h2"
        >{renderAmount(subscribe.resum.balance, subscribe.troc.currency)}</span
      >
    </div>
  </div>

  {#if subscribe.resum.paymentsCount}
    <hr />
    <br />

    <section>
      <span class="h3">{subscribe.resum.paymentsCount} - Paiements</span>
      <br /><br />
      <table style="width: 100%;">
        <thead>
          <tr>
            <th align="left" style="padding: 2px 0px; width: 125px;">
              Date du paiement
            </th>
            <th align="left" style="padding: 2px 8px;">Commentaire</th>
            <th align="left" style="padding: 2px 0px; width: 100px">
              Montant
            </th>
          </tr>
        </thead>

        <tbody>
          {#each subscribe.resum.payments || [] as payment}
            <tr>
              <td style="padding: 2px 0px;">
                {dateFormat(new Date(payment.createdAt || ""))}
              </td>
              <td style="padding: 2px 8px; max-width: 500px;">
                {payment.message || "-"}
              </td>
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(payment.amount, subscribe.troc.currency)}
              </td>
            </tr>
          {/each}
          <tr>
            <td colspan="2"></td>
            <td
              style="padding: 2px 0px; border-top: 1px solid grey; font-size: 1.1em;"
              align="right"
            >
              <b>
                {renderAmount(
                  subscribe.resum.paymentsSum,
                  subscribe.troc.currency
                )}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  {/if}

  {#if subscribe.resum.purchasesCount}
    <br />
    <hr />
    <br />

    <section>
      <span class="h3">{subscribe.resum.purchasesCount} - Achats</span>
      <br /><br />
      <table style="width: 100%;">
        <thead>
          <tr>
            <th align="left" style="padding: 2px 0px; width: 125px;">
              Date de l'achat
            </th>
            <th align="left" style="padding: 2px 8px; width: 70px;">Ref</th>
            <th align="left" style="padding: 2px 8px;">Nom</th>
            <th align="left" style="padding: 2px 0px; width: 100px;">Prix</th>
          </tr>
        </thead>

        <tbody>
          {#each subscribe.resum.purchases || [] as purchase}
            <tr>
              <td style="padding: 2px 0px;">
                {dateFormat(new Date(purchase.sold || ""))}
              </td>
              <td style="padding: 2px 8px;">{purchase.ref}</td>
              <td style="padding: 2px 8px; max-width: 500px;"
                >{purchase.name}</td
              >
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(-purchase.price, subscribe.troc.currency)}
              </td>
            </tr>
          {/each}
          <tr>
            <td colspan="3"></td>
            <td
              style="padding: 2px 0px; border-top: 1px solid grey; font-size: 1.1em;"
              align="right"
            >
              <b>
                {renderAmount(
                  -(subscribe.resum.purchasesSum || 0),
                  subscribe.troc.currency
                )}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  {/if}

  {#if soldArticles.length}
    <br />
    <hr />
    <br />

    <section>
      <span class="h3">{soldArticles.length} - Ventes</span>
      <br /><br />
      <table style="width: 100%;">
        <thead>
          <tr>
            <th align="left" style="padding: 2px 0px; width: 125px;">
              Date de la vente
            </th>
            <th align="left" style="padding: 2px 8px; width: 70px;">Ref</th>
            <th align="left" style="padding: 2px 8px;">Nom</th>
            <th align="left" style="padding: 2px 0px; width: 80px;">Frais</th>
            <th align="left" style="padding: 2px 0px; width: 80px;">Marge</th>
            <th align="left" style="padding: 2px 0px; width: 100px;">Prix</th>
          </tr>
        </thead>

        <tbody>
          {#each soldArticles as article}
            <tr>
              <td style="padding: 2px 0px;">
                {dateFormat(new Date(article.sold || ""))}
              </td>
              <td style="padding: 2px 8px;">{article.ref}</td>
              <td style="padding: 2px 8px; max-width: 500px;">{article.name}</td
              >
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(-article.fee, subscribe.troc.currency)}
              </td>
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(-article.margin, subscribe.troc.currency)}
              </td>
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(article.price, subscribe.troc.currency)}
              </td>
            </tr>
          {/each}
          <tr>
            <td colspan="3"></td>
            <td
              style="padding: 2px 0px; border-top: 1px solid grey; font-size: 1.1em;"
              align="right"
            >
              <b>
                {renderAmount(
                  -sumOf(soldArticles.map((a) => a.fee)),
                  subscribe.troc.currency
                )}
              </b>
            </td>
            <td
              style="padding: 2px 0px; border-top: 1px solid grey; font-size: 1.1em;"
              align="right"
            >
              <b>
                {renderAmount(
                  -sumOf(soldArticles.map((a) => a.margin)),
                  subscribe.troc.currency
                )}
              </b>
            </td>
            <td
              style="padding: 2px 0px; border-top: 1px solid grey; font-size: 1.1em;"
              align="right"
            >
              <b>
                {renderAmount(
                  sumOf(soldArticles.map((a) => a.price)),
                  subscribe.troc.currency
                )}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  {/if}

  {#if validedArticles.length}
    <br />
    <hr />
    <br />

    <section>
      <span class="h3">{validedArticles.length} - Dépots</span>
      <br /><br />
      <table style="width: 100%;">
        <thead>
          <tr>
            <th align="left" style="padding: 2px 0px; width: 125px;">
              Date du dépot
            </th>
            <th align="left" style="padding: 2px 8px; width: 70px;">Ref</th>
            <th align="left" style="padding: 2px 8px;">Nom</th>
            <th align="left" style="padding: 2px 0px; width: 80px;">Frais</th>
            <th align="left" style="padding: 2px 0px; width: 100px;">Prix</th>
          </tr>
        </thead>

        <tbody>
          {#each validedArticles as article}
            <tr>
              <td style="padding: 2px 0px;">
                {dateFormat(new Date(article.valided || ""))}
              </td>
              <td style="padding: 2px 8px;">{article.ref}</td>
              <td style="padding: 2px 8px; max-width: 500px;">{article.name}</td
              >
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(-article.fee, subscribe.troc.currency)}
              </td>
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(article.price, subscribe.troc.currency)}
              </td>
            </tr>
          {/each}
          <tr>
            <td colspan="3"></td>
            <td
              style="padding: 2px 0px; border-top: 1px solid grey; font-size: 1.1em;"
              align="right"
            >
              <b>
                {renderAmount(
                  -sumOf(validedArticles.map((a) => a.fee)),
                  subscribe.troc.currency
                )}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  {/if}

  {#if recoverArticles.length}
    <br />
    <hr />
    <br />

    <section>
      <span class="h3">{recoverArticles.length} - Récupérations</span>
      <br /><br />
      <table style="width: 100%;">
        <thead>
          <tr>
            <th align="left" style="padding: 2px 0px; width: 125px;">
              Date de le récupération
            </th>
            <th align="left" style="padding: 2px 8px; width: 70px;">Ref</th>
            <th align="left" style="padding: 2px 8px;">Nom</th>
            <th align="left" style="padding: 2px 0px; width: 80px;">Frais</th>
            <th align="left" style="padding: 2px 0px; width: 100px;">Prix</th>
          </tr>
        </thead>

        <tbody>
          {#each recoverArticles as article}
            <tr>
              <td style="padding: 2px 0px;">
                {dateFormat(new Date(article.recover || ""))}
              </td>
              <td style="padding: 2px 8px;">{article.ref}</td>
              <td style="padding: 2px 8px; max-width: 500px;">{article.name}</td
              >
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(-article.fee, subscribe.troc.currency)}
              </td>
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(article.price, subscribe.troc.currency)}
              </td>
            </tr>
          {/each}
          <tr>
            <td colspan="3"></td>
            <td
              style="padding: 2px 0px; border-top: 1px solid grey; font-size: 1.1em;"
              align="right"
            >
              <b>
                {renderAmount(
                  -sumOf(recoverArticles.map((a) => a.fee)),
                  subscribe.troc.currency
                )}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  {/if}
</main>

<style>
  main {
    font-size: medium;
    line-height: normal;
    max-width: 900px;
    margin: auto;
    padding-top: 20px;
    padding-bottom: 80px;
  }
  .h2 {
    font-size: 1.5em;
  }
  .h3 {
    font-size: 1.3em;
  }
</style>
