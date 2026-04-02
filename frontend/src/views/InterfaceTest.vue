<template>
  <n-layout has-sider position="absolute" class="it-root">

    <!-- ═══════════════ 左侧目录树面板 ═══════════════ -->
    <n-layout-sider
      :width="260"
      :native-scrollbar="false"
      class="it-sider"
    >
      <!-- 搜索框 + 新建按钮（同一行） -->
      <div class="it-sider-toolbar">
        <div class="it-sider-search-wrap">
          <svg class="it-search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="pattern"
            class="it-sider-search-input"
            placeholder="搜索..."
          />
        </div>
        <n-dropdown
          trigger="click"
          :options="newOptions"
          placement="bottom-end"
          @select="handleNewOption"
        >
          <button class="it-sider-add-btn" title="新建接口 / 目录">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </n-dropdown>
      </div>

      <!-- 目录树 -->
      <div class="it-tree-wrap">
        <div v-if="treeData.length === 0" class="it-tree-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5">
            <path d="M3 3h7l2 2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
          </svg>
          <p>暂无接口<br/>点击「+」新建</p>
        </div>
        <n-tree
          v-else
          block-line
          expand-on-click
          :data="treeData"
          :pattern="pattern"
          :render-label="renderLabel"
          :render-prefix="renderPrefix"
          :render-suffix="renderSuffix"
          :on-update:selected-keys="handleSelect"
          :selected-keys="selectedKeys"
          :expanded-keys="expandedKeys"
          :on-update:expanded-keys="handleExpand"
          :node-props="nodeProps"
          :virtual-scroll="true"
          class="it-tree"
        />
      </div>
    </n-layout-sider>

    <!-- ═══════════════ 右侧主区 ═══════════════ -->
    <n-layout :native-scrollbar="false" class="it-main">

      <!-- 顶栏 -->
      <PageTopbar
        title="单接口测试"
        badge="Beta"
        :breadcrumbs="tabs.length > 0 ? ['接口管理', '单接口测试', activeTabLabel] : ['接口管理', '单接口测试']"
      >
        <template #icon><n-icon :component="ApiOutlined" :size="18" /></template>
        <template #right>
          <div v-if="tabs.length > 0" class="it-topbar-env">
            <span class="it-topbar-env-label">运行环境</span>
            <n-select
              v-model:value="selectedEnvId"
              placeholder="选择环境"
              size="small"
              style="width: 150px"
              :options="envOptions"
            />
          </div>
          <div v-else class="it-topbar-pills">
            <span class="it-topbar-pill it-topbar-pill--green">
              <i class="it-pill-dot"></i>服务在线
            </span>
            <span class="it-topbar-pill">{{ stats.total }} 个接口</span>
          </div>
        </template>
      </PageTopbar>

      <!-- 主内容 -->
      <div class="it-content-area">
        <transition name="it-fade" mode="out-in">

          <!-- ── 工作区（有 Tab 时） ── -->
          <div v-if="tabs.length > 0" key="work" class="it-work-wrap">
            <n-tabs
              v-model:value="activeKey"
              type="card"
              closable
              animated
              @close="removeTab"
              class="it-work-tabs"
            >
              <n-tab-pane
                v-for="tab in tabs"
                :key="tab.key"
                :name="tab.key"
                :tab="tab.label"
                display-directive="if"
              >
                <div class="it-tab-body">
                  <n-tabs
                    type="line"
                    class="sub-nav-tabs"
                    justify-content="start"
                    :value="subTabByTabKey[tab.key] ?? (tab.isTestCase ? 'debug' : 'design')"
                    @update:value="(v) => { subTabByTabKey[tab.key] = v }"
                  >
                    <n-tab-pane v-if="!tab.isTestCase" name="design" tab="编辑">
                      <ApiDesignView
                        :data="tab"
                        :env-base-url="selectedEnvBaseUrl"
                        @switch-debug="handleSwitchToDebug(tab.key)"
                      />
                    </n-tab-pane>
                    <n-tab-pane name="debug" :tab="tab.isTestCase ? tab.label : '调试'">
                      <ApiDebugView
                        :data="tab"
                        :env-base-url="selectedEnvBaseUrl"
                        :env-id="selectedEnvId"
                        @save-success="refreshTree"
                        @delete-success="() => { refreshTree(); removeTab(tab.key); }"
                      />
                    </n-tab-pane>
                    <n-tab-pane v-if="!tab.isTestCase" name="testcase" tab="测试用例">
                      <ApiTestCaseView
                        :data="tab"
                        :env-base-url="selectedEnvBaseUrl"
                        :env-id="selectedEnvId"
                      />
                    </n-tab-pane>
                  </n-tabs>
                </div>
              </n-tab-pane>
            </n-tabs>
          </div>

          <!-- ── 欢迎 / 引导区（无 Tab 时） ── -->
          <div v-else key="welcome" class="it-welcome-wrap">

            <!-- Hero：发光图标 -->
            <div class="it-hero">
              <div class="it-hero-glow-ring it-hero-ring-3"></div>
              <div class="it-hero-glow-ring it-hero-ring-2"></div>
              <div class="it-hero-glow-ring it-hero-ring-1"></div>
              <div class="it-hero-icon-box">
                <n-icon :component="ApiOutlined" :size="32" class="it-hero-icon" />
              </div>
              <h2 class="it-hero-title">API 接口管理平台</h2>
              <p class="it-hero-sub">从左侧目录树选择接口，或新建接口开始测试之旅</p>
              <div class="it-hero-actions">
                <button class="it-hero-btn it-hero-btn--primary" @click="handlePlus">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  新建接口
                </button>
                <button class="it-hero-btn it-hero-btn--ghost" @click="handleNewFolder">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  新建目录
                </button>
              </div>
            </div>

            <!-- 统计卡片行 -->
            <div class="it-stats-row">
              <div class="it-stat-card it-stat-card--blue">
                <div class="it-stat-icon">
                  <n-icon :component="ApiOutlined" :size="22" />
                </div>
                <div class="it-stat-body">
                  <div class="it-stat-num">{{ stats.total }}</div>
                  <div class="it-stat-label">接口总数</div>
                </div>
                <div class="it-stat-trend it-stat-trend--up">↑</div>
              </div>
              <div class="it-stat-card it-stat-card--green">
                <div class="it-stat-icon">
                  <n-icon :component="CheckCircleOutlined" :size="22" />
                </div>
                <div class="it-stat-body">
                  <div class="it-stat-num">{{ stats.successRate }}%</div>
                  <div class="it-stat-label">成功率</div>
                </div>
                <div class="it-stat-trend it-stat-trend--up">↑</div>
              </div>
              <div class="it-stat-card it-stat-card--amber">
                <div class="it-stat-icon">
                  <n-icon :component="ClockCircleOutlined" :size="22" />
                </div>
                <div class="it-stat-body">
                  <div class="it-stat-num">{{ stats.avgTime }}ms</div>
                  <div class="it-stat-label">平均耗时</div>
                </div>
                <div class="it-stat-trend it-stat-trend--down">↓</div>
              </div>
              <div class="it-stat-card it-stat-card--purple">
                <div class="it-stat-icon">
                  <n-icon :component="PieChartOutlined" :size="22" />
                </div>
                <div class="it-stat-body">
                  <div class="it-stat-num">{{ stats.coverage }}%</div>
                  <div class="it-stat-label">覆盖率</div>
                </div>
                <div class="it-stat-trend it-stat-trend--up">↑</div>
              </div>
            </div>

            <!-- 功能卡片行 -->
            <div class="it-feature-row">
              <div class="it-feat-card it-feat-card--debug" @click="handlePlus">
                <div class="it-feat-card-bg"></div>
                <div class="it-feat-icon-wrap">
                  <n-icon :component="ThunderboltOutlined" :size="28" />
                </div>
                <h3 class="it-feat-title">接口调试</h3>
                <p class="it-feat-desc">高性能调试引擎，支持毫秒级请求与实时响应分析</p>
                <div class="it-feat-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
              </div>
              <div class="it-feat-card it-feat-card--mock">
                <div class="it-feat-card-bg"></div>
                <div class="it-feat-icon-wrap">
                  <n-icon :component="CloudOutlined" :size="28" />
                </div>
                <h3 class="it-feat-title">智能 Mock</h3>
                <p class="it-feat-desc">基于 Schema 自动生成测试数据，告别手写 Mock</p>
                <div class="it-feat-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
              </div>
              <div class="it-feat-card it-feat-card--env">
                <div class="it-feat-card-bg"></div>
                <div class="it-feat-icon-wrap">
                  <n-icon :component="DatabaseOutlined" :size="28" />
                </div>
                <h3 class="it-feat-title">环境管理</h3>
                <p class="it-feat-desc">多环境一键切换，变量自动替换，告别重复配置</p>
                <div class="it-feat-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
              </div>
            </div>

          </div>
        </transition>
      </div>
    </n-layout>
  </n-layout>

  <!-- 新建目录弹窗 -->
  <NewFolderModal
    v-model:visible="showNewFolderModal"
    :folders="treeData"
    :edit-data="editFolderData"
    @success="onFolderCreated"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from 'vue'
