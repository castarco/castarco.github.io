import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import solid from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
	markdown: {
		syntaxHighlight: 'shiki',
		shikiConfig: {
			theme: "material-darker",
		},
	},
	integrations: [
		mdx({
			remarkPlugins: [remarkMath],
			rehypePlugins: [rehypeKatex],
		}),
		solid(),
		tailwind(),
		sitemap(),
	],
	trailingSlash: "always",
	site: `https://blog.coderspirit.xyz`,
});
