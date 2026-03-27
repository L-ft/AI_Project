<template>
  <n-modal
    v-model:show="show"
    preset="card"
    title="分配角色权限"
    style="width: 600px"
    :segmented="{ content: 'soft', footer: 'soft' }"
  >
    <div class="auth-tree-container">
      <n-tree
        block-line
        checkable
        expand-on-click
        :data="menuTree"
        :checked-keys="checkedKeys"
        @update:checked-keys="handleCheckedKeysChange"
        virtual-scroll
        style="height: 400px"
      />
    </div>
    
    <template #footer>
      <n-space justify="end">
        <n-button @click="show = false">取消</n-button>
        <n-button type="primary" :loading="loading" @click="handleSave">
          保存配置
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal, NTree, NButton, NSpace, useMessage } from 'naive-ui'
import request from '../api/request'

const props = defineProps<{ roleId: number | null }>()
const emit = defineEmits(['success'])

const show = ref(false)
const loading = ref(false)
const checkedKeys = ref<number[]>([])
const menuTree = ref<any[]>([])
const message = useMessage()

// 加载原始菜单树
const loadMenuTree = async () => {
  try {
    const res: any = await request.get('/rbac/menus')
    // 转换为 Naive UI Tree 结构
    const buildTree = (data: any[], parentId: number = 0) => {
      return data
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          label: item.title,
          key: item.id,
          children: buildTree(data, item.id)
        }))
    }
    menuTree.value = buildTree(res)
  } catch (err) {
    message.error('加载菜单树失败')
  }
}

// 加载当前角色的已选权限
const loadRolePerms = async () => {
  if (!props.roleId) return
  try {
    const res: any = await request.get(`/rbac/role-perms/${props.roleId}`)
    checkedKeys.value = res
  } catch (err) {
    message.error('加载角色权限失败')
  }
}

const handleCheckedKeysChange = (keys: number[]) => {
  checkedKeys.value = keys
}

const handleSave = async () => {
  if (!props.roleId) return
  loading.value = true
  try {
    await request.post('/rbac/assign-perms', {
      roleId: props.roleId,
      menuIds: checkedKeys.value
    })
    message.success('角色权限配置已保存')
    show.value = false
    emit('success')
  } catch (e) {
    message.error('保存失败')
  } finally {
    loading.value = false
  }
}

const open = async () => {
  await loadMenuTree()
  await loadRolePerms()
  show.value = true
}

defineExpose({ open })
</script>

<style scoped>
.auth-tree-container {
  padding: 10px;
  background: #f9faff;
  border-radius: 8px;
}
</style>
