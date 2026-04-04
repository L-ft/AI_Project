// Step 4: Vue 3 - Role-based Guards & UI Components
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true, role: 'TESTER' }
    },
    {
      path: '/api-mgmt',
      component: () => import('@/views/Placeholder.vue'),
      meta: { requiresAuth: true, role: 'TESTER' }
    },
    {
      path: '/interface-test',
      component: () => import('@/views/InterfaceTest.vue'),
      meta: { requiresAuth: true, role: 'TESTER' }
    },
    {
      path: '/test-scenarios',
      component: () => import('@/views/TestScenarios.vue'),
      meta: { requiresAuth: true, role: 'TESTER' }
    },
    {
      path: '/requirement',
      redirect: '/requirement-cases'
    },
    {
      path: '/requirement-cases',
      component: () => import('@/views/RequirementCaseGen.vue'),
      meta: { requiresAuth: true, role: 'TESTER' }
    },
    {
      path: '/env-mgmt',
      component: () => import('@/views/EnvManagement.vue'),
      meta: { requiresAuth: true, role: 'TESTER' }
    },
    {
      path: '/role-mgmt',
      component: () => import('@/views/RoleManagement.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path: '/user-mgmt',
      component: () => import('@/views/UserManagement.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path: '/reports',
      component: () => import('@/views/ExecutionReports.vue'),
      meta: { requiresAuth: true, role: 'TESTER' }
    },
    {
      path: '/account',
      component: () => import('@/views/AccountCenter.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/403',
      component: () => import('@/views/403.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = userStore.isLoggedIn
  const userRole = userStore.role

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.role) {
    const roleHierarchy: Record<string, number> = { 'ADMIN': 1, 'DEV': 2, 'TESTER': 3 }
    const userLevel = roleHierarchy[userRole] || 99
    const requiredLevel = roleHierarchy[to.meta.role as string] || 99

    if (userLevel <= requiredLevel) {
      next()
    } else {
      next('/403') // 权限不足
    }
  } else {
    next()
  }
})

export default router
