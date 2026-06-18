<script setup lang="ts">
import { inject, ref, watchPostEffect } from 'vue'
import { useData } from 'vitepress'

const { isDark, theme } = useData()

const toggleAppearance = inject('toggle-appearance', () => {
  isDark.value = !isDark.value
})

const title = ref('')

watchPostEffect(() => {
  title.value = isDark.value
    ? theme.value.lightModeSwitchTitle || '切换到浅色模式'
    : theme.value.darkModeSwitchTitle || '切换到深色模式'
})
</script>

<template>
  <button
    type="button"
    class="nav-appearance-icon"
    :aria-label="title"
    :title="title"
    @click="toggleAppearance"
  >
    <span class="vpi-sun sun" aria-hidden="true" />
    <span class="vpi-moon moon" aria-hidden="true" />
  </button>
</template>
