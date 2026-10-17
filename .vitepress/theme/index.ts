import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import InstallWizard from './components/InstallWizard.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('InstallWizard', InstallWizard);
  },
} satisfies Theme;
