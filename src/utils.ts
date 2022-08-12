import type { MarkdownInstance, Page, PaginateFunction, Props } from "astro";
import { PAGE_SIZE } from "./config";

export type PostFrontmatter = {
	title: string;
	description: string;
	publishDate: Date;
	url: string;
	tags?: string[];
};

export type PostMdxInstance = MarkdownInstance<PostFrontmatter>;
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
	prefix: `/${string}` | undefined,
	url: string | undefined
): string | undefined => {
	const newUrl =
		url !== undefined && url !== "/" && !url.startsWith(prefix)
			? `${prefix}${url}`
			: url;

	return newUrl === "" ? "/" : newUrl;
};

const removePrefixFromUrl = (
	prefix: `/${string}` | undefined,
	url: string | undefined
): string | undefined => {
	const newUrl =
		url === `${prefix}/` ? url.substring(prefix.length + 1, url.length) : url;

	return newUrl === "" ? "/" : newUrl;
};

export const getSortedPosts = (unsortedPosts: PostMdxInstance[]) => {
	return unsortedPosts
		.map((p) => {
			const dateStr = p.url.split("/").slice(2, 5).join("/");

			return {
				...p,
				frontmatter: {
					...p.frontmatter,
					publishDate: new Date(p.frontmatter.publishDate ?? dateStr),
				},
			};
		})
		.sort(
			(a, b) =>
				b.frontmatter.publishDate.valueOf() -
				a.frontmatter.publishDate.valueOf()
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
