import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import InstallWizard from './components/InstallWizard.vue';
import HomeLanding from './components/HomeLanding.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () => h(HomeLanding),
    });
  },
  enhanceApp({ app }) {
    app.component('InstallWizard', InstallWizard);
  },
} satisfies Theme;