import {
  NTabs, NTabPane, NIcon, NSelect, NLayout, NLayoutSider,
  NTree, NDropdown, useMessage, useDialog
} from 'naive-ui'
import {
  ThunderboltOutlined, CloudOutlined, DatabaseOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined,
  FolderOutlined, FolderOpenOutlined, FileTextOutlined,
  ApiOutlined, CheckCircleOutlined, ClockCircleOutlined,
  PieChartOutlined, FolderAddOutlined
} from '@vicons/antd'
import ApiDesignView from '../components/ApiDesignView.vue'
import ApiDebugView from '../components/ApiDebugView.vue'
import ApiTestCaseView from '../components/ApiTestCaseView.vue'
import NewFolderModal from '../components/NewFolderModal.vue'
import PageTopbar from '../components/PageTopbar.vue'
import execRequest from '../api/exec-request'

const message = useMessage()
const dialog = useDialog()

const activeKey = ref('')
const tabs = ref<any[]>([])
const subTabByTabKey = reactive<Record<string, string>>({})
const activeTabLabel = computed(() => tabs.value.find(x => x.key === activeKey.value)?.label ?? '—')

const environments = ref<any[]>([])
const selectedEnvId = ref<number | string | null>(null)

const envOptions = computed(() => {
  if (environments.value.length === 0) return [{ label: '暂无环境', value: '__empty__', disabled: true }]
  return environments.value.map(e => ({ label: e.name, value: e.id }))
})

