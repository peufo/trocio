<script lang="ts">
  import { createSubscribe } from './api'

  const createSubscribe = useMutation((data: SubscribeBase) =>
    api<SubscribeBase, SubscribeLookup>('/api/subscribes', {
      method: 'post',
      data,
      success: 'Nouvelle participation',
    })
  )

  function handleClickActivity() {
    if (!$user)
      return $goto('/login', {
        callback: `/trocs/${troc._id}`,
      })
    if (troc.subscribe?.validedByUser) activityOpen = !activityOpen
    else {
      $createSubscribe.mutate(
        { trocId: troc._id },
        {
          onSuccess: (subscribe) => {
            // TODO: manage subscribe already exist
            if (subscribe) troc.subscribe = subscribe
            activityOpen = !activityOpen
          },
        }
      )
    }
  }
</script>

<Button on:click={handleClickActivity} depressed class="mr-1 ml-1">
  {troc.subscribe?.validedByUser ? 'Mon activité' : 'Participer au troc'}
  <IconLink
    icon={faChevronRight}
    rotate={activityOpen ? 90 : 0}
    class="ml-2"
    opacity
    size="1.1em"
  />
</Button>

<UserResum
  subscribeId={troc.subscribe._id}
  isClosed={troc.isClosed && !troc.is_try}
/>
