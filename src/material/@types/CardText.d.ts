import { SvelteComponentTyped } from 'svelte'

interface CardTextProps {
  class?: string
  style?: string
}

declare class CardText extends SvelteComponentTyped<CardTextProps> {}
export default CardText
