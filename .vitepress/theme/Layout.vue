<script setup lang="ts">
import BlogLayout from './BlogLayout.vue'
import NavRight from './components/NavRight.vue'
import NavMenuToggle from './components/NavMenuToggle.vue'
import PostArticleHeader from './components/PostArticleHeader.vue'
</script>

<template>
  <BlogLayout>
    <template #nav-bar-content-after>
      <NavRight />
      <NavMenuToggle />
    </template>
    <template #doc-top>
      <PostArticleHeader />
    </template>
  </BlogLayout>
</template>