const selectedEnvBaseUrl = computed(() => environments.value.find(e => e.id === selectedEnvId.value)?.base_url || '')

const stats = computed(() => {
  const total = countApiNodes(treeData.value)
  return {
    total,
    successRate: total > 0 ? 98 : 0,
    avgTime: total > 0 ? 142 : 0,
    coverage: total > 0 ? 87 : 0,
  }
})

function countApiNodes(nodes: TreeNode[]): number {
  let n = 0
  for (const node of nodes) {
    if (node.type === 'api') n++
    if (node.children?.length) n += countApiNodes(node.children)
  }
  return n
}

interface TreeNode {
  id?: number
  label: string
  key: string
  type: 'folder' | 'api' | 'status'
  method?: string
  path?: string
  count?: number
  children?: TreeNode[]
  isNew?: boolean
  parent_id?: number | null
}

const pattern = ref('')
const selectedNode = ref<TreeNode | null>(null)
const showNewFolderModal = ref(false)
const editFolderData = ref<any>(null)
const selectedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])
const treeData = ref<TreeNode[]>([])

const newOptions = [
  { label: '新建接口', key: 'api', icon: () => h(NIcon, { component: ApiOutlined }) },
  { label: '新建目录', key: 'folder', icon: () => h(NIcon, { component: FolderAddOutlined }) },
]

function handleNewOption(key: string) {
  if (key === 'api') handlePlus()
  else handleNewFolder()
}

const refreshTree = () => fetchTreeData()

