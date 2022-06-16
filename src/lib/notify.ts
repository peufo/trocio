import * as PNotify from '@pnotify/core'
import * as PNotifyMobile from '@pnotify/mobile'
import * as PNotifyFontAwesome5 from '@pnotify/font-awesome5'
import * as PNotifyAnimate from '@pnotify/animate'
import 'animate.css'
import '$assets/Pnotify_Material.css'

PNotify.defaultModules.set(PNotifyMobile, {})
PNotify.defaultModules.set(PNotifyFontAwesome5, {})
PNotify.defaultModules.set(PNotifyAnimate, {
  inClass: 'animate__fadeInLeft',
  outClass: 'animate__fadeOutLeft',
})
PNotify.defaults.styling = 'material'
PNotify.defaults.delay = 2000
PNotify.defaults.sticker = false
//PNotify.defaults.closer = false

PNotify.defaults.stack = new PNotify.Stack({
  dir1: 'up',
  dir2: 'right',
  firstpos1: 25,
  firstpos2: 25,
  push: 'top',
  modal: false,
  maxOpen: 5,
})

interface Options extends Parameters<typeof PNotify.success> {}

// Empêche notification identiques d'apparaitre dans un court l'apse de temps
let lastOptions: Options | {} = {}
let lastTime = 0
function isSameAndQuickOptions(options: Options[1]): boolean {
  const isSame =
    ((typeof options === 'string' || typeof lastOptions === 'string') &&
      options === lastOptions) ||
    JSON.stringify(options) === JSON.stringify(lastOptions)
  lastOptions = typeof options === 'string' ? options : { ...options }
  const isQuick = new Date().getTime() - lastTime < 2000
  lastTime = new Date().getTime()
  return isSame && isQuick
}

function formatOptions(
  options: Options[1],
  defaultIcon = '',
  notify: typeof PNotify.success
) {
  if (typeof options === 'string') options = { title: options }
  if (!options.icon) options.icon = defaultIcon
  if (isSameAndQuickOptions(options)) return

  console.log('TODO')

  // notify(options)
}

function success(options: Options[1]) {
  formatOptions(options, 'fas fa-check', PNotify.success)
}

function warning(options: Options[1]) {
  formatOptions(options, 'fas fa-exclamation-triangle', PNotify.notice)
}

function error(
  options: (Options[1] & { stack: string; message: string }) | string
): string {
  const icon = 'fas fa-bug'
  if (typeof options === 'string') {
    formatOptions(options, icon, PNotify.error)
    return options
  } else {
    formatOptions(
      { title: options.message, text: options.stack },
      icon,
      PNotify.error
    )
    return options.message
  }
}

function info(options: Options[1]) {
  formatOptions(options, '', PNotify.info)
}

export default { success, warning, error, info }
