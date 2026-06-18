export const RECENT_TAG_LABEL = '最近文章'

export function normalizeTags(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return [...new Set(raw.map(String).map((tag) => tag.trim()).filter(Boolean))]
  }
  if (typeof raw === 'string') {
    return [
      ...new Set(
        raw
          .split(/[,，]/)
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    ]
  }
  return []
}

export function tagPageUrl(tag?: string): string {
  if (!tag || tag === RECENT_TAG_LABEL) return '/tags/'
  return `/tags/?tag=${encodeURIComponent(tag)}`
}

export interface TagStat {
  name: string
  count: number
}

export function buildTagStats(
  posts: ReadonlyArray<{ tags: string[] }>,
): TagStat[] {
  const map = new Map<string, number>()

  for (const post of posts) {
    for (const tag of post.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1)
    }
  }

  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'))
}
