<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress/dist/client/theme-default/composables/data'

const { theme } = useData()
const { y } = useWindowScroll()

/** 滚过约一屏或 400px 后显示（取较大值） */
const threshold = ref(400)

onMounted(() => {
  threshold.value = Math.max(400, window.innerHeight * 0.6)
})

const visible = computed(() => y.value > threshold.value)

const label = computed(
  () => theme.value.returnToTopLabel || '返回顶部',
)

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}
</script>

<template>
  <Transition name="back-to-top">
    <button
      v-if="visible"
      type="button"
      class="back-to-top"
      :aria-label="label"
      :title="label"
      @click="scrollToTop"
    >
      <span class="vpi-arrow-up back-to-top-icon" aria-hidden="true" />
    </button>
  </Transition>
</template>
