import { defineConfig } from 'astro/config';

import mdx from "@astrojs/mdx";
import solid from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), solid(), tailwind()],
  site: `http://astro.build`
});
