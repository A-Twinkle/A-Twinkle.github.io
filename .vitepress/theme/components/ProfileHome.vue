<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../../../posts.data'
import PostCard from './PostCard.vue'

const recentPosts = computed(() => posts.slice(0, 5))
</script>

<template>
  <div class="page-with-hero">
    <div class="profile-home">
      <div class="profile-header">
        <img class="profile-avatar" src="/img/avatar.jpg" alt="头像" width="144" height="144" />
        <h1 class="profile-title">Kasei</h1>
        <p class="profile-headline">记录思考与创作</p>
      </div>

      <section class="profile-recent">
        <h2 class="profile-recent-title">最近</h2>
        <p v-if="recentPosts.length === 0" class="profile-empty">暂无文章。</p>
        <ul v-else class="post-card-list">
          <li v-for="post in recentPosts" :key="post.url">
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
</template>
