<template>
  <div class="user-mgmt-page">
    <div class="user-mgmt-inner">

      <!-- 页头 -->
      <header class="mgmt-header">
        <div class="mgmt-header-text">
          <p class="mgmt-eyebrow">权限中心</p>
          <h1 class="mgmt-title">用户管理</h1>
          <p class="mgmt-sub">管理平台账号与角色分配，精细控制成员访问级别与操作权限。</p>
        </div>
        <n-button type="primary" @click="showAddModal = true">
          <template #icon><n-icon :component="PlusOutlined" /></template>
          新增用户
        </n-button>
      </header>

      <!-- 搜索工具栏 -->
      <div class="mgmt-toolbar">
        <n-input v-model:value="searchForm.username" placeholder="搜索用户名..." clearable class="mgmt-search">
          <template #prefix><n-icon :component="SearchOutlined" class="mgmt-search-ico" /></template>
        </n-input>
        <n-input v-model:value="searchForm.phone_number" placeholder="搜索手机号..." clearable style="width: 200px" />
      </div>

      <!-- 用户表格 -->
      <n-card :bordered="false" class="mgmt-card">
        <n-table :single-line="false" class="mgmt-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>手机号</th>
              <th>所属角色</th>
              <th>启用状态</th>
              <th>注册时间</th>
              <th>修改时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <n-space align="center">
                  <n-avatar round size="small" :style="{ backgroundColor: 'var(--color-primary-500)' }">
                    {{ user.username?.slice(0, 1).toUpperCase() }}
                  </n-avatar>
                  <n-text strong>{{ user.username }}</n-text>
                </n-space>
              </td>
              <td><code class="code-text">{{ user.phone_number }}</code></td>
              <td>
                <n-tag :type="getRoleTagType(user.role_id)" round ghost>
                  {{ user.role_name || '未分配' }}
                </n-tag>
              </td>
              <td>
                <n-switch
                  :value="user.status"
                  :checked-value="1"
                  :unchecked-value="0"
                  @update:value="(val) => handleStatusToggle(user, val)"
                  :disabled="isProtectedUser(user)"
                >
                  <template #checked>启用</template>
                  <template #unchecked>禁用</template>
                </n-switch>
              </td>
              <td class="date-cell">{{ formatDate(user.created_at) }}</td>
              <td class="date-cell">{{ formatDate(user.updated_at) }}</td>
              <td>
                <n-space :size="4">
                  <n-button size="small" ghost type="primary" @click="handleEditUser(user)">编辑</n-button>
                  <n-button size="small" ghost type="info" @click="handleEditRole(user)">分配角色</n-button>
                  <n-button size="small" ghost type="warning" @click="handleOpenResetPwd(user)">重置密码</n-button>
                  <n-button size="small" ghost type="error" @click="handleDelete(user)" :disabled="isProtectedUser(user)">删除</n-button>
                </n-space>
              </td>
            </tr>
          </tbody>
        </n-table>
      </n-card>
    </div>

    <!-- 新增用户弹窗 -->
    <n-modal v-model:show="showAddModal" preset="dialog" title="新增用户" positive-text="确定" negative-text="取消" @positive-click="submitAddUser" @after-leave="resetForm">
      <n-form ref="formRef" :model="formValue" :rules="rules" style="margin-top: 20px">
        <n-form-item label="用户名" path="username">
          <n-input v-model:value="formValue.username" placeholder="请输入用户名" />
        </n-form-item>
        <n-form-item label="手机号" path="phone_number">
          <n-input v-model:value="formValue.phone_number" placeholder="请输入手机号" />
        </n-form-item>
        <n-form-item label="登录密码" path="password">
          <n-input v-model:value="formValue.password" type="password" show-password-on="mousedown" placeholder="请输入初始密码" />
        </n-form-item>
        <n-form-item label="所属角色" path="role_id">
          <n-select v-model:value="formValue.role_id" :options="roleOptions" placeholder="请选择角色" />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-switch v-model:value="formValue.status" :checked-value="1" :unchecked-value="0">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
        </n-form-item>
      </n-form>
    </n-modal>

    <!-- 分配角色对话框 -->
    <n-modal v-model:show="showRoleModal" preset="dialog" title="分配角色" positive-text="确定" negative-text="取消" @positive-click="submitRoleChange">
      <n-form style="margin-top: 20px">
        <n-form-item label="选择新角色">
          <n-select v-model:value="selectedRoleId" :options="roleOptions" placeholder="请选择角色" />
        </n-form-item>
      </n-form>
    </n-modal>

    <!-- 重置密码对话框 -->
    <n-modal v-model:show="showResetPwdModal" preset="dialog" title="重置密码" positive-text="确定" negative-text="取消" @positive-click="submitResetPwd">
      <n-form style="margin-top: 20px">
        <n-form-item label="新密码">
          <n-input v-model:value="newPassword" type="password" show-password-on="mousedown" placeholder="请输入新密码" />
        </n-form-item>
      </n-form>
    </n-modal>

    <!-- 编辑用户信息对话框 -->
    <n-modal v-model:show="showEditUserModal" preset="dialog" title="编辑用户信息" positive-text="保存并强制下线" negative-text="取消" @positive-click="submitEditUser">
      <n-form style="margin-top: 20px">
        <n-form-item label="用户名">
          <n-input v-model:value="editUserForm.username" placeholder="请输入用户名" />
        </n-form-item>
        <n-form-item label="手机号">
          <n-input v-model:value="editUserForm.phone_number" placeholder="请输入新手机号" />
        </n-form-item>
        <n-alert title="安全提醒" type="warning">
          修改关键信息后，该用户当前的登录状态将失效。如果修改的是您自己，您将被立即登出。
        </n-alert>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard, NTable, NButton, NTag, NSpace, NIcon, NAvatar, NText,
  NModal, NForm, NFormItem, NSelect, NInput, NSwitch, NAlert, useDialog, useMessage,
  FormRules
} from 'naive-ui'
import { PlusOutlined, SearchOutlined } from '@vicons/antd'
import request from '../api/request'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const users = ref<any[]>([])
const roles = ref<any[]>([])
const roleOptions = ref<any[]>([])

