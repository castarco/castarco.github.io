import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import solid from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// https://astro.build/config
export default defineConfig({
	integrations: [
		mdx({
			remarkPlugins: [remarkMath],
			rehypePlugins: [rehypeKatex],
		}),
		solid(),
		tailwind(),
	],
  trailingSlash: 'always',
	site: `http://blog.coderspirit.xyz`,
});
