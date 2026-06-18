<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import VPLocalNavOutlineDropdown from 'vitepress/dist/client/theme-default/components/VPLocalNavOutlineDropdown.vue'
import { useData } from 'vitepress/dist/client/theme-default/composables/data.js'
import { useLocalNav } from 'vitepress/dist/client/theme-default/composables/local-nav.js'
import LocalNavSiteMenu from './LocalNavSiteMenu.vue'

const { frontmatter } = useData()
const { headers } = useLocalNav()

const navHeight = ref(0)

const show = computed(
  () =>
    frontmatter.value.layout !== 'home' &&
    frontmatter.value.layout !== 'page',
)

onMounted(() => {
  navHeight.value = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue(
      '--vp-nav-height',
    ),
  )
})
</script>

<template>
  <div v-if="show" class="VPLocalNav gm-local-nav has-sidebar">
    <div class="container">
      <LocalNavSiteMenu :navHeight="navHeight" />

      <VPLocalNavOutlineDropdown
        class="gm-local-nav-outline"
        :headers="headers"
        :navHeight="navHeight"
      />
    </div>
  </div>
</template>
