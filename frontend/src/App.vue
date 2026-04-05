<template>
  <n-config-provider :theme-overrides="aiSenseTheme">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-dialog-provider>

            <!-- 登录 / 403 等无侧边栏页面：直接全屏渲染 -->
            <div v-if="!showSider" class="fullscreen-view">
              <router-view />
            </div>

            <!-- 主应用布局 -->
            <div
              v-else
              :class="['root-layout-wrapper', { 'sidebar-collapsed': collapsed }]"
            >
              <!-- 左侧导航栏 -->
              <aside :class="['main-sider', { collapsed }]">
                <div class="sider-header-branding">
                  <div class="brand-logo">AI</div>
                  <span v-if="!collapsed" class="brand-name">自动化控制台</span>
                </div>
                <div
                  v-if="!collapsed && showReqDocSearch"
                  class="req-sider-search"
                >
                  <n-input
                    v-model:value="reqGroupSearch"
                    size="small"
                    clearable
                    placeholder="搜索文档…"
                  />
                </div>
                <n-menu
                  v-model:expanded-keys="expandedKeys"
                  :options="menuOptions"
                  :value="activeKey"
                  :collapsed="collapsed"
                  :collapsed-width="64"
                  :indent="18"
                  @update:value="handleMenuClick"
                />
                <button class="sider-trigger" @click="collapsed = !collapsed" aria-label="折叠侧边栏">
                  <n-icon :size="14" :component="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined" />
                </button>
              </aside>

              <!-- 右侧主体 -->
              <div class="main-body-container">
                <header class="main-header">
                  <n-text strong class="platform-title">企业级 AI 接口自动化平台</n-text>
                  <n-space align="center" :size="20">
                    <n-tag type="primary" ghost round size="small">{{ userStore.role }}</n-tag>
                    <n-dropdown :options="userOptions" @select="handleUserSelect">
                      <div class="user-avatar-trigger">
                        <n-avatar round size="small" :style="{ backgroundColor: '#7D33FF' }">
                          {{ userStore.username?.slice(0, 1).toUpperCase() }}
                        </n-avatar>
                        <n-text class="user-name">{{ userStore.username }}</n-text>
                      </div>
                    </n-dropdown>
                  </n-space>
                </header>
                <div class="view-content">
                  <router-view />
                </div>
              </div>
            </div>

          </n-dialog-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { h, Component, computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NConfigProvider, NMenu, NText, NAvatar, NSpace, NTag,
  NMessageProvider, NLoadingBarProvider, NNotificationProvider,
  NDialogProvider, NIcon, NDropdown, NBadge, NButton, NInput,
  createDiscreteApi
} from 'naive-ui'
import { aiSenseTheme } from './theme/theme'
import {
  DashboardOutlined, CloudServerOutlined, LineChartOutlined,
  UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  FileTextOutlined, LoadingOutlined, DeleteOutlined, TableOutlined
} from '@vicons/antd'
import { useUserStore } from './store/user'
import { useRequirementGroupsStore } from './store/requirementGroups'
import { message } from './utils/naive-api'
import type { RequirementGroupItem } from './api/requirement-groups'

/** App 根组件在 NDialogProvider 之外，不能使用 useDialog。用离散 API 即可在侧栏删除确认时弹出对话框。 */
const { dialog: discreteDialog } = createDiscreteApi(['dialog'])

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const reqGroups = useRequirementGroupsStore()
const collapsed = ref(false)
const reqGroupSearch = ref('')
const expandedKeys = ref<string[]>(['api-mgmt', 'requirement', 'auth-center'])

let groupsPoll: ReturnType<typeof setInterval> | null = null

const showSider = computed(() =>
  route.path !== '/login' && route.path !== '/' && route.path !== '/403'
)

const activeKey = computed(() => {
  const p = route.path
  if (p.startsWith('/test-cases/')) {
    const id = p.split('/')[2]
    return id ? `req-group-${id}` : 'requirement-cases'
  }
  if (p === '/requirement-test-cases') return 'requirement-test-cases'
  if (p.startsWith('/requirement-cases')) return 'requirement-cases'
  return route.path.split('/')[1] || 'dashboard'
})

const showReqDocSearch = computed(() => reqGroups.groups.length > 20)

const filteredDocGroups = computed(() => {
  const q = reqGroupSearch.value.trim().toLowerCase()
  const list = reqGroups.groups
  if (!q) return list
  return list.filter((g) => g.docTitle.toLowerCase().includes(q))
})

