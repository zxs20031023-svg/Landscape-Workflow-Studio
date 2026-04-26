import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    {
      path: '/',
      redirect: '/overview'
    },
    {
      path: '/overview',
      name: 'overview',
      component: () => import('@/views/overview/OverviewView.vue')
    },
    {
      path: '/knowledge-base',
      name: 'knowledge-base',
      component: () => import('@/views/knowledge-base/KnowledgeBaseView.vue')
    },
    {
      path: '/site-analysis',
      name: 'site-analysis',
      component: () => import('@/views/site-analysis/SiteAnalysisView.vue')
    },
    {
      path: '/design-brief',
      name: 'design-brief',
      component: () => import('@/views/design-brief/DesignBriefView.vue')
    },
    {
      path: '/project-assets',
      name: 'project-assets',
      component: () => import('@/views/project-assets/ProjectAssetsView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/settings/SettingsView.vue')
    }
  ]
});

export default router;
