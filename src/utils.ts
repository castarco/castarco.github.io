import type { MDXInstance, Page, PaginateFunction, Props } from "astro";
import { PAGE_SIZE } from "./config";
import { default as FastGlob } from 'fast-glob'
import { readFileSync } from 'fs'
import YAML from 'yaml'
import { resolve } from 'path'

export type PostFrontmatter = {
	title: string;
	description: string;
	pubDate: Date;
	url: string;
	tags?: string[];
};

export type PostMdxInstance = MDXInstance<PostFrontmatter>;
export type PostPage = Page<PostMdxInstance>;

export type CustomPaginator = (pgOpts: {
	paginate: PaginateFunction;
}) => Promise<
	{
		params: Record<string, string | number | undefined>;
		props: Props & { page: PostPage };
	}[]
>;

const addPrefixToUrl = (
	prefix: `/${string}`,
	url: string | undefined
): string | undefined => {
	const newUrl =
		url !== undefined && url !== "/" && !url.startsWith(prefix)
			? `${prefix}${url}`
			: url;

	return newUrl === "" ? "/" : newUrl;
};

const removePrefixFromUrl = (
	prefix: `/${string}`,
	url: string | undefined
): string | undefined => {
	const newUrl =
		url === `${prefix}/` ? url.substring(prefix.length + 1, url.length) : url;

	return newUrl === "" ? "/" : newUrl;
};

export const getUnsortedPosts = (): PostMdxInstance[] => {
	const blogArticlesRelativePaths = FastGlob.sync('./src/pages/blog/**/*.mdx')
	const unsortedPosts = blogArticlesRelativePaths.map(relPath => {
		const absolutePath = resolve(relPath)
		const frontmatter = YAML.parse(
			readFileSync(relPath, { encoding: 'utf8' }).split('---')[1].replace('\t', '  ')
		)

		return {
			frontmatter,
			url: `${absolutePath.split('src/pages')[1].slice(0, -4)}/`,
			file: absolutePath
		}
	}) as PostMdxInstance[];

	return unsortedPosts
}

export const getSortedPosts = () => {
	const unsortedPosts = getUnsortedPosts()

	return unsortedPosts
		.map((p) => {
			if (p.url === undefined) {
				throw new Error(`URL not defined! (file: ${p.file})`)
			}
			const dateStr = p.url.split("/").slice(2, 5).join("/");

			return {
				...p,
				frontmatter: {
					...p.frontmatter,
					pubDate: new Date(p.frontmatter.pubDate ?? dateStr),
				},
			};
		})
		.sort(
			(a, b) =>
				b.frontmatter.pubDate.valueOf() -
				a.frontmatter.pubDate.valueOf()
		);
};

export const getCustomStaticPathsGetter = (
	unsortedPosts: PostMdxInstance[],
	mode: "all" | "onlyFirst" | "tail" = "all",
	prefix: `/${string}`,
	applyPrefix: boolean
): CustomPaginator => {
	return async ({ paginate }) => {
		const allPosts = getSortedPosts(unsortedPosts);

		const pages = paginate(allPosts, { pageSize: PAGE_SIZE }).map((p) => {
			const props = p.props as Props & { page: Page };
			const page = props.page;

			return {
				...p,
				params: {
					...p.params,
					page:
						p.params.page && applyPrefix
							? `${prefix}/${p.params.page}`
							: p.params.page,
				},
				props: {
					...props,
					page: {
						...page,
						url: {
							current: page.url.current,
							prev: applyPrefix
								? addPrefixToUrl(prefix, page.url.prev)
								: removePrefixFromUrl(prefix, page.url.prev),
							next: applyPrefix
								? addPrefixToUrl(prefix, page.url.next)
								: removePrefixFromUrl(prefix, page.url.next),
						},
					},
				},
			};
		});

		switch (mode) {
			case "all":
				return pages;
			case "onlyFirst":
				return pages.slice(0, 1);
			case "tail":
				return pages.slice(1);
		}
	};
};