const fetchTreeData = async () => {
  try {
    const folders: any = await execRequest.get('/folders')
    const interfaces: any = await execRequest.get('/interfaces')
    const testCases: any = await execRequest.get('/test-cases')

    const buildTree = (parentId: number | null = null): TreeNode[] => {
      const nodes = folders
        .filter((f: any) => f.parent_id === parentId)
        .map((f: any) => {
          const node: TreeNode = {
            id: f.id, label: f.name, key: `f-${f.id}`, type: 'folder',
            parent_id: f.parent_id, children: [],
          }
          node.children = buildTree(f.id)
          const folderApis = interfaces
            .filter((api: any) => api.folder_id === f.id)
            .map((api: any) => {
              const apiNode: TreeNode = {
                id: api.id, label: api.name, key: `api-${api.id}`, type: 'api',
                method: api.method, path: api.path, parent_id: f.id, children: [],
              }
              apiNode.children = testCases
                .filter((tc: any) => tc.interface_id === api.id && tc.case_type === 'debug')
                .map((tc: any) => ({
                  id: tc.id, label: tc.name, key: `tc-${tc.id}`,
                  type: 'status' as const, parent_id: api.id,
                }))
              return apiNode
            })
          node.children.push(...folderApis)
          node.count = node.children.length
          return node
        })

      if (parentId === null) {
        const rootApis = interfaces
          .filter((api: any) => !api.folder_id || api.folder_id === 0)
          .map((api: any) => {
            const apiNode: TreeNode = {
              id: api.id, label: api.name, key: `api-${api.id}`, type: 'api',
              method: api.method, path: api.path, parent_id: null, children: [],
            }
            apiNode.children = testCases
              .filter((tc: any) => tc.interface_id === api.id && tc.case_type === 'debug')
              .map((tc: any) => ({
                id: tc.id, label: tc.name, key: `tc-${tc.id}`,
                type: 'status' as const, parent_id: api.id,
              }))
            return apiNode
          })
        nodes.push(...rootApis)
      }
      return nodes
    }

    treeData.value = buildTree(null)
  } catch {
    message.error('获取接口列表失败，请检查服务是否正常')
  }
}

const METHOD_STYLE: Record<string, { color: string; bg: string }> = {
  GET:     { color: '#389e0d', bg: 'rgba(82,196,26,0.14)' },
  POST:    { color: '#d46b08', bg: 'rgba(250,173,20,0.16)' },
  PUT:     { color: '#096dd9', bg: 'rgba(24,144,255,0.14)' },
  DELETE:  { color: '#cf1322', bg: 'rgba(255,77,79,0.13)' },
  PATCH:   { color: '#531dab', bg: 'rgba(114,46,209,0.13)' },
  HEAD:    { color: '#595959', bg: 'rgba(89,89,89,0.10)' },
  OPTIONS: { color: '#595959', bg: 'rgba(89,89,89,0.10)' },
}

const renderPrefix = ({ option }: { option: TreeNode }) => {
  if (option.type === 'folder') {
    const isExpanded = expandedKeys.value.includes(option.key)
    return h(NIcon, {
      size: 15,
      class: 'it-node-folder-ico',
      component: isExpanded ? FolderOpenOutlined : FolderOutlined,
    })
  }
  if (option.type === 'api') {
    const m = String(option.method || 'GET').toUpperCase()
    const s = METHOD_STYLE[m] || { color: '#595959', bg: 'rgba(89,89,89,0.10)' }
    return h('span', {
      class: 'it-node-method-badge',
      style: { color: s.color, background: s.bg },
    }, m === 'DELETE' ? 'DEL' : m)
  }
  if (option.type === 'status') {
    return h(NIcon, { size: 13, class: 'it-node-case-ico', component: FileTextOutlined })
  }
  return null
}

const renderLabel = ({ option }: { option: any }) => {
  const isFolder = option.type === 'folder'
  return h('span', {
    class: isFolder ? 'it-node-label it-node-label--folder' : 'it-node-label it-node-label--leaf',
  }, [
    option.label,
    isFolder && option.count
      ? h('span', { class: 'it-node-count' }, option.count)
      : null,
  ])
}

