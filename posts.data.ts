import { createContentLoader } from 'vitepress'
import { resolvePostCover } from './utils/cover'
import { ARTICLES_PATH_PREFIX } from './utils/paths'
import { normalizeTags } from './utils/tags'

export interface Post {
  url: string
  title: string
  date: string
  tags: string[]
  cover: string
}

export default createContentLoader([`${ARTICLES_PATH_PREFIX}**/*.md`], {
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter }) => {
        const rawDate = frontmatter.date
        const date =
          rawDate instanceof Date
            ? rawDate.toISOString().slice(0, 10)
            : String(rawDate ?? '')

        return {
          url,
          title: String(frontmatter.title ?? '无标题'),
          date,
          tags: normalizeTags(frontmatter.tags),
          cover: resolvePostCover(frontmatter.cover),
        }
      })
      .filter((post) => post.date)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  },
})
