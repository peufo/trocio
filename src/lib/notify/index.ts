import { tick } from 'svelte'
import type { ScaleParams } from 'svelte/transition'

import Notify from '$lib/notify/Notify.svelte'

const DURATION = 3000

type TNotify = 'info' | 'success' | 'warning' | 'error'

interface INotifyOptions {
  message: string
  type?: TNotify
  title?: string
  persistent?: boolean
  duration?: number
  transitionParams?: ScaleParams
}

function parsArgs(
  messageOrOptions: string | INotifyOptions,
  persistent = false
) {
  const options: INotifyOptions =
    typeof messageOrOptions === 'string'
      ? { message: messageOrOptions, persistent, duration: DURATION }
      : messageOrOptions
  return options
}

function notify(message: string, persistent?: false): void
function notify(options: INotifyOptions, persistent?: false): void
function notify(messageOrOptions: string | INotifyOptions, persistent = false) {
  const options = parsArgs(messageOrOptions, persistent)
  const notify = new Notify({
    target: document.body,
    props: options,
  })

  notify.$on('outroend', async () => {
    await tick()
    notify.$destroy()
  })
}

function success(message: string, persistent?: false): void
function success(options: INotifyOptions): void
function success(
  messageOrOptions: string | INotifyOptions,
  persistent = false
) {
  const options = parsArgs(messageOrOptions, persistent)
  options.type = 'success'
  notify(options)
}

function info(message: string, persistent?: false): void
function info(options: INotifyOptions): void
function info(messageOrOptions: string | INotifyOptions, persistent = false) {
  const options = parsArgs(messageOrOptions, persistent)
  options.type = 'info'
  notify(options)
}
function warning(message: string, persistent?: false): void
function warning(options: INotifyOptions): void
function warning(
  messageOrOptions: string | INotifyOptions,
  persistent = false
) {
  const options = parsArgs(messageOrOptions, persistent)
  options.type = 'warning'
  notify(options)
}

function error(message: string, persistent?: false): void
function error(options: INotifyOptions): void
function error(messageOrOptions: string | INotifyOptions, persistent = false) {
  const options = parsArgs(messageOrOptions, persistent)
  options.type = 'error'
  notify(options)
}

export { notify, success, info, warning, error }