const renderSuffix = ({ option }: { option: any }) => {
  if (option.type === 'status' || option.isNew) return null
  const isApi = option.type === 'api'
  const isFolder = option.type === 'folder'
  return h('div', { class: 'it-node-actions' }, [
    isFolder ? h('button', {
      class: 'it-node-act-btn',
      title: '添加接口',
      onClick: (e: MouseEvent) => { e.stopPropagation(); selectedNode.value = option; handlePlus() },
    }, [h(NIcon, { size: 13, component: PlusOutlined })]) : null,

    h('button', {
      class: 'it-node-act-btn',
      title: '编辑',
      onClick: (e: MouseEvent) => { e.stopPropagation(); isApi ? handleEditApi(option) : handleEditFolder(option) },
    }, [h(NIcon, { size: 13, component: EditOutlined })]),

    h('button', {
      class: 'it-node-act-btn it-node-act-btn--danger',
      title: '删除',
      onClick: (e: MouseEvent) => { e.stopPropagation(); isApi ? handleDeleteApi(option) : handleDeleteFolder(option) },
    }, [h(NIcon, { size: 13, component: DeleteOutlined })]),
  ])
}

const nodeProps = () => ({})

const handleSelect = (keys: string[], options: any[]) => {
  const node = options[0]
  if (node?.type === 'api' || node?.type === 'status') addTab(node)
}

const handleExpand = (keys: string[]) => { expandedKeys.value = keys }

const handlePlus = () => {
  const newApi: TreeNode = {
    label: '新接口', key: `api-${Date.now()}`, type: 'api',
    method: 'GET', path: '/new-api', isNew: true, parent_id: null,
  }
  if (selectedNode.value?.type === 'folder') {
    if (!selectedNode.value.children) selectedNode.value.children = []
    selectedNode.value.children.push(newApi)
    newApi.parent_id = selectedNode.value.id
  } else if (treeData.value.length > 0 && treeData.value[0].type === 'folder') {
    if (!treeData.value[0].children) treeData.value[0].children = []
    treeData.value[0].children!.push(newApi)
  } else {
    treeData.value.push(newApi)
  }
  addTab(newApi)
  selectedNode.value = null
}

const handleNewFolder = () => { editFolderData.value = null; showNewFolderModal.value = true }
const onFolderCreated = () => fetchTreeData()

const handleEditFolder = (node: TreeNode) => {
  editFolderData.value = { id: node.id, name: node.label, parentId: node.parent_id }
  showNewFolderModal.value = true
}
const handleDeleteFolder = (node: TreeNode) => {
  dialog.warning({
    title: '确认删除', content: `删除目录「${node.label}」？不可恢复。`,
    positiveText: '确认删除', negativeText: '取消',
    onPositiveClick: async () => {
      try { await execRequest.delete(`/folders/${node.id}`); message.success('删除成功'); fetchTreeData() }
      catch { /* noop */ }
    },
  })
}
const handleEditApi = (node: TreeNode) => message.info(`编辑接口：${node.label}`)
const handleDeleteApi = (node: TreeNode) => {
  if (!node.id) { message.warning('该接口尚未保存'); return }
  dialog.warning({
    title: '确认删除', content: `删除接口「${node.label}」？不可恢复。`,
    positiveText: '确认删除', negativeText: '取消',
    onPositiveClick: async () => {
      try { await execRequest.delete(`/interfaces/${node.id}`); message.success('删除成功'); fetchTreeData() }
      catch { /* noop */ }
    },
  })
}

const addTab = async (node: any) => {
  const existing = tabs.value.find(t => t.key === node.key)
  if (!existing) {
    let fullData = { ...node }
    if (node.type === 'status' && node.id) {
      try {
        const tcRes: any = await execRequest.get(`/test-cases/${node.id}`)
        if (tcRes?.interface_id) {
          const apiRes: any = await execRequest.get(`/interfaces/${tcRes.interface_id}`)
          fullData = { ...fullData, ...tcRes, method: apiRes.method, path: apiRes.path,
            interface_name: apiRes.name, label: `${apiRes.name} (${tcRes.name})`, isTestCase: true }
        }
      } catch { message.error('获取用例详情失败') }
    } else if (!node.isNew && node.id && node.type === 'api') {
      try {
        const res: any = await execRequest.get(`/interfaces/${node.id}`)
        if (res) {
          fullData = { ...fullData, ...res, label: res.name || node.label,
            query_params: res.query_params || [], header_params: res.header_params || [],
            body_definition: res.body_definition || { type: 'none' } }
        }
      } catch { message.error('获取接口详情失败') }
    } else {
      fullData = { ...fullData, query_params: [], header_params: [], body_definition: { type: 'none' } }
    }
    tabs.value.push(fullData)
    subTabByTabKey[fullData.key] = fullData.isTestCase ? 'debug' : 'design'
  }
  activeKey.value = node.key
}

