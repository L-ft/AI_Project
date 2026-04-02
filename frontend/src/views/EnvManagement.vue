<template>
  <div class="env-mgmt">

    <!-- 左侧边栏 -->
    <div class="env-sidebar">

      <!-- 工具栏：搜索 + 新建 -->
      <div class="env-toolbar">
        <div class="env-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" placeholder="搜索环境..." class="env-search-input" />
        </div>
        <button class="env-add-btn" title="新建环境" @click="openCreateModal">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <!-- 环境列表 -->
      <div class="env-list-wrap">
        <div class="env-list-header">
          <span class="env-list-label">环境列表</span>
          <span class="env-list-count">{{ filteredEnvs.length }}</span>
        </div>

        <div v-if="filteredEnvs.length === 0" class="env-list-empty">
          暂无环境，点击 + 新建
        </div>

        <div
          v-for="env in filteredEnvs"
          :key="env.id"
          :class="['env-item', { active: selectedEnv?.id === env.id }]"
          @click="selectEnv(env)"
        >
          <div class="env-item-dot" :style="{ background: envColor(env.name) }"></div>
          <span class="env-item-name">{{ env.name }}</span>
          <div class="env-item-status">
            <span v-if="env.is_active" class="env-active-badge">启用</span>
          </div>
          <div class="env-item-actions">
            <button class="env-act-btn" title="编辑" @click.stop="openEditModal(env)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <n-popconfirm
              positive-text="删除"
              negative-text="取消"
              @positive-click="deleteEnv(env)"
              placement="right"
            >
              <template #trigger>
                <button class="env-act-btn env-act-btn--danger" title="删除" @click.stop>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </template>
              确认删除“{{ env.name }}”吗？此操作不可恢复。
            </n-popconfirm>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧主内容区 -->
    <div class="env-main">

      <!-- 顶部栏 -->
      <PageTopbar
        title="环境管理"
        badge="Config"
        :breadcrumbs="['环境管理', selectedEnv?.name || '请选择环境']"
      >
        <template #icon>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </template>
        <template #right>
          <span class="env-topbar-pill env-topbar-pill--green" v-if="selectedEnv?.is_active">
            <i class="env-pill-dot"></i>当前激活
          </span>
          <span class="env-topbar-pill">{{ envList.length }} 个环境</span>
          <span class="env-topbar-pill env-vars-pill" v-if="selectedEnv">
            {{ editForm.variables.length }} 个变量
          </span>
        </template>
      </PageTopbar>

      <!-- 选中环境后显示内容 -->
      <template v-if="selectedEnv">
        <n-scrollbar class="env-scroll">
          <div class="env-content">

            <!-- 基本信息 -->
            <section class="env-section">
              <div class="env-section-title">
                <span class="section-title-bar"></span>
                基本信息
              </div>
              <div class="env-form-grid">
                <div class="env-form-item">
                  <label class="env-label">环境名称 <span class="env-label-req">*</span></label>
                  <n-input
                    v-model:value="editForm.name"
                    placeholder="如：测试环境、正式环境"
                    size="medium"
                    class="env-input"
                  />
                </div>
                <div class="env-form-item">
                  <label class="env-label">基础 URL <span class="env-label-req">*</span></label>
                  <n-input
                    v-model:value="editForm.base_url"
                    placeholder="https://api.example.com"
                    size="medium"
                    class="env-input"
                  >
                    <template #prefix>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                    </template>
                  </n-input>
                </div>
                <div class="env-form-item env-form-item--full">
                  <label class="env-label">状态</label>
                  <div class="env-status-row">
                    <n-switch v-model:value="editForm.is_active" size="medium">
                      <template #checked>已启用</template>
                      <template #unchecked>已停用</template>
                    </n-switch>
                    <span class="env-status-hint">停用后该环境不会出现在测试场景的环境选择中</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- 环境变量 -->
            <section class="env-section">
              <div class="env-section-header">
                <div class="env-section-title">
                  <span class="section-title-bar"></span>
                  环境变量
                  <span class="env-var-count-badge">{{ editForm.variables.length }}</span>
                </div>
                <div class="env-section-actions">
                  <div class="env-var-search-wrap">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input v-model="varSearch" placeholder="搜索变量名..." class="env-var-search-input" />
                  </div>
                  <button class="env-add-var-btn" @click="addVar">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    添加变量
                  </button>
                </div>
              </div>

              <!-- 变量表格 -->
              <div class="env-var-table-wrap">
                <table class="env-var-table">
                  <thead>
                    <tr>
                      <th class="col-idx">#</th>
                      <th class="col-name">变量名</th>
                      <th class="col-value">变量值</th>
                      <th class="col-desc">描述（可选）</th>
                      <th class="col-action"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(v, idx) in filteredVars"
                      :key="v._key"
                      class="env-var-row"
                    >
                      <td class="col-idx">{{ idx + 1 }}</td>
                      <td class="col-name">
                        <input
                          v-model="v.name"
                          class="env-cell-input"
                          placeholder="TOKEN"
                        />
                      </td>
                      <td class="col-value">
                        <div class="env-cell-value-wrap">
                          <input
                            v-model="v.remote_value"
                            :type="v._hidden ? 'password' : 'text'"
                            class="env-cell-input"
                            placeholder="变量值"
                          />
                          <button
                            class="env-cell-eye"
                            @click="v._hidden = !v._hidden"
                            :title="v._hidden ? '显示' : '隐藏'"
                          >
                            <svg v-if="v._hidden" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td class="col-desc">
                        <input
                          v-model="v.description"
                          class="env-cell-input"
                           placeholder="可选备注"
                        />
                      </td>
                      <td class="col-action">
                        <button class="env-var-del-btn" @click="removeVar(v._key)" title="删除此变量">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                          </svg>
                        </button>
                      </td>
                    </tr>

                    <!-- 搜索过滤后的空状态 -->
                    <tr v-if="filteredVars.length === 0">
                      <td colspan="5" class="env-var-empty-row">
                        <span v-if="varSearch">未找到包含“{{ varSearch }}”的变量</span>
                        <span v-else>
                          暂无变量，
                          <button class="env-var-empty-add" @click="addVar">点击添加</button>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        </n-scrollbar>

        <!-- 底部操作栏 -->
        <div class="env-footer">
          <div class="env-footer-left">
            <span class="env-footer-hint" v-if="isDirty">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              有未保存的更改
            </span>
          </div>
          <div class="env-footer-right">
            <button class="env-footer-reset-btn" @click="resetForm" :disabled="!isDirty">
              重置
            </button>
            <button class="env-footer-save-btn" @click="handleSave" :disabled="saving">
              <svg v-if="!saving" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="spin-icon">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ saving ? '保存中...' : '保存配置' }}
            </button>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-else class="env-empty-state">
        <div class="env-empty-icon-wrap">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <p class="env-empty-title">尚未选择环境</p>
        <p class="env-empty-desc">从左侧选择一个环境进行配置，或新建一个环境</p>
        <button class="env-empty-create-btn" @click="openCreateModal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          新建环境
        </button>
      </div>

    </div>

    <!-- 新建 / 编辑环境弹窗 -->
    <n-modal
      v-model:show="showModal"
      :mask-closable="false"
      :auto-focus="false"
      preset="card"
      :title="modalMode === 'create' ? '新建环境' : '编辑环境'"
      style="width: 480px; border-radius: 12px;"
      @after-enter="() => modalNameInputRef?.focus()"
    >
      <div class="modal-body">
        <div class="modal-form-item">
          <label class="modal-label">环境名称 <span class="env-label-req">*</span></label>
          <n-input
            ref="modalNameInputRef"
            v-model:value="modalForm.name"
            placeholder="如：测试环境 / 正式环境 / UAT"
            size="medium"
            @keydown.enter="handleModalSubmit"
          />
        </div>
        <div class="modal-form-item">
          <label class="modal-label">基础 URL <span class="env-label-req">*</span></label>
          <n-input
            v-model:value="modalForm.base_url"
            placeholder="https://api.example.com"
            size="medium"
            @keydown.enter="handleModalSubmit"
          />
          <p class="modal-hint">接口调用时将作为所有请求路径的前缀</p>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="showModal = false" :disabled="modalLoading">取消</n-button>
          <n-button
            type="primary"
            color="#7d33ff"
            :loading="modalLoading"
            :disabled="!modalForm.name.trim() || !modalForm.base_url.trim()"
            @click="handleModalSubmit"
          >
            {{ modalMode === 'create' ? '创建环境' : '保存修改' }}
          </n-button>
        </div>
      </template>
    </n-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  NModal, NInput, NButton, NSwitch, NScrollbar, NPopconfirm, useMessage
} from 'naive-ui'
import PageTopbar from '../components/PageTopbar.vue'
import execRequest from '../api/exec-request'

