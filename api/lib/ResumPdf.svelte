<script lang="ts">
  import { renderAmount } from './utils'

  /*
  import type { SubscribeResum, SubscribeLookup, Article } from '../../types'
  export let sub: SubscribeResum & SubscribeLookup
  export let validedArticles: Article[]
  export let soldArticles: Article[]
  export let recoverArticles: Article[]
  */
  export let sub
  export let validedArticles
  export let soldArticles
  export let recoverArticles

  const dateFormat = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: '2-digit',
    year: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
  }).format

  function sumOf(arr) {
    if (!arr.length) return 0
    return arr.reduce((acc, cur) => (acc += cur))
  }
</script>

<main style="font-family: monospace;">
  <header>
    <span style="font-size: 2em;">{sub.troc.name}</span>
    <span>
      {#if sub.troc.society}
        {sub.troc.society} -
      {/if}
      {new Date(sub.troc.open).toLocaleDateString()}
    </span>
    <br /><br />
    <span style="font-size: 1.5em;">
      Activité de <b>{sub.user?.name || sub.name}</b>
    </span>
  </header>

  <br />

  <div style="display: flex;">
    <div>
      <h2>Solde</h2>
    </div>
    <div style="flex-grow: 1;" />
    <div>
      <h2>{renderAmount(sub.resum.balance, sub.troc.currency)}</h2>
    </div>
  </div>

  {#if sub.resum.paymentsCount}
    <hr />
    <br />

    <section>
      <h3>{sub.resum.paymentsCount} - Paiements</h3>

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
          {#each sub.resum.payments || [] as payment}
            <tr>
              <td style="padding: 2px 0px;">
                {dateFormat(new Date(payment.createdAt || ''))}
              </td>
              <td style="padding: 2px 8px; max-width: 500px;">
                {payment.message || '-'}
              </td>
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(payment.amount, sub.troc.currency)}
              </td>
            </tr>
          {/each}
          <tr>
            <td colspan="2" />
            <td
              style="padding: 2px 0px; border-top: 1px solid grey; font-size: 1.1em;"
              align="right"
            >
              <b>
                {renderAmount(sub.resum.paymentsSum, sub.troc.currency)}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  {/if}

  {#if sub.resum.purchasesCount}
    <br />
    <hr />
    <br />

    <section>
      <h3>{sub.resum.purchasesCount} - Achats</h3>

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
          {#each sub.resum.purchases || [] as purchase}
            <tr>
              <td style="padding: 2px 0px;">
                {dateFormat(new Date(purchase.sold || ''))}
              </td>
              <td style="padding: 2px 8px;">{purchase.ref}</td>
              <td style="padding: 2px 8px; max-width: 500px;"
                >{purchase.name}</td
              >
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(-purchase.price, sub.troc.currency)}
              </td>
            </tr>
          {/each}
          <tr>
            <td colspan="3" />
            <td
              style="padding: 2px 0px; border-top: 1px solid grey; font-size: 1.1em;"
              align="right"
            >
              <b>
                {renderAmount(
                  -(sub.resum.purchasesSum || 0),
                  sub.troc.currency
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
      <h3>{soldArticles.length} - Ventes</h3>

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
                {dateFormat(new Date(article.sold || ''))}
              </td>
              <td style="padding: 2px 8px;">{article.ref}</td>
              <td style="padding: 2px 8px; max-width: 500px;">{article.name}</td
              >
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(-article.fee, sub.troc.currency)}
              </td>
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(-article.margin, sub.troc.currency)}
              </td>
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(article.price, sub.troc.currency)}
              </td>
            </tr>
          {/each}
          <tr>
            <td colspan="3" />
            <td
              style="padding: 2px 0px; border-top: 1px solid grey; font-size: 1.1em;"
              align="right"
            >
              <b>
                {renderAmount(
                  -sumOf(soldArticles.map((a) => a.fee)),
                  sub.troc.currency
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
                  sub.troc.currency
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
                  sub.troc.currency
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
      <h3>{validedArticles.length} - Dépots</h3>

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
                {dateFormat(new Date(article.valided || ''))}
              </td>
              <td style="padding: 2px 8px;">{article.ref}</td>
              <td style="padding: 2px 8px; max-width: 500px;">{article.name}</td
              >
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(-article.fee, sub.troc.currency)}
              </td>
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(article.price, sub.troc.currency)}
              </td>
            </tr>
          {/each}
          <tr>
            <td colspan="3" />
            <td
              style="padding: 2px 0px; border-top: 1px solid grey; font-size: 1.1em;"
              align="right"
            >
              <b>
                {renderAmount(
                  -sumOf(validedArticles.map((a) => a.fee)),
                  sub.troc.currency
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
      <h3>{recoverArticles.length} - Récupérations</h3>

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
                {dateFormat(new Date(article.recover || ''))}
              </td>
              <td style="padding: 2px 8px;">{article.ref}</td>
              <td style="padding: 2px 8px; max-width: 500px;">{article.name}</td
              >
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(-article.fee, sub.troc.currency)}
              </td>
              <td style="padding: 2px 0px;" align="right">
                {renderAmount(article.price, sub.troc.currency)}
              </td>
            </tr>
          {/each}
          <tr>
            <td colspan="3" />
            <td
              style="padding: 2px 0px; border-top: 1px solid grey; font-size: 1.1em;"
              align="right"
            >
              <b>
                {renderAmount(
                  -sumOf(recoverArticles.map((a) => a.fee)),
                  sub.troc.currency
                )}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  {/if}
</main>
