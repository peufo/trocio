<script lang="ts">
  import {
    Dialog,
    Card,
    CardTitle,
    CardText,
    CardActions,
    Button,
  } from 'svelte-materialify'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'

  import { api } from '$lib/api'
  import type { SubscribeLookup, TrocLookup } from 'types'
  import Loader from '$lib/util/Loader.svelte'
  import { params } from '@roxi/routify'

  export let active = false
  export let subscribe: undefined | SubscribeLookup = undefined
  /** Liste des prefix déjà utilisé */
  export let disabledPrefixs: string[]

  const queryClient = useQueryClient()

  $: selectedPrefix = subscribe?.prefix || ''

  const setTraderPrefix = useMutation(
    (data: { trocId: string; userId: string; prefix: string }) =>
      api<{}, TrocLookup>(`/api/subscribes/prefix`, {
        method: 'post',
        data,
        success: 'Prefix mis à jour',
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['subscribes', { exact_role: 'trader' }])
      },
    }
  )

  const prefixs: string[] = []
  for (let index = 65; index < 91; index++) {
    prefixs.push(String.fromCharCode(index))
  }
</script>

<Dialog bind:active>
  {#if subscribe}
    <Card>
      <CardTitle>
        <h6>Choix du prefix de {subscribe.user.name}</h6>
      </CardTitle>

      <CardText>
        {#each prefixs as prefix}
          <div
            on:click={() => (selectedPrefix = prefix)}
            class="prefix"
            class:selected={selectedPrefix === prefix}
            class:secondary-color={selectedPrefix === prefix}
            class:disabled={disabledPrefixs.includes(prefix) &&
              subscribe.prefix !== prefix}
          >
            {prefix}
          </div>
        {/each}
      </CardText>

      <CardActions class="justify-end">
        {#if $setTraderPrefix.isLoading}
          <Button text disabled>
            <Loader title="Validation" />
          </Button>
        {:else}
          <Button
            text
            on:click={() => {
              $setTraderPrefix.mutate(
                {
                  trocId: $params.trocId,
                  userId: subscribe?.user._id || '',
                  prefix: selectedPrefix,
                },
                {
                  onSuccess: () => {
                    active = false
                  },
                }
              )
            }}
            disabled={disabledPrefixs.includes(selectedPrefix)}
          >
            Valider
          </Button>
        {/if}
      </CardActions>
    </Card>
  {/if}
</Dialog>

<style>
  .prefix {
    height: 48px;
    width: 48px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
  }

  .prefix.selected {
    color: #fff;
  }

  .prefix:not(.disabled):hover {
    background-color: var(--theme-tables-hover);
  }

  .prefix.disabled {
    color: var(--theme-text-disabled);
    cursor: default;
    pointer-events: none;
  }

  .prefix.disabled::after {
    content: '';
    position: absolute;
    width: 50%;
    border-top: 2px var(--theme-text-secondary) solid;
    border-bottom: 1px var(--theme-surface) solid;
    transform-origin: 50% 0;
    transform: rotate(45deg);
  }
</style>