// --------------------
// Types
// --------------------
interface EnvVariable {
  name: string
  remote_value: string
  local_value?: string
  description?: string
  is_synced?: boolean
  _key: string    // 前端唯一 key，不提交
  _hidden: boolean // 是否隐藏敏感值，不提交
}

interface Environment {
  id: number
  name: string
  base_url: string
  variables: any[]
  urls?: any[]
  global_config?: Record<string, any>
  is_active: boolean
}

// --------------------
// State
// --------------------
const message = useMessage()

const envList = ref<Environment[]>([])
const selectedEnv = ref<Environment | null>(null)
const searchQuery = ref('')
const varSearch = ref('')
const saving = ref(false)

// 编辑表单：与 selectedEnv 解耦，保存时才提交
const editForm = ref({
  name: '',
  base_url: '',
  is_active: true,
  variables: [] as EnvVariable[]
})

// 记录初始值，用于判断是否有改动
const originalSnapshot = ref('')

const isDirty = computed(() => {
  return JSON.stringify(editForm.value) !== originalSnapshot.value
})

// 弹窗状态
const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const modalForm = ref({ name: '', base_url: '' })
const modalLoading = ref(false)
const modalNameInputRef = ref<any>(null)
const editingEnvId = ref<number | null>(null)

// --------------------
// Computed
// --------------------
const filteredEnvs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return envList.value
  return envList.value.filter(e => e.name.toLowerCase().includes(q))
})

