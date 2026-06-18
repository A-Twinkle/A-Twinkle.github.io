<script setup lang="ts">
import { formatDateOnly, toDateAttr } from '../utils/date'
import PostTags from './PostTags.vue'

defineProps<{
  url: string
  title: string
  date: string
  tags?: string[]
  cover: string
}>()
</script>

<template>
  <article class="post-card-wrap">
    <a :href="url" class="post-card">
      <div class="post-card-cover" aria-hidden="true">
        <img
          class="post-card-cover-img"
          :src="cover"
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="post-card-body">
        <header class="post-card-header">
          <h2 class="post-card-title">{{ title }}</h2>
        </header>
        <div class="post-card-meta">
          <time class="post-card-date" :datetime="toDateAttr(date) || date">
            {{ formatDateOnly(date) }}
          </time>
          <PostTags v-if="tags?.length" :tags="tags" :linked="false" class="post-card-tags" />
        </div>
      </div>
    </a>
  </article>
</template>