const removeTab = (key: string) => {
  const i = tabs.value.findIndex(t => t.key === key)
  tabs.value.splice(i, 1)
  delete subTabByTabKey[key]
  if (activeKey.value === key && tabs.value.length > 0) {
    activeKey.value = tabs.value[tabs.value.length - 1].key
  }
}

const handleSwitchToDebug = (tabKey: string) => { subTabByTabKey[tabKey] = 'debug' }

const loadEnvironments = async () => {
  try {
    const res: any = await execRequest.get('/environments')
    const list = Array.isArray(res) ? res : []
    environments.value = list
    if (list.length > 0) {
      const active = list.find((e: any) => e.is_active)
      selectedEnvId.value = active ? active.id : list[0].id
    }
  } catch { message.error('环境加载失败') }
}

onMounted(() => { loadEnvironments(); fetchTreeData() })
</script>

<style scoped>
/* ══════════════════════════════════════════════════
   根布局
══════════════════════════════════════════════════ */
.it-root {
  inset: 0;
  height: 100%;
  background: #f0f2f5;
}

/* ══════════════════════════════════════════════════
   左侧目录树面板
══════════════════════════════════════════════════ */
.it-sider :deep(.n-layout-sider-scroll-container) {
  background: #141720;
  display: flex;
  flex-direction: column;
}

.it-sider :deep(.n-layout-sider__border) {
  background: #22263a;
}

/* ── 搜索框 + 新建按钮同一行 ── */
.it-sider-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 12px 10px;
}

.it-sider-search-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  height: 34px;
  background: rgba(255,255,255,0.92);
  border: 1.5px solid rgba(255,255,255,0.6);
  border-radius: 9px;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.18);
}

.it-sider-search-wrap:focus-within {
  background: #fff;
  border-color: var(--color-primary-400);
  box-shadow: 0 0 0 3px rgba(129,140,248,0.25), 0 1px 4px rgba(0,0,0,0.12);
}

.it-search-ico {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  color: #9ca3af;
}

.it-sider-search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  font-size: 12px;
  color: #374151;
  caret-color: var(--color-primary-500);
}

.it-sider-search-input::placeholder {
  color: #b0b7c3;
}

.it-sider-add-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(var(--color-primary-rgb),0.4);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb),0.22), rgba(139,92,246,0.16));
  color: #a5b4fc;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.it-sider-add-btn:hover {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
  border-color: transparent;
  color: #fff;
  transform: rotate(90deg);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb),0.45);
}

/* 树容器 */
.it-tree-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 6px 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.it-tree-wrap::-webkit-scrollbar { width: 4px; }
.it-tree-wrap::-webkit-scrollbar-track { background: transparent; }
.it-tree-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

.it-tree-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.25);
  font-size: 12px;
  line-height: 1.6;
}

/* n-tree 暗色变量 */
.it-tree {
  --n-node-text-color: rgba(255,255,255,0.82);
  --n-node-text-color-disabled: rgba(255,255,255,0.28);
  --n-arrow-color: rgba(255,255,255,0.35);
  --n-line-color: rgba(255,255,255,0.08);
  --n-node-color-active: rgba(var(--color-primary-rgb),0.18);
  --n-node-color-hover: rgba(255,255,255,0.05);
  --n-node-color-pressed: rgba(var(--color-primary-rgb),0.12);
  --n-node-border-radius: 8px;
  --n-node-content-height: 34px;
  background: transparent;
}

/* 选中行：清除整行背景，只保留 content 胶囊 */
.it-tree :deep(.n-tree-node--selected) {
  background: transparent !important;
}

.it-tree :deep(.n-tree-node--selected .n-tree-node-content) {
  background: rgba(var(--color-primary-rgb), 0.2) !important;
  border-radius: 8px;
}

.it-tree :deep(.n-tree-node:not(.n-tree-node--disabled):hover) {
  background: transparent !important;
}

