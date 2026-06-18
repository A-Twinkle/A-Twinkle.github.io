<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../../../posts.data'
import type { Post } from '../../../posts.data'
import PostCard from './PostCard.vue'

interface YearGroup {
  year: number
  posts: Post[]
}

const groupedByYear = computed<YearGroup[]>(() => {
  const map = new Map<number, Post[]>()

  for (const post of posts) {
    const year = new Date(post.date).getFullYear()
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(post)
  }

  return [...map.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, yearPosts]) => ({ year, posts: yearPosts }))
})
</script>

<template>
  <div class="page-with-hero">
    <div class="posts-archive-content">
      <h1 class="posts-archive-title">文章</h1>

      <div v-if="posts.length === 0" class="posts-empty">
        <p>暂无文章。</p>
      </div>

      <template v-else>
        <section v-for="group in groupedByYear" :key="group.year" class="posts-year-group">
          <h2 class="posts-year">{{ group.year }}</h2>
          <ul class="post-card-list">
            <li v-for="post in group.posts" :key="post.url">
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
      </template>
    </div>
  </div>
</template>