const filteredVars = computed(() => {
  const q = varSearch.value.trim().toLowerCase()
  if (!q) return editForm.value.variables
  return editForm.value.variables.filter(v => v.name.toLowerCase().includes(q))
})

// --------------------
// Helpers
// --------------------
let _keyCounter = 0
const newVarKey = () => `v_${++_keyCounter}_${Date.now()}`

function envColor(name: string) {
  if (!name) return '#8792a2'
  if (name.includes('正式') || name.includes('生产') || name.includes('prod')) return '#ef4444'
  if (name.includes('预发') || name.includes('pre') || name.includes('staging')) return '#f97316'
  if (name.includes('测试') || name.includes('test') || name.includes('qa')) return '#7d33ff'
  if (name.includes('开发') || name.includes('dev') || name.includes('local')) return '#10b981'
  const colors = ['#7d33ff', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
}

function varsFromRaw(rawVars: any[]): EnvVariable[] {
  return (rawVars || []).map(v => ({
    name: v.name ?? '',
    remote_value: v.remote_value ?? v.value ?? '',
    local_value: v.local_value ?? '',
    description: v.description ?? '',
    is_synced: v.is_synced ?? true,
    _key: newVarKey(),
    _hidden: false
  }))
}

function varToPayload(v: EnvVariable) {
  return {
    name: v.name,
    remote_value: v.remote_value,
    local_value: v.local_value ?? '',
    description: v.description ?? '',
    is_synced: v.is_synced ?? true
  }
}

function snapshotForm() {
  originalSnapshot.value = JSON.stringify(editForm.value)
}

// --------------------
// API
// --------------------
async function fetchEnvs(keepSelected = false) {
  try {
    const res: any = await execRequest.get('/environments')
    envList.value = Array.isArray(res) ? res : (res?.data ?? [])
    if (!keepSelected && envList.value.length > 0 && !selectedEnv.value) {
      selectEnv(envList.value[0])
    }
    if (keepSelected && selectedEnv.value) {
      const updated = envList.value.find(e => e.id === selectedEnv.value!.id)
      if (updated) selectedEnv.value = updated
    }
  } catch (_) {
    // 错误已由请求拦截器统一处理
  }
}

function selectEnv(env: Environment) {
  if (isDirty.value) {
    // 存在未保存内容时给出提示，但仍允许切换
    message.warning('已切换环境，未保存的修改已丢失', { duration: 2500 })
  }
  selectedEnv.value = env
  editForm.value = {
    name: env.name,
    base_url: env.base_url,
    is_active: env.is_active,
    variables: varsFromRaw(env.variables ?? [])
  }
  snapshotForm()
  varSearch.value = ''
}

// --------------------
// Variable CRUD
// --------------------
function addVar() {
  editForm.value.variables.push({
    name: '',
    remote_value: '',
    local_value: '',
    description: '',
    is_synced: true,
    _key: newVarKey(),
    _hidden: false
  })
}

function removeVar(key: string) {
  const idx = editForm.value.variables.findIndex(v => v._key === key)
  if (idx !== -1) editForm.value.variables.splice(idx, 1)
}

// --------------------
// Environment CRUD
// --------------------
function openCreateModal() {
  modalMode.value = 'create'
  modalForm.value = { name: '', base_url: 'http://localhost:8080' }
  editingEnvId.value = null
  showModal.value = true
}

function openEditModal(env: Environment) {
  modalMode.value = 'edit'
  modalForm.value = { name: env.name, base_url: env.base_url }
  editingEnvId.value = env.id
  showModal.value = true
}

async function handleModalSubmit() {
  if (!modalForm.value.name.trim() || !modalForm.value.base_url.trim()) return
  modalLoading.value = true
  try {
    if (modalMode.value === 'create') {
      const res: any = await execRequest.post('/environments', {
        name: modalForm.value.name.trim(),
        base_url: modalForm.value.base_url.trim(),
        variables: [],
        global_config: {}
      })
      message.success('环境创建成功')
      await fetchEnvs()
      const newEnv = envList.value.find(e => e.id === res?.id) ?? envList.value[envList.value.length - 1]
      if (newEnv) selectEnv(newEnv)
    } else {
      await execRequest.patch(`/environments/${editingEnvId.value}`, {
        name: modalForm.value.name.trim(),
        base_url: modalForm.value.base_url.trim()
      })
      message.success('环境信息已更新')
      // 同步 editForm 中的名称和基础 URL
      editForm.value.name = modalForm.value.name.trim()
      editForm.value.base_url = modalForm.value.base_url.trim()
      await fetchEnvs(true)
    }
    showModal.value = false
  } catch (_) {
    // 错误已由请求拦截器统一处理
  } finally {
    modalLoading.value = false
  }
}

async function deleteEnv(env: Environment) {
  try {
    await execRequest.delete(`/environments/${env.id}`)
    message.success(`已删除“${env.name}”`)
    if (selectedEnv.value?.id === env.id) {
      selectedEnv.value = null
      editForm.value = { name: '', base_url: '', is_active: true, variables: [] }
    }
    await fetchEnvs()
  } catch (_) {
    // 错误已由请求拦截器统一处理
  }
}

// --------------------
// Save
// --------------------
function resetForm() {
  if (selectedEnv.value) selectEnv(selectedEnv.value)
}

async function handleSave() {
  if (!selectedEnv.value) return
  if (!editForm.value.name.trim()) {
    message.error('环境名称不能为空')
    return
  }
  if (!editForm.value.base_url.trim()) {
    message.error('基础 URL 不能为空')
    return
  }
  saving.value = true
  try {
    const payload = {
      name: editForm.value.name.trim(),
      base_url: editForm.value.base_url.trim(),
      is_active: editForm.value.is_active,
      variables: editForm.value.variables.map(varToPayload)
    }
    await execRequest.patch(`/environments/${selectedEnv.value.id}`, payload)
    message.success('保存成功')
    await fetchEnvs(true)
    snapshotForm()
  } catch (_) {
    // 错误已由请求拦截器统一处理
  } finally {
    saving.value = false
  }
}

// --------------------
// Init
// --------------------
fetchEnvs()
</script>

<style scoped>
/* 页面布局 */
/* 根容器 */
/* -------------------- */
.env-mgmt {
  display: flex;
  height: 100%;
  background: #f0f2f5;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI', sans-serif;
}

/* 左侧边栏 */
/* 白色面板 */
/* -------------------- */
.env-sidebar {
  width: 248px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #eef1f6;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 工具栏 */
.env-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 12px 10px;
  border-bottom: 1px solid #f3f4f6;
}

.env-search-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  height: 32px;
  background: #f8f9fc;
  border: 1px solid #e4e8f0;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.env-search-wrap:focus-within {
  background: #fff;
  border-color: var(--color-primary-400);
  box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.18);
}
.env-search-wrap svg {
  width: 13px; height: 13px; flex-shrink: 0; color: #9ca3af;
}
.env-search-input {
  flex: 1; min-width: 0; border: none; background: transparent; outline: none;
  font-size: 12px; color: #374151; caret-color: var(--color-primary-500);
}
.env-search-input::placeholder { color: #b0b7c3; }

.env-add-btn {
  flex-shrink: 0;
  width: 32px; height: 32px;
  border: none; border-radius: 8px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400));
  color: #fff; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.35);
  transition: all 0.2s ease;
}
.env-add-btn:hover {
  box-shadow: 0 4px 14px rgba(var(--color-primary-rgb), 0.5);
  transform: rotate(90deg);
}

