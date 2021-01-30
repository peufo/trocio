import * as PNotify from '@pnotify/core'
import * as PNotifyMobile from '@pnotify/mobile'
import * as PNotifyFontAwesome5 from '@pnotify/font-awesome5'
import * as PNotifyAnimate from '@pnotify/animate'

PNotify.defaultModules.set(PNotifyMobile, {})
PNotify.defaultModules.set(PNotifyFontAwesome5, {})
PNotify.defaultModules.set(PNotifyAnimate, {inClass: 'animate__fadeInLeft', outClass: 'animate__fadeOutLeft'})
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
    maxOpen: 5
})

function formatOptions(options, defaultIcon = '') {
    if (typeof options === 'string') options = {title: options}
    if (!options.icon) options.icon = defaultIcon
    console.log({options})
    return options
}

function success(options) {
    return PNotify.success(formatOptions(options, 'fas fa-check'))
}

function warning(options) {
    return PNotify.notice(formatOptions(options, 'fas fa-exclamation-triangle'))
}

function error(options) {
    console.trace(options)
    if (options.stack) options = {title: options.message, text: options.stack} // Error type
    return PNotify.error(formatOptions(options, 'fas fa-bug'))
}

function info(options) {
    return PNotify.info(formatOptions(options, ''))
}

export default { success, warning, error, info }