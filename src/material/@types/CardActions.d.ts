import { SvelteComponentTyped } from 'svelte'

interface CardActionsProps {
  class?: string
  style?: string
}

declare class CardActions extends SvelteComponentTyped<CardActionsProps> {}
export default CardActions
