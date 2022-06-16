import { tick } from 'svelte'
import type { ScaleParams } from 'svelte/transition'

import Notify from '$lib/notify/Notify.svelte'

const DURATION = 3000

interface INotifyOptions {
  text: string
  persistent?: boolean
  duration?: number
  transitionParams?: ScaleParams
}

function notify(text: string, persistent?: false): void
function notify(options: INotifyOptions): void
function notify(textOrOptions: string | INotifyOptions, persistent = false) {
  const options: INotifyOptions =
    typeof textOrOptions === 'string'
      ? { text: textOrOptions, persistent, duration: DURATION }
      : textOrOptions

  const notify = new Notify({
    target: document.body,
    props: options,
  })

  notify.$on('outroend', async () => {
    await tick()
    notify.$destroy()
  })
}

export { notify }