const renderIcon = (icon: Component) => () => h(NIcon, null, { default: () => h(icon) })

function formatDocMenuTitle(docTitle: string, version: number) {
  return `${docTitle} v${version}.0`
}

function isGroupGenerating(g: RequirementGroupItem) {
  return g.status === 'generating' || g.status === 'pending'
}

function confirmDeleteGroup(g: RequirementGroupItem) {
  discreteDialog.warning({
    title: '删除需求文档',
    content: `将删除「${g.docTitle}」及其全部用例，此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await reqGroups.remove(g.id)
        message.success('已删除')
        if (route.path === `/test-cases/${g.id}`) {
          await router.push('/requirement-cases')
        }
      } catch {
        message.error('删除失败')
      }
    }
  })
}

function renderDocMenuLabel(g: RequirementGroupItem) {
  const busy = isGroupGenerating(g)
  return () =>
    h('div', { class: 'req-menu-doc-row' }, [
      h('div', { class: 'req-menu-doc-main' }, [
        h(NIcon, {
          size: 14,
          class: 'req-menu-doc-file-ico',
          component: FileTextOutlined
        }),
        h(
          'span',
          { class: 'req-menu-doc-title' },
          formatDocMenuTitle(g.docTitle, g.version)
        ),
        busy
          ? h(NIcon, {
              size: 14,
              class: 'req-menu-doc-loading',
              component: LoadingOutlined
            })
          : null,
        h(NBadge, {
          value: g.caseCount,
          max: 99,
          showZero: true,
          type: 'default',
          class: 'req-menu-doc-badge'
        })
      ]),
      h(
        NButton,
        {
          quaternary: true,
          size: 'tiny',
          class: 'req-menu-doc-del',
          onClick: (e: MouseEvent) => {
            e.stopPropagation()
            e.preventDefault()
            confirmDeleteGroup(g)
          }
        },
        { default: () => h(NIcon, { size: 14, component: DeleteOutlined }) }
      )
    ])
}

function buildRequirementChildren() {
  const uploadItem = {
    label: '需求生成用例',
    key: 'requirement-cases',
    icon: renderIcon(FileTextOutlined)
  }
  const manualCasesItem = {
    label: '测试用例',
    key: 'requirement-test-cases',
    icon: renderIcon(TableOutlined)
  }

  const docs = filteredDocGroups.value
  if (reqGroups.groups.length === 0) {
    return [
      uploadItem,
      manualCasesItem,
      {
        key: 'req-empty',
        disabled: true,
        label: () =>
          h(NText, { depth: 3, style: 'font-size:12px' }, { default: () => '暂无文档，请在上方上传' })
      }
    ]
  }

  if (docs.length === 0) {
    return [
      uploadItem,
      manualCasesItem,
      {
        key: 'req-no-match',
        disabled: true,
        label: () =>
          h(NText, { depth: 3, style: 'font-size:12px' }, { default: () => '无匹配文档' })
      }
    ]
  }

  const docItems = docs.map((g) => ({
    key: `req-group-${g.id}`,
    label: renderDocMenuLabel(g)
  }))
  return [uploadItem, manualCasesItem, ...docItems]
}

const menuOptions = computed(() => [
  { label: '仪表盘', key: 'dashboard', icon: renderIcon(DashboardOutlined) },
  {
    label: '接口管理', key: 'api-mgmt', icon: renderIcon(CloudServerOutlined),
    children: [
      { label: '单接口测试', key: 'interface-test' },
      { label: '自动化测试', key: 'test-scenarios' },
      { label: '环境管理', key: 'env-mgmt' }
    ]
  },
  {
    label: '需求用例',
    key: 'requirement',
    icon: renderIcon(FileTextOutlined),
    children: buildRequirementChildren()
  },
  { label: '执行报告', key: 'reports', icon: renderIcon(LineChartOutlined) },
  {
    label: '认证中心', key: 'auth-center', icon: renderIcon(UserOutlined),
    children: [
      { label: '角色管理', key: 'role-mgmt' },
      { label: '用户管理', key: 'user-mgmt' }
    ]
  }
])

const userOptions = [
  { label: '个人中心', key: 'account', icon: renderIcon(UserOutlined) },
  { label: '退出登录', key: 'logout', icon: renderIcon(LogoutOutlined) }
]

function handleMenuClick(key: string) {
  if (key === 'req-empty' || key === 'req-no-match') return
  if (key === 'requirement-test-cases') {
    void router.push('/requirement-test-cases')
    return
  }
  if (key.startsWith('req-group-')) {
    const id = key.replace('req-group-', '')
    void router.push(`/test-cases/${id}`)
    return
  }
  void router.push(`/${key}`)
}

const handleUserSelect = (key: string) => {
  if (key === 'logout') {
    userStore.logout()
    message.success('已安全退出')
    void router.push('/login')
  } else {
    void router.push(`/${key}`)
  }
}

onMounted(async () => {
  await reqGroups.load()
  groupsPoll = setInterval(() => {
    if (reqGroups.hasGenerating) void reqGroups.load()
  }, 5000)
})

onUnmounted(() => {
  if (groupsPoll) {
    clearInterval(groupsPoll)
    groupsPoll = null
  }
})

watch(showSider, (v) => {
  if (v) void reqGroups.load()
})
</script>

<style>
@import "./styles/design-tokens.css";

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: var(--font-family-base);
  background: var(--color-bg-page);
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* ── 全屏页（登录 / 403）── */
.fullscreen-view {
  position: fixed;
  inset: 0;
  overflow: hidden;
}

/* ══════════════════════════════
   根布局：Grid 双列
══════════════════════════════ */
.root-layout-wrapper {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: 1fr;
  overflow: hidden;
  z-index: var(--z-base);
  transition: grid-template-columns var(--duration-normal) var(--ease-standard);
}

.root-layout-wrapper.sidebar-collapsed {
  grid-template-columns: var(--sidebar-width-collapsed) 1fr;
}

/* ── 左侧导航栏 ── */
.main-sider {
  grid-column: 1;
  height: 100vh;
  background: var(--color-bg-surface);
  border-right: 1px solid var(--color-border-subtle);
  box-shadow: 1px 0 0 var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: var(--z-sticky);
}

.main-sider :deep(.n-menu) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.sider-header-branding {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 18px;
  border-bottom: 1px solid var(--color-border-subtle);
  gap: var(--space-2);
  flex-shrink: 0;
  overflow: hidden;
}

.brand-logo {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-accent-400));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  font-weight: var(--font-bold);
  font-size: var(--text-base);
  flex-shrink: 0;
}

.brand-name {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
}

.sider-trigger {
  position: absolute;
  bottom: 20px;
  right: -10px;
  width: 20px;
  height: 20px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-tertiary);
  box-shadow: var(--shadow-sm);
  transition: color var(--duration-fast), box-shadow var(--duration-fast);
  z-index: var(--z-raised);
}
.sider-trigger:hover {
  color: var(--color-primary-500);
  box-shadow: var(--shadow-primary-sm);
}

/* ── 右侧主体 ── */
.main-body-container {
  grid-column: 2;
  height: 100vh;
  display: grid;
  grid-template-rows: var(--header-height) 1fr;
  min-width: 0;
  overflow: hidden;
  background: var(--color-bg-page);
}

/* ── 顶部 Header ── */
.main-header {
  grid-row: 1;
  width: 100%;
  padding: 0 var(--page-padding-x);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-xs);
  z-index: var(--z-sticky);
}

/* ── 路由视图容器 ── */
.view-content {
  grid-row: 2;
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.view-content > * {
  position: absolute;
  inset: 0;
  overflow: auto;
}

/* ── 用户头像 / 下拉 ── */
.user-avatar-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  transition: background var(--duration-fast);
}
.user-avatar-trigger:hover { background: var(--color-gray-100); }
.user-name {
  margin-left: var(--space-2);
  font-weight: var(--font-medium);
  font-size: var(--text-md);
  color: var(--color-text-primary);
}

/* 需求文档子菜单 */
.req-sider-search {
  padding: 0 12px 10px;
  flex-shrink: 0;
}
.req-menu-doc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
  min-width: 0;
  padding-right: 2px;
}
.req-menu-doc-main {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}
.req-menu-doc-file-ico {
  flex-shrink: 0;
  color: var(--color-text-tertiary);
}
.req-menu-doc-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}
.req-menu-doc-loading {
  flex-shrink: 0;
  animation: req-sider-spin 0.85s linear infinite;
  color: var(--color-primary-500);
}
@keyframes req-sider-spin {
  to { transform: rotate(360deg); }
}
.req-menu-doc-badge :deep(.n-badge-sup) {
  font-weight: 500;
  background: rgba(125, 51, 255, 0.12) !important;
  color: var(--color-text-secondary) !important;
  font-size: 11px;
}
.req-menu-doc-del {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.req-menu-doc-row:hover .req-menu-doc-del {
  opacity: 1;
}
</style>
