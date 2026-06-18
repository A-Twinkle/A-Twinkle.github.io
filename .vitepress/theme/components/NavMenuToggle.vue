<script setup lang="ts">
import { inBrowser } from 'vitepress'
import { onMounted, onUnmounted, ref } from 'vue'

const open = ref(false)
let observer: MutationObserver | undefined

onMounted(() => {
  if (!inBrowser) return

  const bar = document.querySelector('.VPNavBar')
  if (!bar) return

  const sync = () => {
    open.value = bar.classList.contains('screen-open')
  }

  sync()
  observer = new MutationObserver(sync)
  observer.observe(bar, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  observer?.disconnect()
})

function toggle() {
  document.querySelector<HTMLButtonElement>('.VPNavBarHamburger')?.click()
}
</script>

<template>
  <button
    type="button"
    class="nav-menu-toggle"
    :class="{ open }"
    aria-label="打开菜单"
    :aria-expanded="open"
    aria-controls="VPNavScreen"
    @click="toggle"
  >
    <span class="line line-a" aria-hidden="true" />
    <span class="line line-b" aria-hidden="true" />
  </button>
</template>
