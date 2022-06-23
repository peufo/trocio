import { tick } from 'svelte'
import type { ScaleParams } from 'svelte/transition'

import Notify from '$lib/notify/Notify.svelte'

const DURATION = 3000

type TNotify = 'info' | 'success' | 'warning' | 'error'

interface INotifyOptions {
  text: string
  type?: TNotify
  title?: string
  persistent?: boolean
  duration?: number
  transitionParams?: ScaleParams
}

function parsArgs(textOrOptions: string | INotifyOptions, persistent = false) {
  const options: INotifyOptions =
    typeof textOrOptions === 'string'
      ? { text: textOrOptions, persistent, duration: DURATION }
      : textOrOptions
  return options
}

function notify(text: string, persistent?: false): void
function notify(options: INotifyOptions, persistent?: false): void
function notify(textOrOptions: string | INotifyOptions, persistent = false) {
  const options = parsArgs(textOrOptions, persistent)
  const notify = new Notify({
    target: document.body,
    props: options,
  })

  notify.$on('outroend', async () => {
    await tick()
    notify.$destroy()
  })
}

function success(text: string, persistent?: false): void
function success(options: INotifyOptions): void
function success(textOrOptions: string | INotifyOptions, persistent = false) {
  const options = parsArgs(textOrOptions, persistent)
  options.type = 'success'
  notify(options)
}

function info(text: string, persistent?: false): void
function info(options: INotifyOptions): void
function info(textOrOptions: string | INotifyOptions, persistent = false) {
  const options = parsArgs(textOrOptions, persistent)
  options.type = 'info'
  notify(options)
}
function warning(text: string, persistent?: false): void
function warning(options: INotifyOptions): void
function warning(textOrOptions: string | INotifyOptions, persistent = false) {
  const options = parsArgs(textOrOptions, persistent)
  options.type = 'warning'
  notify(options)
}

function error(text: string, persistent?: false): void
function error(options: INotifyOptions): void
function error(textOrOptions: string | INotifyOptions, persistent = false) {
  const options = parsArgs(textOrOptions, persistent)
  options.type = 'error'
  notify(options)
}

export { notify, success, info, warning, error }
export default { notify, success, info, warning, error }