const searchForm = ref({ username: '', phone_number: '' })

const filteredUsers = computed(() =>
  users.value.filter(user => {
    const matchName = !searchForm.value.username ||
      user.username?.toLowerCase().includes(searchForm.value.username.toLowerCase())
    const matchPhone = !searchForm.value.phone_number ||
      user.phone_number?.includes(searchForm.value.phone_number)
    return matchName && matchPhone
  })
)

const showAddModal = ref(false)
const formValue = ref({ username: '', phone_number: '', password: '', role_id: 'TESTER', status: 1 })
const rules: FormRules = {
  username:     { required: true, message: '请输入用户名', trigger: 'blur' },
  phone_number: { required: true, message: '请输入手机号', trigger: 'blur' },
  password:     { required: true, message: '请输入初始密码', trigger: 'blur' },
  role_id:      { required: true, message: '请选择角色', type: 'number', trigger: 'change' }
}

const showRoleModal = ref(false)
const currentUser = ref<any>(null)
const selectedRoleId = ref<string | null>(null)

const showResetPwdModal = ref(false)
const newPassword = ref('')

const showEditUserModal = ref(false)
const editUserForm = ref({ id: '', username: '', phone_number: '' })

const dialog = useDialog()
const message = useMessage()

const loadData = async () => {
  try {
    const [userData, roleData]: any = await Promise.all([
      request.get('/rbac/users'),
      request.get('/rbac/roles')
    ])
    users.value = userData
    roles.value = roleData
    roleOptions.value = roleData.map((r: any) => ({ label: r.name, value: r.id }))
  } catch {
    message.error('加载数据失败')
  }
}

