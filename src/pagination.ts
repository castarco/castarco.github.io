
import type {
	AstroGlobal,
	MarkdownInstance,
	Page,
	PaginateFunction,
	Props
} from 'astro'

type CustomPaginator = (
	pgOpts: { paginate: PaginateFunction }
) => Promise<{
	params: Record<string, string | number | undefined>,
	props: Props & { page: Page }
}[]>

const addPrefixToUrl = (
	prefix: `/${string}` | undefined,
	url: string | undefined
): string | undefined => {
	return url !== undefined && url !== '/'
	  ? `${prefix}${url}`
		: url
}

export const getCustomStaticPathsGetter = (
	unsortedPosts: MarkdownInstance<Record<string, any>>[],
	mode: 'all' | 'onlyFirst' | 'tail' = 'all',
	prefix?: `/${string}` | undefined,
): CustomPaginator => {
	console.error('Building paginator')

	return async ({ paginate }) => {
		const allPosts = unsortedPosts.sort((a, b) =>
			(new Date(b.frontmatter.publishDate).valueOf() - new Date(a.frontmatter.publishDate).valueOf())
		);

		const pages = paginate(allPosts, { pageSize: 2 })
			.map(p => {
				const props = p.props as Props & { page: Page }
				const page = props.page

				return {
					...p,
					params: {
						...p.params,
						page: p.params.page && prefix ? `${prefix}/${p.params.page}` : p.params.page,
					},
					props: {
						...props,
						page: {
							...page,
							url: {
								current: prefix ? addPrefixToUrl(prefix, page.url.current) : page.url.current,
								prev: prefix ? addPrefixToUrl(prefix, page.url.prev) : page.url.prev,
								next: prefix ? addPrefixToUrl(prefix, page.url.next) : page.url.next,
							}
						}
					}
				}
			});

		switch (mode) {
			case 'all': return pages
			case 'onlyFirst': return pages.slice(0, 1)
			case 'tail': return pages.slice(1)
		}
	}
}
