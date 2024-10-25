type EventsSSE = {
  test: { date: string }
  scan: { value: string }
}

type SubscribeHandlers = Partial<{
  [k in keyof EventsSSE]: (data: EventsSSE[k]) => void
}>

export function subscribe(handlers: SubscribeHandlers) {
  const subscription = new EventSource('/api/sse/subscribe')

  const listeners = Object.entries(handlers).map<
    [string, (data: unknown) => unknown]
  >(([eventName, handler]) => [
    eventName,
    (event: MessageEvent<any>) => handler(JSON.parse(event.data)),
  ])

  listeners.forEach(([eventName, listener]) => {
    subscription.addEventListener(eventName, listener)
  })

  return () => {
    listeners.forEach(([eventName, listener]) => {
      subscription.removeEventListener(eventName, listener)
    })
    subscription.close()
  }
}

export function emit<EventName extends keyof EventsSSE>(
  event: EventName,
  data: EventsSSE[EventName]
) {
  fetch(`/api/sse/emit/${event}`, {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}
