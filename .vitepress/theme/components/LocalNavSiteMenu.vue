<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'

const props = defineProps<{
  navHeight: number
}>()

const { theme } = useData()
const route = useRoute()

const open = ref(false)
const vh = ref(0)
const main = ref<HTMLDivElement>()

type NavLink = DefaultTheme.NavItemWithLink

const siteLinks = computed(() => {
  const links: NavLink[] = [{ text: '主页', link: '/' }]
  const nav = (theme.value.nav ?? []).filter(
    (item): item is NavLink => 'link' in item,
  )
  for (const item of nav) {
    if (!links.some((link) => link.link === item.link)) {
      links.push(item)
    }
  }
  return links
})

function normalizePath(path: string) {
  if (path === '/') return '/'
  return path.endsWith('/') ? path : `${path}/`
}

function isActive(link: string) {
  return normalizePath(route.path) === normalizePath(link)
}

function closeOnClickOutside(e: Event) {
  if (!main.value?.contains(e.target as Node)) {
    open.value = false
  }
}

watch(open, (value) => {
  if (value) {
    document.addEventListener('click', closeOnClickOutside)
    return
  }
  document.removeEventListener('click', closeOnClickOutside)
})

onKeyStroke('Escape', () => {
  open.value = false
})

function toggle() {
  open.value = !open.value
  vh.value = window.innerHeight + Math.min(window.scrollY - props.navHeight, 0)
}

function close() {
  open.value = false
}

defineExpose({ close })
</script>

<template>
  <div
    ref="main"
    class="gm-local-nav-dropdown gm-local-nav-site-menu"
    :style="{ '--vp-vh': vh + 'px' }"
  >
    <button
      type="button"
      class="trigger"
      :class="{ open }"
      :aria-expanded="open"
      @click="toggle"
    >
      <span class="vpi-align-left icon" aria-hidden="true" />
      <span class="label">{{ theme.sidebarMenuLabel || '菜单' }}</span>
    </button>

    <Transition name="flyout">
      <div v-if="open" class="panel">
        <nav class="links" aria-label="站点导航">
          <a
            v-for="item in siteLinks"
            :key="item.link"
            :href="item.link"
            class="link"
            :class="{ active: isActive(item.link) }"
            @click="close"
          >
            {{ item.text }}
          </a>
        </nav>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.gm-local-nav-dropdown {
  position: relative;
}

.trigger {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  line-height: var(--gm-local-nav-lh);
  font-size: var(--gm-local-nav-fs);
  font-weight: var(--gm-font-weight-medium);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: color 0.25s;
}

.trigger:hover,
.trigger.open {
  color: var(--vp-c-text-1);
}

.icon {
  margin-right: 0.5rem;
  font-size: 0.875rem;
}

.panel {
  position: absolute;
  top: calc(100% + var(--gm-local-nav-flyout-gap));
  left: 0;
  z-index: calc(var(--vp-z-index-local-nav) + 1);
  min-width: 10rem;
  border: 1px solid var(--gm-surface-panel-border);
  border-radius: 8px;
  background-color: var(--gm-surface-panel);
  box-shadow: var(--vp-shadow-3);
  overflow: hidden;
}

.links {
  display: flex;
  flex-direction: column;
  padding: 0.375rem 0;
}

.link {
  display: block;
  padding: 0.625rem 1rem;
  line-height: 1.375rem;
  font-size: var(--gm-font-size-sm);
  font-weight: var(--gm-font-weight-medium);
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s, background-color 0.2s;
}

.link:hover {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-default-soft);
}

.link.active {
  color: var(--vp-c-brand-1);
}

.flyout-enter-active {
  transition: all 0.2s ease-out;
}

.flyout-leave-active {
  transition: all 0.15s ease-in;
}

.flyout-enter-from,
.flyout-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
