import { defineConfig } from "vite";
import fs from "fs";

import devtoolsJson from "vite-plugin-devtools-json";
import { sveltekit } from "@sveltejs/kit/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [sveltekit(), devtoolsJson()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    https: {
      key: readIfExists("localhost-key.pem"),
      cert: readIfExists("localhost.pem"),
    },
  },
});

/**
 * @param {string} path
 * @returns
 */
function readIfExists(path) {
  return fs.existsSync(path) ? fs.readFileSync(path) : "";
}
