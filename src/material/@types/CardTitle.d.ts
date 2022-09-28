import { SvelteComponentTyped } from 'svelte'

interface CardTitleProps {
  class?: string
  style?: string
}

declare class CardTitle extends SvelteComponentTyped<CardTitleProps> {}
export default CardTitle
