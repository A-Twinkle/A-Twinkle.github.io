import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ProfileHome from './components/ProfileHome.vue'
import PostsArchive from './components/PostsArchive.vue'
import AboutPage from './components/AboutPage.vue'
import TagsPage from './components/TagsPage.vue'
import Layout from './Layout.vue'
import GMDocAside from './components/GMDocAside.vue'
import './styles/index.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // VPDoc 链为本地 import，实际替换见 config.ts vite.resolve.alias
    app.component('VPDocAside', GMDocAside)
    app.component('ProfileHome', ProfileHome)
    app.component('PostsArchive', PostsArchive)
    app.component('AboutPage', AboutPage)
    app.component('TagsPage', TagsPage)
  },
} satisfies Theme