/* 环境列表 */
.env-list-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 8px 8px 12px;
  scrollbar-width: thin;
  scrollbar-color: #e4e8f0 transparent;
}
.env-list-wrap::-webkit-scrollbar { width: 4px; }
.env-list-wrap::-webkit-scrollbar-thumb { background: #e4e8f0; border-radius: 2px; }

.env-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px 8px;
}
.env-list-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.07em;
  color: #9ca3af;
  text-transform: uppercase;
}
.env-list-count {
  height: 16px;
  min-width: 16px;
  padding: 0 4px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary-500);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.env-list-empty {
  font-size: 12px;
  color: #b0b7c3;
  text-align: center;
  padding: 24px 0;
}

.env-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
  margin-bottom: 1px;
  min-height: 40px;
}
.env-item:hover { background: #f5f6fb; }
.env-item.active {
  background: rgba(var(--color-primary-rgb), 0.08);
}
.env-item.active .env-item-name { color: var(--color-primary-500); font-weight: 500; }

.env-item-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.env-item-name {
  flex: 1;
  font-size: 13px;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.env-item-status {
  flex-shrink: 0;
}
.env-active-badge {
  font-size: 9px;
  font-weight: 600;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 1px 5px;
  border-radius: 5px;
}

.env-item-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
.env-item:hover .env-item-actions { opacity: 1; }

.env-act-btn {
  width: 22px; height: 22px;
  border: none; background: transparent;
  border-radius: 5px; color: #c0c8d8;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.env-act-btn:hover {
  background: #eef1f8;
  color: var(--color-primary-500);
}
.env-act-btn--danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* 右侧主区域 */
/* -------------------- */
/* 主内容容器 */
.env-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  overflow: hidden;
  min-width: 0;
}

/* ── Topbar 右侧控件 ── */
.env-topbar-pill {
  display: inline-flex; align-items: center; gap: 5px;
  height: 26px; padding: 0 10px; border-radius: 13px;
  font-size: 12px; font-weight: 500;
  background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb;
}
.env-topbar-pill--green {
  background: rgba(16, 185, 129, 0.08);
  color: #059669;
  border-color: rgba(16, 185, 129, 0.25);
}
.env-pill-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #10b981;
  animation: pillPulse 2s ease infinite;
}
@keyframes pillPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.env-vars-pill {
  background: rgba(125, 51, 255, 0.08);
  color: #7d33ff;
  border-color: rgba(125, 51, 255, 0.2);
}

