<template>
  <div class="api-design-container">
    <!-- 标题行：仅展示方法与名称 -->
    <div class="breadcrumb-header">
      <n-space align="center" :size="8">
        <n-text strong :class="['method-indicator', method.toLowerCase()]">{{ method }}</n-text>
        <n-input 
          v-model:value="apiName" 
          placeholder="接口名称" 
          ghost 
          class="api-name-input"
          :style="{ width: '300px', fontWeight: 'bold' }"
        />
        <n-button quaternary circle size="tiny">
          <template #icon><n-icon :component="PlusOutlined" /></template>
        </n-button>
        <n-button quaternary circle size="tiny">
          <template #icon><n-icon :component="EllipsisOutlined" /></template>
        </n-button>
      </n-space>
    </div>

    <!-- 请求地址：仅方法与 URL，不含操作按钮 -->
    <div class="api-url-toolbar">
      <div class="method-url-group">
        <n-input-group>
          <n-select
            v-model:value="method"
            :options="methodOptions"
            class="method-select"
            :style="{ width: '100px' }"
          />
          <div class="url-input-wrapper">
            <span class="base-url">{{ envBaseUrl }}</span>
            <n-input 
              v-model:value="path" 
              placeholder="接口路径，'/' 起始" 
              ghost 
              class="path-input"
            />
          </div>
        </n-input-group>
      </div>
    </div>

    <n-scrollbar class="design-content">
      <div class="content-inner">
        <!-- 6. 请求参数部分 -->
        <div class="section-title">请求参数</div>
        <n-tabs type="line" animated class="param-tabs">
          <n-tab-pane name="params" tab="Params">
            <div class="pane-content">
              <div class="sub-title">Query 参数</div>
              <n-data-table
                :columns="queryColumns"
                :data="queryParams"
                :row-key="(row: any) => row.key"
                :bordered="true"
                :single-line="false"
                size="small"
                class="param-data-table"
                :pagination="false"
              />
              <n-button dashed block class="param-add-btn" @click="addParam">添加参数</n-button>
            </div>
          </n-tab-pane>
          <n-tab-pane name="body" tab="Body">
            <div class="pane-content">
              <div class="sub-title">Body 类型</div>
              <n-tabs v-model:value="bodyType" type="segment" size="small" class="body-type-tabs">
                <n-tab-pane
                  v-for="item in bodyTypeOptions"
                  :key="item.value"
                  :name="item.value"
                  :tab="item.label"
                />
              </n-tabs>
              <div v-if="bodyType === 'json'" class="json-body-panel">
                <div class="json-toolbar">
                  <n-button size="tiny" secondary>动态值</n-button>
                  <div class="json-toolbar-actions">
                    <n-button text size="tiny">提取</n-button>
                    <n-button text size="tiny">格式化</n-button>
                  </div>
                </div>
                <div class="json-editor">
                  <div class="line-gutter">1</div>
                  <textarea
                    v-model="bodyJsonContent"
                    class="json-textarea"
                    placeholder=""
                    spellcheck="false"
                  />
                </div>
              </div>
              <div v-else class="body-empty-panel">
                <span v-if="bodyType === 'none'">该请求没有 Body</span>
                <span v-else>该类型 Body 暂无内容</span>
              </div>
            </div>
          </n-tab-pane>
          <n-tab-pane name="headers" tab="Headers 1">
            <div class="pane-content">
              <div class="sub-title">Header 参数</div>
              <n-data-table
                :columns="headerColumns"
                :data="headerParams"
                :row-key="(row: any) => row.key"
                :bordered="true"
                :single-line="false"
                size="small"
                class="param-data-table"
                :pagination="false"
              />
              <n-button dashed block class="param-add-btn" @click="addHeaderParam">添加参数</n-button>
            </div>
          </n-tab-pane>
          <n-tab-pane name="cookies" tab="Cookies" />
          <n-tab-pane name="auth" tab="Auth" />
          <n-tab-pane name="pre" tab="前置操作" />
          <n-tab-pane name="post" tab="后置操作" />
          <n-tab-pane name="settings" tab="设置" />
        </n-tabs>

        <!-- 7. 返回响应部分 -->
        <div class="section-title response-title">返回响应</div>
        <div class="response-container">
          <n-tabs type="card" class="response-status-tabs">
            <n-tab-pane name="200" tab="200 成功" />
          </n-tabs>
          
          <div class="response-meta">
            <n-space :size="24">
              <span>HTTP 状态码: <n-text strong>200</n-text></span>
              <span>名称: <n-text strong>成功</n-text></span>
              <span>内容格式: 
                <n-select value="json" :options="[{label: 'JSON', value: 'json'}]" size="tiny" style="width: 80px; display: inline-block" />
              </span>
              <n-text depth="3">application/json</n-text>
            </n-space>
          </div>

          <div class="body-section">
            <div class="body-title">Body</div>
            <div class="schema-editor">
              <div class="schema-row root">
                <n-icon :component="CaretDownOutlined" class="expand-icon" />
                <span class="node-key">根节点</span>
                <span class="node-type">object</span>
                <div class="node-actions-schema">
                  <n-icon :component="EllipsisOutlined" />
                  <n-icon :component="PlusOutlined" />
                </div>
              </div>
              <div class="empty-fields">
                没有字段 <n-button text color="#7D33FF">添加</n-button>
              </div>
            </div>
          </div>

          <div class="response-footer-links">
            <n-button text class="link-btn"><template #icon><n-icon :component="PlusOutlined" /></template>添加示例</n-button>
            <n-button text class="link-btn"><template #icon><n-icon :component="PlusOutlined" /></template>添加描述</n-button>
            <n-button text class="link-btn"><template #icon><n-icon :component="PlusOutlined" /></template>Headers</n-button>
            <n-button text class="link-btn"><template #icon><n-icon :component="PlusOutlined" /></template>OAS 扩展</n-button>
          </div>
        </div>
      </div>
    </n-scrollbar>

    <div class="api-design-actions-bar">
      <n-space justify="end" :size="8">
        <n-button secondary @click="emit('switch-debug')">调试</n-button>
        <n-button type="primary" color="#7D33FF" class="save-btn" :loading="saving" @click="handleSave">
          保存
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, h } from 'vue'
import { 
  PlusOutlined,
  CaretDownOutlined, EllipsisOutlined
} from '@vicons/antd'
import { 
  NSpace, NText, NButton, NIcon, NInput, NInputGroup, NSelect, 
  NScrollbar, NTabs, NTabPane, NDataTable, useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import execRequest from '../api/exec-request'

const props = defineProps<{
  data: any
  envBaseUrl?: string
}>()

const emit = defineEmits<{
  'switch-debug': []
}>()

const message = useMessage()
const method = ref('GET')
const path = ref('')
const apiName = ref('新建 HTTP 接口')
const saving = ref(false)

const queryParams = ref<any[]>([])
const headerParams = ref<any[]>([])
const bodyType = ref('none')
const bodyJsonContent = ref('')

const initData = (data: any) => {
  if (!data) return
  method.value = data.method || 'GET'
  path.value = data.path || ''
  apiName.value = data.label || data.name || '新建 HTTP 接口'
  
  queryParams.value = Array.isArray(data.query_params)
    ? data.query_params.map((item: any, index: number) => ({
        key: `${Date.now()}-${index}-${Math.random()}`,
        name: item?.name || '',
        type: item?.type || 'string',
        example: item?.example || '',
        desc: item?.desc || ''
      }))
    : []
    
  headerParams.value = Array.isArray(data.header_params)
    ? data.header_params.map((item: any, index: number) => ({
        key: `${Date.now()}-${index}-${Math.random()}`,
        name: item?.name || '',
        type: item?.type || 'string',
        example: item?.example || '',
        desc: item?.desc || ''
      }))
    : []
    
  bodyType.value = data.body_definition?.type || 'none'
  bodyJsonContent.value = typeof data.body_definition?.content === 'string'
    ? data.body_definition.content
    : ''
}

// 监听 props.data 的变化，自动更新内部状态
watch(() => props.data, (newData) => {
  initData(newData)
}, { immediate: true, deep: true })

const methodOptions = [
  { label: 'GET', value: 'GET', style: 'color: #52c41a; font-weight: bold;' },
  { label: 'POST', value: 'POST', style: 'color: #faad14; font-weight: bold;' },
  { label: 'PUT', value: 'PUT', style: 'color: #1890ff; font-weight: bold;' },
  { label: 'DELETE', value: 'DELETE', style: 'color: #ff4d4f; font-weight: bold;' },
]

const paramTypeOptions = [
  { label: 'string', value: 'string' },
  { label: 'number', value: 'number' },
  { label: 'boolean', value: 'boolean' },
  { label: 'array', value: 'array' },
  { label: 'object', value: 'object' },
]

const bodyTypeOptions = [
  { label: 'none', value: 'none' },
  { label: 'form-data', value: 'form-data' },
  { label: 'x-www-form-urlencoded', value: 'x-www-form-urlencoded' },
  { label: 'JSON', value: 'json' },
  { label: 'XML', value: 'xml' },
  { label: 'text', value: 'text' },
  { label: 'Binary', value: 'binary' },
  { label: 'GraphQL', value: 'graphql' },
  { label: 'msgpack', value: 'msgpack' },
]

const addParam = () => {
  queryParams.value.push({
    key: `${Date.now()}-${Math.random()}`,
    name: '',
    type: 'string',
    example: '',
    desc: ''
  })
}

const removeParam = (key: string) => {
  queryParams.value = queryParams.value.filter((item: any) => item.key !== key)
}

const addHeaderParam = () => {
  headerParams.value.push({
    key: `${Date.now()}-${Math.random()}`,
    name: '',
    type: 'string',
    example: '',
    desc: ''
  })
}

const removeHeaderParam = (key: string) => {
  headerParams.value = headerParams.value.filter((item: any) => item.key !== key)
}

function buildParamColumns(onRemove: (key: string) => void): DataTableColumns<any> {
  return [
    {
      title: '参数名',
      key: 'name',
      render(row) {
        return h(NInput, {
          value: row.name,
          placeholder: '参数名',
          size: 'small',
          onUpdateValue: (v: string) => { row.name = v }
        })
      }
    },
    {
      title: '类型',
      key: 'type',
      width: 140,
      render(row) {
        return h(NSelect, {
          value: row.type,
          options: paramTypeOptions,
          size: 'small',
          onUpdateValue: (v: string) => { row.type = v }
        })
      }
    },
    {
      title: '示例值',
      key: 'example',
      render(row) {
        return h(NInput, {
          value: row.example,
          placeholder: '示例值',
          size: 'small',
          onUpdateValue: (v: string) => { row.example = v }
        })
      }
    },
    {
      title: '说明',
      key: 'desc',
      render(row) {
        return h(NInput, {
          value: row.desc,
          placeholder: '说明',
          size: 'small',
          onUpdateValue: (v: string) => { row.desc = v }
        })
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 88,
      align: 'center',
      render(row) {
        return h(NButton, { text: true, size: 'small', onClick: () => onRemove(row.key) }, { default: () => '删除' })
      }
    }
  ]
}

const queryColumns = buildParamColumns(removeParam)
const headerColumns = buildParamColumns(removeHeaderParam)

const handleSave = async () => {
  saving.value = true
  try {
    const payload = {
      name: apiName.value,
      method: method.value,
      path: path.value,
      folder_id: props.data?.parent_id || 0, 
      status: 'developing',
      owner: 'admin',
      query_params: queryParams.value.map(({ key, ...item }: any) => item),
      header_params: headerParams.value.map(({ key, ...item }: any) => item),
      body_definition: {
        type: bodyType.value,
        content: bodyType.value === 'json' ? bodyJsonContent.value : ''
      }
    }

    if (props.data?.id && !props.data?.isNew) {
      const res: any = await execRequest.patch(`/interfaces/${props.data.id}`, payload)
      message.success('保存成功')
      // 同步更新左侧树显示的名称和路径
      props.data.label = apiName.value
      props.data.method = method.value
      props.data.path = path.value
      props.data.query_params = queryParams.value.map(({ key, ...item }: any) => item)
      props.data.header_params = headerParams.value.map(({ key, ...item }: any) => item)
      props.data.body_definition = {
        type: bodyType.value,
        content: bodyType.value === 'json' ? bodyJsonContent.value : ''
      }
    } else {
      const res: any = await execRequest.post('/interfaces', payload)
      message.success('接口创建成功')
      // 更新当前数据 ID 和状态，避免重复创建
      if (res && res.data) {
        props.data.id = res.data.id
        props.data.isNew = false
        // 同步属性
        props.data.label = res.data.name
        props.data.method = res.data.method
        props.data.path = res.data.path
        props.data.query_params = queryParams.value.map(({ key, ...item }: any) => item)
        props.data.header_params = headerParams.value.map(({ key, ...item }: any) => item)
        props.data.body_definition = {
          type: bodyType.value,
          content: bodyType.value === 'json' ? bodyJsonContent.value : ''
        }
      }
    }
  } catch (err) {
    console.error('保存失败:', err)
    message.error('保存失败，请检查网络或参数')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.api-design-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.breadcrumb-header {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.method-indicator {
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 4px;
}

.method-indicator.get {
  color: #52c41a;
}

.api-name {
  font-size: 14px;
  color: #1a1f36;
}

.api-url-toolbar {
  padding: 8px 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.method-url-group {
  flex: 1;
  max-width: 800px;
}

.api-design-actions-bar {
  flex-shrink: 0;
  padding: 16px 0 0;
  margin-top: 8px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
}

.param-add-btn {
  margin-top: 8px;
}

.param-data-table :deep(.n-data-table-th) {
  font-size: 12px;
  font-weight: normal;
  color: #8792a2;
}

.url-input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 0 4px 4px 0;
  padding: 0 12px;
  flex: 1;
}

.base-url {
  color: #8792a2;
  font-size: 13px;
  white-space: nowrap;
  margin-right: 8px;
}

.path-input :deep(.n-input__border) {
  border: none !important;
}

.design-content {
  flex: 1;
  min-height: 0;
}

.content-inner {
  padding: 16px 0 0;
  max-width: 1200px;
  margin: 0 auto;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-indicator .dot {
  width: 6px;
  height: 6px;
  background: #1890ff;
  border-radius: 50%;
}

.status-indicator .text {
  font-size: 13px;
  color: #1a1f36;
}

.share-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8792a2;
}

.desc-input {
  margin-bottom: 24px;
}

.quick-links {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
}

.link-btn {
  color: #8792a2 !important;
  font-size: 13px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1f36;
  margin-bottom: 16px;
}

.param-tabs :deep(.n-tabs-tab) {
  font-size: 13px;
}

.sub-title {
  font-size: 13px;
  color: #8792a2;
  margin-bottom: 12px;
}

.body-type-tabs {
  margin-bottom: 12px;
}

.body-empty-panel {
  background: #fafafa;
  border: 1px solid #eef1f6;
  border-radius: 8px;
  padding: 16px;
  color: #a0a7b4;
  font-size: 13px;
}

.json-body-panel {
  border: 1px solid #eef1f6;
  border-radius: 8px;
  background: #fff;
}

.json-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #eef1f6;
  background: #fafafa;
}

.json-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #8a94a6;
  font-size: 12px;
}

.json-editor {
  display: flex;
  min-height: 360px;
  background: #fff;
}

.line-gutter {
  width: 36px;
  padding: 10px 8px;
  text-align: right;
  color: #9aa3b2;
  font-size: 12px;
  background: #fafafa;
  border-right: 1px solid #eef1f6;
}

.json-textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  padding: 10px 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #1f2a37;
}

.param-table th {
  background: #f8f9fc !important;
  color: #8792a2 !important;
  font-weight: normal !important;
  font-size: 12px;
}

.param-table td {
  vertical-align: middle;
}

.action-col {
  width: 64px;
  text-align: center;
}

.add-row {
  cursor: pointer;
  padding: 8px 12px !important;
}

.response-title {
  margin-top: 40px;
}

.response-container {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
}

.response-meta {
  background: #f8f9fc;
  padding: 12px;
  border-radius: 4px;
  margin: 16px 0;
  font-size: 13px;
}

.body-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.schema-editor {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 12px;
}

.schema-row {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 32px;
}

.node-key {
  color: #7D33FF;
  font-weight: 500;
}

.node-type {
  color: #1890ff;
}

.node-actions-schema {
  margin-left: auto;
  display: flex;
  gap: 12px;
  color: #8792a2;
}

.empty-fields {
  padding: 12px 28px;
  font-size: 13px;
  color: #8792a2;
}

.response-footer-links {
  margin-top: 16px;
  display: flex;
  gap: 20px;
}

.save-btn {
  padding: 0 24px;
}
</style>
