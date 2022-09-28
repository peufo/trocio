import {SvelteComponentTyped} from 'svelte'

type LocalSvelteProps = {
  children?: any;
  class?: string;
} & Record<string, any>;

/**
 * Local svelte class for adding typescript definitions for svelte components
 *
 */
export type SvelteComponent<Props extends Record<string, any> = any> = SvelteComponentTyped<Props>
