<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { inBrowser, useRoute, useRouter } from 'vitepress'
import { data as posts } from '../../../posts.data'
import PostCard from './PostCard.vue'
import {
  RECENT_TAG_LABEL,
  buildTagStats,
  tagPageUrl,
} from '../../../utils/tags'

const route = useRoute()
const router = useRouter()
const queryNonce = ref(0)

function readSelectedTag(): string {
  if (!inBrowser) return ''
  return new URLSearchParams(window.location.search).get('tag') ?? ''
}

const selectedTag = computed(() => {
  queryNonce.value
  return readSelectedTag()
})

function syncSelectedTag() {
  queryNonce.value++
}

const tagStats = computed(() => buildTagStats(posts))

const filteredPosts = computed(() => {
  if (!selectedTag.value || selectedTag.value === RECENT_TAG_LABEL) {
    return posts
  }
  return posts.filter((post) => post.tags.includes(selectedTag.value))
})

const isRecentActive = computed(
  () => !selectedTag.value || selectedTag.value === RECENT_TAG_LABEL,
)

function isTagActive(name: string) {
  return selectedTag.value === name
}

let previousAfterRouteChange = router.onAfterRouteChange

onMounted(() => {
  syncSelectedTag()
  window.addEventListener('popstate', syncSelectedTag)
  previousAfterRouteChange = router.onAfterRouteChange
  router.onAfterRouteChange = async (href) => {
    await previousAfterRouteChange?.(href)
    syncSelectedTag()
  }
})

onUnmounted(() => {
  window.removeEventListener('popstate', syncSelectedTag)
  router.onAfterRouteChange = previousAfterRouteChange
})

watch(() => route.path, syncSelectedTag)
</script>

<template>
  <div class="page-with-hero">
    <div class="tags-page-content">
      <h1 class="tags-page-title">标签</h1>

      <div class="tags-layout">
        <aside class="tags-sidebar" aria-label="标签列表">
          <nav class="tags-nav">
            <a
              :href="tagPageUrl()"
              class="tags-nav-link"
              :class="{ active: isRecentActive }"
            >
              <span class="tags-nav-pair">
                <span class="tags-nav-name">{{ RECENT_TAG_LABEL }}</span>
                <span class="tags-nav-count">{{ posts.length }}</span>
              </span>
            </a>
            <a
              v-for="tag in tagStats"
              :key="tag.name"
              :href="tagPageUrl(tag.name)"
              class="tags-nav-link"
              :class="{ active: isTagActive(tag.name) }"
            >
              <span class="tags-nav-pair">
                <span class="tags-nav-name">{{ tag.name }}</span>
                <span class="tags-nav-count">{{ tag.count }}</span>
              </span>
            </a>
          </nav>
        </aside>

        <section class="tags-posts" aria-label="文章列表">
          <p v-if="filteredPosts.length === 0" class="tags-empty">
            该标签下暂无文章。
          </p>
          <ul v-else class="post-card-list tags-post-list">
            <li v-for="post in filteredPosts" :key="post.url">
              <PostCard
                :url="post.url"
                :title="post.title"
                :date="post.date"
                :tags="post.tags"
                :cover="post.cover"
              />
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>
