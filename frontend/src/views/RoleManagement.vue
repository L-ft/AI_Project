<template>
  <div class="role-mgmt-page">
    <div class="role-mgmt-inner">

      <!-- 页头 -->
      <header class="mgmt-header">
        <div class="mgmt-header-text">
          <p class="mgmt-eyebrow">权限中心</p>
          <h1 class="mgmt-title">角色管理</h1>
          <p class="mgmt-sub">定义角色与权限边界，通过角色映射精确管控功能访问范围。</p>
        </div>
        <n-button type="primary" @click="handleAddRole">
          <template #icon><n-icon :component="PlusOutlined" /></template>
          新增角色
        </n-button>
      </header>

      <!-- 角色表格 -->
      <n-card :bordered="false" class="mgmt-card">
        <n-table :single-line="false">
          <thead>
            <tr>
              <th>角色名称</th>
              <th>角色代码</th>
              <th>描述</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role.id">
              <td><n-tag type="info" round>{{ role.name }}</n-tag></td>
              <td><code class="code-text">{{ role.code }}</code></td>
              <td class="desc-cell">{{ role.description || '-' }}</td>
              <td class="date-cell">{{ formatDate(role.created_at) }}</td>
              <td>
                <n-space :size="4">
                  <n-button size="small" ghost type="primary" @click="handleEditRole(role)">编辑</n-button>
                  <n-button size="small" ghost type="info" @click="handleEditPerms(role)">分配权限</n-button>
                  <n-button size="small" ghost type="error" :disabled="role.code === 'ADMIN'" @click="handleDeleteRole(role)">删除</n-button>
                </n-space>
              </td>
            </tr>
          </tbody>
        </n-table>
      </n-card>
    </div>

    <!-- 新增/编辑角色弹窗 -->
    <n-modal
      v-model:show="showModal"
      preset="dialog"
      :title="isEdit ? '编辑角色' : '新增角色'"
      positive-text="确定"
      negative-text="取消"
      @positive-click="submitRole"
      @after-leave="resetForm"
    >
      <n-form ref="formRef" :model="formValue" :rules="rules" style="margin-top: 20px">
        <n-form-item label="角色名称" path="name">
          <n-input v-model:value="formValue.name" placeholder="请输入角色名称（如：审核员）" />
        </n-form-item>
        <n-form-item v-if="!isEdit" label="角色代码" path="code">
          <n-input v-model:value="formValue.code" placeholder="请输入角色代码（如：AUDITOR）" />
        </n-form-item>
        <n-form-item label="角色描述" path="description">
          <n-input v-model:value="formValue.description" type="textarea" placeholder="请输入角色描述" />
        </n-form-item>
      </n-form>
    </n-modal>

    <!-- 分配权限对话框 -->
    <PermissionDialog ref="permDialogRef" :role-id="currentRoleId" @success="loadRoles" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NCard, NTable, NButton, NTag, NSpace, NIcon, NModal, NForm,
  NFormItem, NInput, useMessage, useDialog
} from 'naive-ui'
import { PlusOutlined } from '@vicons/antd'
import request from '../api/request'
import PermissionDialog from './PermissionDialog.vue'

const message = useMessage()
const dialog = useDialog()
const roles = ref<any[]>([])
const currentRoleId = ref<number | null>(null)
const permDialogRef = ref<any>(null)

const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const formValue = ref({ name: '', code: '', description: '' })
const rules = {
  name: { required: true, message: '请输入角色名称', trigger: 'blur' },
  code: { required: true, message: '请输入角色代码', trigger: 'blur' }
}

const loadRoles = async () => {
  const res: any = await request.get('/rbac/roles')
  roles.value = res
}

const handleAddRole = () => {
  isEdit.value = false
  editingId.value = null
  resetForm()
  showModal.value = true
}

const handleEditRole = (role: any) => {
  isEdit.value = true
  editingId.value = role.id
  formValue.value = { name: role.name, code: role.code, description: role.description || '' }
  showModal.value = true
}

const submitRole = async () => {
  if (!formValue.value.name || (!isEdit.value && !formValue.value.code)) {
    message.error('请填写完整信息')
    return false
  }
  try {
    if (isEdit.value && editingId.value) {
      await request.put(`/rbac/roles/${editingId.value}`, {
        name: formValue.value.name,
        description: formValue.value.description
      })
      message.success('角色更新成功')
    } else {
      await request.post('/rbac/roles', formValue.value)
      message.success('角色创建成功')
    }
    loadRoles()
    return true
  } catch {
    message.error(isEdit.value ? '更新失败' : '创建失败，代码可能已存在')
    return false
  }
}

const resetForm = () => { formValue.value = { name: '', code: '', description: '' } }

const handleEditPerms = (role: any) => {
  currentRoleId.value = role.id
  permDialogRef.value?.open()
}

const handleDeleteRole = (role: any) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除角色 "${role.name}" 吗？删除后该角色下的用户将失去相关权限。`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await request.delete(`/rbac/roles/${role.id}`)
        message.success('角色已成功删除')
        loadRoles()
      } catch {
        message.error('删除失败')
      }
    }
  })
}

const formatDate = (date: any) => {
  if (!date) return '-'
  const d = new Date(date)
  return isNaN(d.getTime()) ? '-' : d.toLocaleString()
}

onMounted(loadRoles)
</script>

<style scoped>
@import '@/styles/design-tokens.css';

.role-mgmt-page {
  position: absolute;
  inset: 0;
  overflow: auto;
  background: linear-gradient(165deg, var(--color-gray-50) 0%, #eef0f8 45%, var(--color-gray-50) 100%);
  font-family: var(--font-family-base);
}

.role-mgmt-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-6) var(--page-padding-x) var(--space-10);
}

.mgmt-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.mgmt-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary-500);
  margin-bottom: var(--space-2);
}

.mgmt-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  margin: 0 0 var(--space-2);
}

.mgmt-sub {
  font-size: var(--text-md);
  color: var(--color-text-tertiary);
  max-width: 520px;
  line-height: var(--leading-relaxed);
  margin: 0;
}

.mgmt-card {
  border-radius: var(--radius-lg) !important;
  border: 1px solid var(--color-border) !important;
  box-shadow: var(--shadow-sm);
  background: var(--color-bg-surface);
}

.code-text {
  font-family: var(--font-family-mono);
  font-size: var(--text-sm);
  background: var(--color-gray-100);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
}

.desc-cell {
  font-size: var(--text-md);
  color: var(--color-text-secondary);
  max-width: 320px;
}

.date-cell {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}
</style>