/* 滚动内容区 */
.env-scroll { flex: 1; background: #fff; }

.env-content {
  padding: 28px 32px;
  max-width: 860px;
}

/* Section */
.env-section {
  margin-bottom: 40px;
}
.env-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 20px;
}
.section-title-bar {
  width: 3px; height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--color-primary-500), var(--color-primary-400));
  flex-shrink: 0;
}
.env-var-count-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 5px;
  border-radius: 10px;
  font-size: 11px; font-weight: 700;
  background: rgba(var(--color-primary-rgb),0.1);
  color: var(--color-primary-500);
}

/* 表单网格 */
.env-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.env-form-item { display: flex; flex-direction: column; gap: 7px; }
.env-form-item--full { grid-column: 1 / -1; }

.env-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 3px;
}
.env-label-req { color: #ef4444; }

.env-input { border-radius: 8px !important; }

.env-status-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 0;
}
.env-status-hint {
  font-size: 12px;
  color: #9ca3af;
}

/* Section header with actions */
.env-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.env-section-header .env-section-title {
  margin-bottom: 0;
}
.env-section-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 变量搜索框 */
.env-var-search-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  height: 30px;
  background: #f8f9fc;
  border: 1px solid #e4e8f0;
  border-radius: 7px;
  transition: border-color 0.2s;
  min-width: 180px;
}
.env-var-search-wrap:focus-within {
  border-color: var(--color-primary-400);
  box-shadow: 0 0 0 2px rgba(129,140,248,0.15);
  background: #fff;
}
.env-var-search-input {
  flex: 1; border: none; background: transparent; outline: none;
  font-size: 12px; color: #374151; caret-color: var(--color-primary-500);
}
.env-var-search-input::placeholder { color: #b0b7c3; }

/* 添加变量按钮 */
.env-add-var-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 14px;
  border: 1.5px dashed rgba(var(--color-primary-rgb),0.4);
  border-radius: 7px;
  background: rgba(var(--color-primary-rgb),0.04);
  color: var(--color-primary-500);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.env-add-var-btn:hover {
  border-style: solid;
  background: rgba(var(--color-primary-rgb),0.08);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb),0.12);
}