const getRoleTagType = (roleId: string) => {
  const normalized = String(roleId || '').toUpperCase()
  if (normalized === 'ADMIN') return 'error'
  if (normalized === 'DEV') return 'warning'
  return 'info'
}

const isProtectedUser = (user: any) => String(user?.role_id || '').toUpperCase() === 'ADMIN'

const submitAddUser = async () => {
  if (!formValue.value.username || !formValue.value.phone_number || !formValue.value.password) {
    message.error('请填写完整必填信息')
    return false
  }
  try {
    await request.post('/rbac/users', formValue.value)
    message.success('用户创建成功')
    loadData()
    return true
  } catch (err: any) {
    message.error(err.response?.data?.message || '创建失败')
    return false
  }
}

const resetForm = () => {
  formValue.value = { username: '', phone_number: '', password: '', role_id: 'TESTER', status: 1 }
}

const handleEditUser = (user: any) => {
  currentUser.value = user
  editUserForm.value = { id: user.id, username: user.username, phone_number: user.phone_number }
  showEditUserModal.value = true
}

const submitEditUser = async () => {
  try {
    await request.put(`/rbac/users/${editUserForm.value.id}`, {
      username: editUserForm.value.username,
      phone_number: editUserForm.value.phone_number
    })
    if (String(editUserForm.value.id) === String(userStore.uid || '')) {
      message.loading('正在重置您的会话，请使用新手机号重新登录...', { duration: 2000 })
      setTimeout(() => { userStore.logout(); window.location.href = '/login' }, 1500)
    } else {
      message.success('用户信息更新成功，该用户下次操作将被强制下线')
      loadData()
    }
    return true
  } catch (err: any) {
    message.error(err.response?.data?.message || '更新失败')
    return false
  }
}

const handleEditRole = (user: any) => {
  currentUser.value = user
  selectedRoleId.value = user.role_id
  showRoleModal.value = true
}

const handleStatusToggle = async (user: any, newVal: number) => {
  try {
    await request.put(`/rbac/users/${user.id}/status`, { status: newVal })
    message.success(`用户 ${user.username} 已${newVal === 1 ? '启用' : '禁用'}`)
    user.status = newVal
  } catch {
    message.error('状态更新失败')
  }
}

const handleOpenResetPwd = (user: any) => {
  currentUser.value = user
  newPassword.value = ''
  showResetPwdModal.value = true
}

const submitResetPwd = async () => {
  if (!newPassword.value) { message.error('请输入新密码'); return false }
  try {
    await request.put(`/rbac/users/${currentUser.value.id}/password`, { password: newPassword.value })
    message.success('密码已成功重置')
    showResetPwdModal.value = false
  } catch {
    message.error('密码重置失败')
  }
}

const submitRoleChange = async () => {
  if (!currentUser.value || !selectedRoleId.value) return
  try {
    await request.put(`/rbac/users/${currentUser.value.id}/role`, { roleId: selectedRoleId.value })
    message.success('角色分配成功')
    loadData()
  } catch {
    message.error('分配失败')
  }
}

const handleDelete = (user: any) => {
  if (isProtectedUser(user)) {
    message.warning('管理员账号不可删除')
    return
  }
  dialog.warning({
    title: '确认删除',
    content: `确定要删除用户 ${user.username} 吗？此操作不可撤销。`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await request.delete(`/rbac/users/${user.id}`)
        message.success('用户已删除')
        loadData()
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

onMounted(loadData)
</script>

<style scoped>
@import '@/styles/design-tokens.css';

.user-mgmt-page {
  position: absolute;
  inset: 0;
  overflow: auto;
  background: linear-gradient(165deg, var(--color-gray-50) 0%, #eef0f8 45%, var(--color-gray-50) 100%);
  font-family: var(--font-family-base);
}

.user-mgmt-inner {
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

.mgmt-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.mgmt-search {
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}

.mgmt-search-ico {
  color: var(--color-text-disabled);
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

.date-cell {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}
</style>
