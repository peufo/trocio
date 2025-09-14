import { mdsvex } from "mdsvex";
import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: [vitePreprocess(), mdsvex()],
  compilerOptions: { accessors: process.env.TEST },
  kit: { adapter: adapter() },
  extensions: [".svelte", ".svx"],
};