.it-tree :deep(.n-tree-node:not(.n-tree-node--disabled):hover .n-tree-node-content) {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.it-tree :deep(.n-tree-node-content) {
  transition: background-color 0.18s ease;
}

/* wrapper 间距 */
.it-tree :deep(.n-tree-node-wrapper) {
  padding: 2px 0;
}

/* 前缀 */
.it-node-folder-ico {
  color: #f0a500;
  flex-shrink: 0;
}

.it-node-case-ico {
  color: rgba(255,255,255,0.38);
  flex-shrink: 0;
}

/* HTTP 方法色块（左侧） */
.it-node-method-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 18px;
  padding: 0 5px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

/* 标签文字 */
.it-node-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.it-node-label--folder {
  font-weight: 600;
  color: rgba(255,255,255,0.9);
}

.it-node-label--leaf {
  font-weight: 400;
  color: rgba(255,255,255,0.75);
}

.it-node-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 16px;
  padding: 0 5px;
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  font-size: 10px;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
}

/* 悬停操作按钮 — 全部放进 :deep() 才能穿透 n-tree DOM */
.it-tree :deep(.it-node-actions) {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.it-tree :deep(.n-tree-node-wrapper:hover .it-node-actions) {
  opacity: 1;
}

.it-tree :deep(.n-tree-node--selected .it-node-actions) {
  opacity: 1;
}

.it-tree :deep(.it-node-act-btn) {
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  border-radius: 5px;
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s, color 0.15s;
}

.it-tree :deep(.it-node-act-btn:hover) {
  background: rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.92);
}

.it-tree :deep(.it-node-act-btn--danger:hover) {
  background: rgba(239, 68, 68, 0.18);
  color: #f87171;
}

/* ══════════════════════════════════════════════════
   右侧主区
══════════════════════════════════════════════════ */
.it-main {
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* ── Topbar 右侧控件 ── */
.it-topbar-env {
  display: flex;
  align-items: center;
  gap: 8px;
}

.it-topbar-env-label {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
}

.it-topbar-pills {
  display: flex;
  align-items: center;
  gap: 8px;
}

.it-topbar-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 10px;
  border-radius: 13px;
  font-size: 12px;
  font-weight: 500;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.it-topbar-pill--green {
  background: rgba(34,197,94,0.08);
  color: #16a34a;
  border-color: rgba(34,197,94,0.2);
}

.it-pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 5px rgba(34,197,94,0.6);
  animation: it-dot-blink 2s ease-in-out infinite;
}

@keyframes it-dot-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* 内容区 */
.it-content-area {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px;
  box-sizing: border-box;
}

/* 过渡 */
.it-fade-enter-active,
.it-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.it-fade-enter-from,
.it-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ══════════════════════════════════════════════════
   工作区（有 Tab 时）
══════════════════════════════════════════════════ */
.it-work-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
  padding: 16px;
}

.it-work-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.it-work-tabs :deep(.n-tabs-pane-wrapper),
.it-work-tabs :deep(.n-tab-pane) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.it-tab-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  animation: it-tab-in 0.28s ease-out;
}

@keyframes it-tab-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
}

/* ══════════════════════════════════════════════════
   欢迎 / 引导区
══════════════════════════════════════════════════ */
.it-welcome-wrap {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

/* ── Hero ── */
.it-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
  text-align: center;
}

/* 发光同心环 */
.it-hero-glow-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(var(--color-primary-rgb),0.18);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: it-ring-pulse 3s ease-in-out infinite;
}

.it-hero-ring-1 {
  width: 120px; height: 120px;
  animation-delay: 0s;
}

.it-hero-ring-2 {
  width: 180px; height: 180px;
  animation-delay: 0.5s;
  border-color: rgba(var(--color-primary-rgb),0.10);
}

.it-hero-ring-3 {
  width: 240px; height: 240px;
  animation-delay: 1s;
  border-color: rgba(var(--color-primary-rgb),0.06);
}

@keyframes it-ring-pulse {
  0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  50%       { opacity: 0.5; transform: translate(-50%, -50%) scale(1.06); }
}

/* 图标盒子 */
.it-hero-icon-box {
  position: relative;
  z-index: 1;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-400) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(var(--color-primary-rgb),0.35), 0 0 0 8px rgba(var(--color-primary-rgb),0.1);
  animation: it-icon-float 3.5s ease-in-out infinite;
}

