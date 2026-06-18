<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { useData, useRoute } from 'vitepress'
import { onKeyStroke } from '@vueuse/core'
import type { DefaultTheme } from 'vitepress/theme'
import NavAppearanceIcon from './NavAppearanceIcon.vue'

const VPLocalSearchBox = defineAsyncComponent(
  () => import('vitepress/dist/client/theme-default/components/VPLocalSearchBox.vue'),
)

const { theme } = useData()
const route = useRoute()
const showSearch = ref(false)

type NavLink = DefaultTheme.NavItemWithLink

const navLinks = computed(() =>
  (theme.value.nav ?? []).filter((item): item is NavLink => 'link' in item),
)

function normalizePath(path: string) {
  if (path === '/') return '/'
  return path.endsWith('/') ? path : `${path}/`
}

function isActive(link: string) {
  return normalizePath(route.path) === normalizePath(link)
}

function isEditingContent(event: KeyboardEvent) {
  const el = event.target as HTMLElement
  const tag = el.tagName
  return el.isContentEditable || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA'
}

onKeyStroke('k', (event) => {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
    showSearch.value = true
  }
})

onKeyStroke('/', (event) => {
  if (!isEditingContent(event)) {
    event.preventDefault()
    showSearch.value = true
  }
})
</script>

<template>
  <nav class="nav-right" aria-label="主导航">
    <a
      v-for="item in navLinks"
      :key="item.link"
      :href="item.link"
      class="nav-right-link"
      :class="{ active: isActive(item.link) }"
    >
      {{ item.text }}
    </a>

    <button
      type="button"
      class="nav-right-icon"
      aria-label="搜索"
      @click="showSearch = true"
    >
      <span class="vp-icon vpi-search" aria-hidden="true" />
    </button>

    <NavAppearanceIcon />

    <VPLocalSearchBox v-if="showSearch" @close="showSearch = false" />
  </nav>
</template>
