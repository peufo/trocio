declare global {
  namespace App {
    //interface Locals {}
    // interface Error {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

declare module "plotly.js-dist" {
  export * from "@types/plotly.js";
}

declare module "*.svx" {
  import type { SvelteComponent } from "svelte";

  export default class Comp extends SvelteComponent {}

  export const metadata: Record<string, unknown>;
}
