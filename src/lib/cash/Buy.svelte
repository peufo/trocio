<script lang="ts">
    import { Button, Icon } from '$material'
    import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
    import { mdiCurrencyUsd, mdiCurrencyUsdOff } from '@mdi/js'

    import Template from '$lib/cash/Template.svelte'
    import Loader from '$lib/util/Loader.svelte'
    import { api } from '$lib/api'
    import type { Article, SubscribeLookup } from 'types'
    import { troc } from '$lib/troc/store'
    import { isAutoPurchasesPayment } from '$lib/cash/store'
    import notify from '$lib/notify'
    import PaymentDialog from './PaymentDialog.svelte'

    export let subscribe: SubscribeLookup
    export let template: Template | undefined = undefined
    let paymentDialog: PaymentDialog
    let paymentRows = 2

    let pendingItems: Article[] = []
    const queryClient = useQueryClient()
    const querySold = useMutation(
        () =>
            api<{ articlesId: string[]; buyerSubId: string }, Article[]>(
                '/api/articles/sold',
                {
                    method: 'post',
                    data: {
                        articlesId: pendingItems.map((art) => art._id),
                        buyerSubId: subscribe._id,
                    },
                    success: `${pendingItems.length} articles vendus`,
                }
            ),
        {
            onSuccess: (articles: Article[]) => {
                if ($isAutoPurchasesPayment) {
                    const purchasesSum = articles.reduce(
                        (acc, cur) => (acc += cur.price),
                        0
                    )
                    const comment = [
                        'Règlement des achats:',
                        ...articles.map(
                            (art) => `${art.price.toFixed(2)} - ${art.name}`
                        ),
                    ].join('\n')
                    paymentRows = Math.max(2, Math.min(articles.length + 2, 8))
                    if (purchasesSum > 0)
                        paymentDialog.open(
                            subscribe,
                            comment,
                            purchasesSum,
                            'des achats'
                        )
                }
                pendingItems = []
                queryClient.invalidateQueries('articles')
                queryClient.invalidateQueries('subscribes/resum')
                template.closeSelection()
            },
        }
    )

    function toggleAutoPurchasesPaymement() {
        $isAutoPurchasesPayment = !$isAutoPurchasesPayment
        notify.info(
            `Dialogue de règlement des achats ${$isAutoPurchasesPayment ? '' : 'dés'}activé`
        )
    }
</script>

<PaymentDialog rows={paymentRows} bind:this={paymentDialog} />

<Template
    bind:this={template}
    bind:pendingItems
    queryParams={{
        exact_trocId: $troc._id,
        ne_exact_providerSubId: subscribe?._id,
        exact_state: 'valided',
    }}
    placeholder="Articles disponibles"
    message="Sélectionner des articles disponible pour les vendres au client."
>
    <div slot="options-selection" class="d-flex align-center" style="gap: 1em;">
        <div title="Dialogue de règlement des achats">
            <Button
                fab
                size="small"
                depressed
                on:click={toggleAutoPurchasesPaymement}
            >
                <Icon
                    path={$isAutoPurchasesPayment
                        ? mdiCurrencyUsd
                        : mdiCurrencyUsdOff}
                />
            </Button>
        </div>
    </div>

    <div slot="actions-selection">
        {#if $querySold.isLoading}
            <Button disabled><Loader /></Button>
        {:else}
            <Button class="primary-color" on:click={() => $querySold.mutate()}>
                Vendre
                {pendingItems.length > 1
                    ? `les ${pendingItems.length} articles`
                    : `l'article`}
            </Button>
        {/if}
    </div>
</Template>