@keyframes it-icon-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}

.it-hero-icon {
  animation: it-icon-spin 8s linear infinite;
}

@keyframes it-icon-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.it-hero-title {
  position: relative;
  z-index: 1;
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
}

.it-hero-sub {
  position: relative;
  z-index: 1;
  margin: 0 0 24px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.55;
}

.it-hero-actions {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
}

.it-hero-btn {
  height: 38px;
  padding: 0 20px;
  border: none;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.it-hero-btn--primary {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400));
  color: #fff;
  box-shadow: 0 4px 14px rgba(var(--color-primary-rgb),0.35);
}

.it-hero-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(var(--color-primary-rgb),0.45);
}

.it-hero-btn--ghost {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.it-hero-btn--ghost:hover {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #4f46e5;
  transform: translateY(-2px);
}

/* ── 统计卡片行 ── */
.it-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.it-stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: default;
}

.it-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.09);
}

.it-stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 12px 12px 0 0;
}

.it-stat-card--blue  { --accent: rgba(59,130,246,0.12); --ico: #2563eb; }
.it-stat-card--green { --accent: rgba(34,197,94,0.12);  --ico: #16a34a; }
.it-stat-card--amber { --accent: rgba(251,191,36,0.14); --ico: #d97706; }
.it-stat-card--purple{ --accent: rgba(139,92,246,0.12); --ico: #7c3aed; }

.it-stat-card--blue::before  { background: #3b82f6; }
.it-stat-card--green::before { background: #22c55e; }
.it-stat-card--amber::before { background: #f59e0b; }
.it-stat-card--purple::before{ background: #8b5cf6; }

.it-stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--accent);
  color: var(--ico);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.it-stat-body {
  flex: 1;
  min-width: 0;
}

.it-stat-num {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.it-stat-label {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.it-stat-trend {
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.it-stat-trend--up   { color: #16a34a; }
.it-stat-trend--down { color: #dc2626; }

/* ── 功能卡片行 ── */
.it-feature-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.it-feat-card {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  padding: 24px;
  cursor: pointer;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border: 1px solid transparent;
}

.it-feat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.10);
}

/* 渐变背景层（hover 时浮现） */
.it-feat-card-bg {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: inherit;
}

.it-feat-card:hover .it-feat-card-bg {
  opacity: 1;
}

.it-feat-card--debug .it-feat-card-bg {
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb),0.07) 0%, rgba(139,92,246,0.04) 100%);
}

.it-feat-card--mock .it-feat-card-bg {
  background: linear-gradient(135deg, rgba(6,182,212,0.07) 0%, rgba(59,130,246,0.04) 100%);
}

.it-feat-card--env .it-feat-card-bg {
  background: linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(5,150,105,0.04) 100%);
}

.it-feat-card--debug:hover { border-color: rgba(var(--color-primary-rgb),0.2); }
.it-feat-card--mock:hover  { border-color: rgba(6,182,212,0.2);  }
.it-feat-card--env:hover   { border-color: rgba(16,185,129,0.2); }

.it-feat-icon-wrap {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  transition: transform 0.25s ease;
}

.it-feat-card:hover .it-feat-icon-wrap {
  transform: scale(1.1) rotate(-5deg);
}

.it-feat-card--debug .it-feat-icon-wrap { background: rgba(var(--color-primary-rgb),0.1); color: var(--color-primary-500); }
.it-feat-card--mock  .it-feat-icon-wrap { background: rgba(6,182,212,0.1);  color: #0891b2; }
.it-feat-card--env   .it-feat-icon-wrap { background: rgba(16,185,129,0.1); color: #059669; }

.it-feat-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  position: relative;
  z-index: 1;
}

.it-feat-desc {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

.it-feat-arrow {
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: #d1d5db;
  transition: color 0.2s ease, transform 0.2s ease;
}

.it-feat-card:hover .it-feat-arrow {
  color: #9ca3af;
  transform: translateX(3px);
}

/* ══════════════════════════════════════════════════
   响应式
══════════════════════════════════════════════════ */
@media (max-width: 860px) {
  .it-stats-row   { grid-template-columns: repeat(2, 1fr); }
  .it-feature-row { grid-template-columns: 1fr; }
}
</style>
