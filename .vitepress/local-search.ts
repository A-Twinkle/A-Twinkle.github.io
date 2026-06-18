import fs from 'node:fs'
import { formatDateOnly, toDateAttr } from './theme/utils/date'
import { normalizeTags } from '../utils/tags'
import { ARTICLES_DIR, ARTICLES_PATH_PREFIX } from '../utils/paths'

const headingRegex = /<h(\d*).*?>(.*?<a.*? href="#.*?".*?>.*?<\/a>)<\/h\1>/gi
const headingContentRegex = /(.*?)<a.*? href="#(.*?)".*?>.*?<\/a>/i

interface ArticleFrontmatter {
  title: string
  date: unknown
  tags: string[]
}

function clearHtmlTags(str: string) {
  return str.replace(/<[^>]*>/g, '')
}

function getSearchableText(content: string) {
  return clearHtmlTags(content).trim()
}

function parseArticleFrontmatter(raw: string): ArticleFrontmatter {
  const empty = { title: '', date: '', tags: [] as string[] }
  if (!raw.startsWith('---')) return empty

  const end = raw.indexOf('\n---', 3)
  if (end === -1) return empty

  const block = raw.slice(4, end).trim()
  const data: ArticleFrontmatter = { ...empty }
  let listKey: string | null = null

  for (const line of block.split('\n')) {
    const keyOnly = line.match(/^([A-Za-z0-9_-]+):\s*$/)
    if (keyOnly) {
      listKey = keyOnly[1]
      if (listKey === 'tags') data.tags = []
      continue
    }

    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/)
    if (match) {
      listKey = null
      const key = match[1]
      const value = match[2].trim().replace(/^['"]|['"]$/g, '')
      if (key === 'title') data.title = value
      else if (key === 'date') data.date = value
      continue
    }

    const listMatch = line.match(/^\s+-\s+(.+)$/)
    if (listMatch && listKey === 'tags') {
      data.tags.push(listMatch[1].trim().replace(/^['"]|['"]$/g, ''))
    }
  }

  data.tags = normalizeTags(data.tags)
  return data
}

function formatDateForSearch(raw: unknown): string {
  if (!raw) return ''

  const parts = new Set<string>()
  const iso = toDateAttr(raw)
  if (iso) parts.add(iso)

  const cn = formatDateOnly(raw)
  if (cn) parts.add(cn)

  const match = iso.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (match) {
    const y = Number(match[1])
    const mo = Number(match[2])
    const d = Number(match[3])
    parts.add(String(y))
    parts.add(`${y}年`)
    parts.add(`${y}年${mo}月`)
    parts.add(`${mo}月`)
    parts.add(`${mo}月${d}日`)
  }

  return [...parts].join(' ')
}

/** 仅 posts/articles/*.md 参与搜索 */
export function isArticleMarkdown(relativePath?: string): boolean {
  return (
    !!relativePath?.startsWith(ARTICLES_PATH_PREFIX) &&
    relativePath.endsWith('.md')
  )
}

export function isArticleFile(filePath: string): boolean {
  const norm = filePath.replace(/\\/g, '/')
  return norm.includes(`/${ARTICLES_DIR}/`) && norm.endsWith('.md')
}

/** 索引与查询共用：中文词组优先，避免单字误匹配 */
export function tokenizeForSearch(text: string): string[] {
  const tokens = new Set<string>()

  for (const word of text.match(/[a-zA-Z0-9]+/g) ?? []) {
    if (word.length > 0) tokens.add(word.toLowerCase())
  }

  for (const run of text.match(/[\u4e00-\u9fff]+/g) ?? []) {
    if (run.length >= 2) tokens.add(run)
    for (let i = 0; i < run.length - 1; i++) {
      tokens.add(run.slice(i, i + 2))
    }
  }

  const cjkText = text.replace(/\s+/g, '')
  if (cjkText && typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' })
    for (const { segment } of segmenter.segment(cjkText)) {
      const token = segment.trim()
      if (token.length >= 2 && /[\u4e00-\u9fff]/.test(token)) tokens.add(token)
    }
  }

  return [...tokens]
}

type SearchHitKind = 'tags' | 'date' | 'summary' | 'section'

const HIT_KIND_LABEL: Record<SearchHitKind, string> = {
  tags: '标签',
  date: '日期',
  summary: '开篇',
  section: '章节',
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 生成带类型的命中行（VitePress 会 v-html 渲染最后一项为 .title.main） */
function buildHitTitle(kind: SearchHitKind, detail?: string): string {
  const label = HIT_KIND_LABEL[kind]
  if (!detail) {
    return `<span class="search-hit" data-kind="${kind}"><span class="search-hit-type">${label}</span></span>`
  }
  return `<span class="search-hit" data-kind="${kind}"><span class="search-hit-type">${label}</span><span class="search-hit-sep">·</span><span class="search-hit-detail">${escapeHtml(detail)}</span></span>`
}

function buildResultTitles(
  articleTitle: string | undefined,
  kind: SearchHitKind,
  detail?: string,
): string[] {
  const hit = buildHitTitle(kind, detail)
  if (articleTitle) return [articleTitle, hit]
  return [hit]
}

/** 按 Markdown 标题切分正文（只索引 md 渲染后的文字） */
export function* splitIntoSections(html: string, articleTitle?: string) {
  const result = html.split(headingRegex)
  const preamble = result.shift()?.trim()

  if (preamble) {
    const text = getSearchableText(preamble)
    if (text) {
      yield {
        anchor: 'summary',
        titles: buildResultTitles(articleTitle || undefined, 'summary'),
        text,
      }
    }
  }

  for (let i = 0; i < result.length; i += 3) {
    const heading = result[i + 1]
    const headingResult = headingContentRegex.exec(heading)
    const title = getSearchableText(headingResult?.[1] ?? '')
    const anchor = headingResult?.[2] ?? ''
    const content = result[i + 2]

    if (!title || !content) continue

    const text = getSearchableText(content)
    if (!text) continue

    yield {
      anchor,
      titles: buildResultTitles(articleTitle || undefined, 'section', title),
      text,
    }
  }
}

/** 文章 md：正文 + frontmatter 标签/日期 */
export function* splitIntoSectionsWithMeta(file: string, html: string) {
  if (!isArticleFile(file)) return

  let meta: ArticleFrontmatter = { title: '', date: '', tags: [] }
  try {
    meta = parseArticleFrontmatter(fs.readFileSync(file, 'utf-8'))
  } catch {
    // ignore
  }

  const articleTitle = meta.title.trim()

  if (meta.tags.length) {
    yield {
      anchor: 'tags',
      titles: buildResultTitles(
        articleTitle || undefined,
        'tags',
        meta.tags.join(' · '),
      ),
      text: meta.tags.join(' '),
    }
  }

  const dateText = formatDateForSearch(meta.date)
  if (dateText) {
    const dateDisplay = formatDateOnly(meta.date) || toDateAttr(meta.date)
    yield {
      anchor: 'date',
      titles: buildResultTitles(articleTitle || undefined, 'date', dateDisplay),
      text: dateText,
    }
  }

  yield* splitIntoSections(html, articleTitle || undefined)
}

type MarkdownEnv = {
  relativePath?: string
  frontmatter?: Record<string, unknown>
}

type MarkdownRenderer = {
  render: (src: string, env: MarkdownEnv) => string
}

/**
 * 仅渲染文章 md 供索引；其它页面返回空字符串，不进入搜索库
 */
export function renderSearchableMarkdown(
  md_src: string,
  env: MarkdownEnv,
  md: MarkdownRenderer,
): string {
  if (env.frontmatter?.search === false) return ''
  if (!isArticleMarkdown(env.relativePath)) return ''

  const html = md.render(md_src, env)
  const title = env.frontmatter?.title

  if (typeof title === 'string' && title && !/<h1[\s>]/i.test(html)) {
    const safe = title
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    return `<h1 id="page-title"><a href="#page-title">${safe}</a></h1>\n${html}`
  }

  return html
}
