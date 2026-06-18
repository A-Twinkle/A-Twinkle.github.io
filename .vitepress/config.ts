import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitepress'
import {
  renderSearchableMarkdown,
  splitIntoSectionsWithMeta,
  tokenizeForSearch,
} from './local-search'
import { ARTICLES_PATH_PREFIX, POSTS_INDEX_PATH } from '../utils/paths'

function stripFrontmatter(raw: string): string {
  if (!raw.startsWith('---')) return raw
  const end = raw.indexOf('\n---', 3)
  if (end === -1) return raw
  return raw.slice(end + 4).trimStart()
}

function countWords(content: string): number {
  const plain = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/^\s{0,3}\d+\.\s+/gm, '')
    .replace(/[*_~>]/g, '')

  return plain.replace(/\s/g, '').length
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'Kasei',
  description: '个人博客',
  appearance: 'dark',
  cleanUrls: true,
  // 锚点滚动 / 目录高亮偏移：随顶栏高度动态计算（默认 134px 与自定义顶栏不匹配）
  scrollOffset: {
    selector: '.VPNav',
    padding: 24,
  },
  // README 是开发说明，不应作为站点页面或进入搜索索引
  srcExclude: ['README.md'],
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  transformPageData(pageData) {
    if (
      !pageData.relativePath.startsWith(ARTICLES_PATH_PREFIX) ||
      pageData.relativePath === POSTS_INDEX_PATH
    ) {
      return
    }

    const filePath = path.join(process.cwd(), pageData.relativePath)
    if (!fs.existsSync(filePath)) return

    const content = stripFrontmatter(fs.readFileSync(filePath, 'utf-8'))
    return {
      frontmatter: {
        ...pageData.frontmatter,
        wordCount: countWords(content),
        pageClass: [pageData.frontmatter.pageClass, 'gm-article-doc']
          .flat()
          .filter(Boolean)
          .join(' '),
      },
    }
  },
  themeConfig: {
    logo: '/img/avatar.jpg',
    darkModeSwitchTitle: '切换到深色模式',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchLabel: '主题',
    returnToTopLabel: '返回顶部',
    skipToContentLabel: '跳到主要内容',
    sidebarMenuLabel: '菜单',
    langMenuLabel: '切换语言',
    nav: [
      { text: '文章', link: '/posts/' },
      { text: '标签', link: '/tags/' },
      { text: '关于', link: '/about/' },
    ],
    search: {
      provider: 'local',
      options: {
        _render: renderSearchableMarkdown,
        miniSearch: {
          options: {
            tokenize: tokenizeForSearch,
          },
          searchOptions: {
            fuzzy: 0.15,
            prefix: true,
            combineWith: 'AND',
            boost: { title: 4, text: 2, titles: 1 },
          },
          _splitIntoSections: (file, html) => splitIntoSectionsWithMeta(file, html),
        },
        translations: {
          button: {
            buttonText: '',
            buttonAriaLabel: '搜索',
          },
          modal: {
            noResultsText: '无搜索结果',
            resetButtonTitle: '清除',
            backButtonTitle: '关闭搜索',
            displayDetails: '显示详细列表',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
              selectKeyAriaLabel: '回车键',
              navigateUpKeyAriaLabel: '上方向键',
              navigateDownKeyAriaLabel: '下方向键',
              closeKeyAriaLabel: 'Esc 键',
            },
          },
        },
      },
    },
    footer: {
      copyright: `© ${new Date().getFullYear()} Kasei`,
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    outline: {
      label: '文章目录',
      level: [2, 3],
    },
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'long',
        timeStyle: 'medium',
      },
    },
  },
})
