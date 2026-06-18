<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { formatDateOnly, toDateAttr } from '../utils/date'
import { normalizeTags } from '../../../utils/tags'
import { resolvePostCover } from '../../../utils/cover'
import { ARTICLES_PATH_PREFIX } from '../../../utils/paths'
import PostTags from './PostTags.vue'

const { page, frontmatter } = useData()

const show = computed(() => page.value.relativePath.startsWith(ARTICLES_PATH_PREFIX))

const articleTitle = computed(() =>
  String(frontmatter.value.title ?? page.value.title ?? ''),
)

const tags = computed(() => normalizeTags(frontmatter.value.tags))

const cover = computed(() => resolvePostCover(frontmatter.value.cover))

const wordCount = computed(() => {
  const count = frontmatter.value.wordCount
  return typeof count === 'number' && count > 0 ? count : null
})

const publishedAt = computed(() => formatDateOnly(frontmatter.value.date))
const dateTimeAttr = computed(() => toDateAttr(frontmatter.value.date))
</script>

<template>
  <header v-if="show" class="post-article-header">
    <div class="post-article-cover">
      <img
        class="post-article-cover-img"
        :src="cover"
        :alt="articleTitle"
        loading="eager"
        decoding="async"
      />
    </div>
    <div class="post-article-heading">
      <h1 class="post-article-title">{{ articleTitle }}</h1>
      <div class="post-article-meta-block">
        <p class="post-article-meta">
          <span v-if="wordCount !== null">{{ wordCount }} 字</span>
          <span v-if="wordCount !== null && publishedAt" class="post-article-meta-sep" aria-hidden="true">·</span>
          <time v-if="publishedAt" class="post-article-date" :datetime="dateTimeAttr">
            {{ publishedAt }}
          </time>
        </p>
        <PostTags v-if="tags.length" :tags="tags" class="post-article-tags" />
      </div>
    </div>
  </header>
</template>
