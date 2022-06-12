import { cubicOut } from 'svelte/easing'
import { assign, is_function } from 'svelte/internal'

/**
 * Custom implementation of crossfade with border-radius
 * https://github.com/sveltejs/svelte/blob/master/src/runtime/transition/index.ts
 */

export type EasingFunction = (t: number) => number

export interface TransitionConfig {
  delay?: number
  duration?: number
  easing?: EasingFunction
  css?: (t: number, u: number) => string
  tick?: (t: number, u: number) => void
}

export interface CrossfadeParams {
  delay?: number
  duration?: number | ((len: number) => number)
  easing?: EasingFunction
}

type ClientState = { rect: DOMRect; style: CSSStyleDeclaration; intro: boolean }
type ClientMap = Map<any, ClientState>

type ITransition = (
  node: Element,
  params: CrossfadeParams & {
    key: any
  }
) => () => TransitionConfig

export function crossfade({
  fallback,
  ...defaults
}: CrossfadeParams & {
  fallback?: (
    node: Element,
    params: CrossfadeParams,
    intro: boolean
  ) => TransitionConfig
}): [ITransition, ITransition] {
  const to_receive: ClientMap = new Map()
  const to_send: ClientMap = new Map()

  function crossfade(
    from: ClientState,
    node: Element,
    params: CrossfadeParams
  ): TransitionConfig {
    const {
      delay = 0,
      duration = (d: number) => Math.sqrt(d) * 30,
      easing = cubicOut,
    } = assign(assign({}, defaults), params)

    const to = node.getBoundingClientRect()
    const dx = from.rect.left - to.left
    const dy = from.rect.top - to.top
    const dw = from.rect.width / to.width
    const dh = from.rect.height / to.height
    const d = Math.sqrt(dx * dx + dy * dy)

    const style = getComputedStyle(node)
    const transform = style.transform === 'none' ? '' : style.transform
    const opacity = +style.opacity

    const radiusFrom = getBorderRadiusPixel(from.style.borderRadius, from.rect)
    const radiusTo = getBorderRadiusPixel(style.borderRadius, to)
    const dr = radiusFrom - radiusTo
    console.log({ radiusFrom, radiusTo })

    return {
      delay,
      duration: is_function(duration) ? duration(d) : duration,
      easing,
      css: (t, u) => {
        const translate = `translate(${u * dx}px,${u * dy}px)`
        const scale = `scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh})`
        console.log({
          from: radiusFrom,
          to: radiusTo,
          c: radiusFrom - (from.intro ? u : t) * dr,
          intro: from.intro,
        })
        return `
          opacity: ${t * opacity};
          transform-origin: top left;
          transform: ${transform} ${translate} ${scale};
          border-radius: ${radiusFrom - t * dr}px;
        `
      },
    }
  }

  function transition(
    items: ClientMap,
    counterparts: ClientMap,
    intro: boolean
  ) {
    return (node: Element, params: CrossfadeParams & { key: any }) => {
      items.set(params.key, {
        rect: node.getBoundingClientRect(),
        style: getComputedStyle(node),
        intro,
      })

      return () => {
        if (counterparts.has(params.key)) {
          const state = counterparts.get(params.key)!
          counterparts.delete(params.key)

          return crossfade(state, node, params)
        }

        // if the node is disappearing altogether
        // (i.e. wasn't claimed by the other list)
        // then we need to supply an outro
        items.delete(params.key)
        return fallback && fallback(node, params, intro)
      }
    }
  }

  return [
    transition(to_send, to_receive, false),
    transition(to_receive, to_send, true),
  ]
}

function getBorderRadiusPixel(borderRadius: string, rect: DOMRect): number {
  if (borderRadius.endsWith('px')) return +borderRadius.replace('px', '')
  if (borderRadius.endsWith('%')) {
    const percent = +borderRadius.replace('%', '')
    return (rect.width / 100) * percent
  }
  return 0
}