/* 变量表格 */
.env-var-table-wrap {
  border: 1px solid #e8eaef;
  border-radius: 10px;
  overflow: hidden;
}

.env-var-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.env-var-table thead tr {
  background: #f8f9fc;
}
.env-var-table th {
  padding: 10px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.03em;
  border-bottom: 1px solid #e8eaef;
}
.col-idx   { width: 44px; text-align: center; }
.col-name  { width: 24%; }
.col-value { width: 30%; }
.col-desc  { }
.col-action { width: 52px; text-align: center; }

.env-var-row td {
  padding: 6px 8px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}
.env-var-row:last-child td { border-bottom: none; }
.env-var-row:hover { background: #fafbff; }

.col-idx { text-align: center; color: #c0c8d8; font-size: 12px; }

/* 单元格输入框 */
.env-cell-input {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  caret-color: var(--color-primary-500);
  outline: none;
  transition: border-color 0.15s, background 0.15s;
  box-sizing: border-box;
}
.env-cell-input:hover {
  border-color: #e4e8f0;
  background: #fff;
}
.env-cell-input:focus {
  border-color: var(--color-primary-400);
  background: #fff;
  box-shadow: 0 0 0 2px rgba(129,140,248,0.14);
}
.env-cell-input::placeholder { color: #c8cdd8; }

/* 值列：包含显示/隐藏按钮 */
.env-cell-value-wrap {
  display: flex;
  align-items: center;
  gap: 2px;
}
.env-cell-value-wrap .env-cell-input { flex: 1; }
.env-cell-eye {
  flex-shrink: 0;
  width: 28px; height: 28px;
  border: none; background: transparent; border-radius: 5px;
  color: #c0c8d8; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: color 0.15s;
}
.env-cell-eye:hover { color: var(--color-primary-500); }

/* 删除按钮 */
.env-var-del-btn {
  width: 28px; height: 28px;
  border: none; background: transparent; border-radius: 6px;
  color: #d1d5db;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
  margin: auto;
}
.env-var-del-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* 空行 */
.env-var-empty-row {
  text-align: center;
  padding: 32px 0 !important;
  color: #9ca3af;
  font-size: 13px;
  background: transparent !important;
}
.env-var-empty-add {
  background: none; border: none; cursor: pointer;
  color: var(--color-primary-500); font-size: 13px;
  text-decoration: underline;
  padding: 0;
}
.env-var-empty-add:hover { color: #4f46e5; }

/* 底部操作栏 */
.env-footer {
  flex-shrink: 0;
  height: 60px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e8eaef;
  background: #fff;
}
.env-footer-left {
  display: flex;
  align-items: center;
}
.env-footer-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #f59e0b;
}
.env-footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.env-footer-reset-btn {
  height: 36px;
  padding: 0 18px;
  border: 1px solid #e4e7f0;
  border-radius: 8px;
  background: #fff;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.env-footer-reset-btn:hover:not(:disabled) {
  border-color: var(--color-primary-400);
  color: var(--color-primary-500);
}
.env-footer-reset-btn:disabled { opacity: 0.4; cursor: default; }

.env-footer-save-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 22px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400));
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(var(--color-primary-rgb),0.3);
  transition: box-shadow 0.2s, transform 0.15s;
}
.env-footer-save-btn:hover:not(:disabled) {
  box-shadow: 0 6px 18px rgba(var(--color-primary-rgb),0.45);
  transform: translateY(-1px);
}
.env-footer-save-btn:disabled { opacity: 0.6; cursor: default; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spin-icon { animation: spin 1s linear infinite; }

/* 空状态 */
.env-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: #f0f2f5;
}
.env-empty-icon-wrap {
  width: 80px; height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb),0.1), rgba(139,92,246,0.08));
  border: 1px solid rgba(var(--color-primary-rgb),0.15);
  display: flex; align-items: center; justify-content: center;
}
.env-empty-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}
.env-empty-desc {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}
.env-empty-create-btn {
  display: inline-flex; align-items: center; gap: 7px;
  height: 38px; padding: 0 22px;
  border: none; border-radius: 9px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400));
  color: #fff; font-size: 13px; font-weight: 500; cursor: pointer;
  box-shadow: 0 3px 10px rgba(var(--color-primary-rgb),0.3);
  transition: transform 0.18s, box-shadow 0.18s;
  margin-top: 6px;
}
.env-empty-create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(var(--color-primary-rgb),0.4);
}

/* 弹窗 */
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 4px 0 8px;
}
.modal-form-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.modal-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 3px;
}
.modal-hint {
  margin: 4px 0 0;
  font-size: 11px;
  color: #b0b7c3;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
