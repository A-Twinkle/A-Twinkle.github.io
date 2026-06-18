<script setup lang="ts">
import { tagPageUrl } from '../../../utils/tags'

withDefaults(
  defineProps<{
    tags: string[]
    linked?: boolean
  }>(),
  { linked: true },
)
</script>

<template>
  <ul v-if="tags.length" class="post-tags" :class="{ 'is-linked': linked }">
    <li v-for="tag in tags" :key="tag" class="post-tags-item">
      <a v-if="linked" class="post-tag" :href="tagPageUrl(tag)">{{ tag }}</a>
      <span v-else class="post-tag">{{ tag }}</span>
    </li>
  </ul>
</template>
