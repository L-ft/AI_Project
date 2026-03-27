<template>
  <n-modal
    v-model:show="show"
    preset="card"
    :title="editData ? '编辑目录' : '新建目录'"
    style="width: 450px; border-radius: 12px;"
    :segmented="{ content: 'soft', footer: 'soft' }"
  >
    <n-form
      ref="formRef"
      :model="formModel"
      :rules="rules"
      label-placement="top"
      require-mark-placement="right-hanging"
    >
      <n-form-item label="名称" path="name">
        <n-input v-model:value="formModel.name" placeholder="请输入目录名称" />
      </n-form-item>
      
      <n-form-item label="父级目录" path="parentId">
        <n-select
          v-model:value="formModel.parentId"
          :options="folderOptions"
          placeholder="默认模块"
          clearable
        />
      </n-form-item>
    </n-form>
    
    <template #footer>
      <n-space justify="end">
        <n-button @click="show = false">取消</n-button>
        <n-button type="primary" :loading="loading" @click="handleSave" style="background-color: #7D33FF;">
          保存
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal, NForm, NFormItem, NInput, NSelect, NButton, NSpace, useMessage } from 'naive-ui'
import execRequest from '../api/exec-request'

const props = defineProps<{
  visible: boolean
  folders: any[]
  editData?: { id: number; name: string; parentId: number | null }
}>()

const emit = defineEmits(['update:visible', 'success'])

const show = ref(props.visible)
const loading = ref(false)
const message = useMessage()
const formRef = ref<any>(null)

const formModel = ref({
  name: '',
  parentId: null as number | null
})

const rules = {
  name: { required: true, message: '请输入目录名称', trigger: 'blur' }
}

const folderOptions = ref<any[]>([])

watch(() => props.visible, (val) => {
  show.value = val
  if (val) {
    // 如果是编辑模式，初始化表单数据
    if (props.editData) {
      formModel.value.name = props.editData.name
      formModel.value.parentId = props.editData.parentId
    } else {
      formModel.value.name = ''
      formModel.value.parentId = null
    }

    // 转换目录数据为 Select 选项 (递归展开所有目录)
    const options: any[] = []
    const flatten = (items: any[], level = 0) => {
      items.forEach(item => {
        if (item.type === 'folder') {
          // 编辑模式下，不能选择自己作为父目录
          if (props.editData && item.id === props.editData.id) return

          options.push({
            label: `${'  '.repeat(level)}${item.label}`,
            value: item.id
          })
          if (item.children) flatten(item.children, level + 1)
        }
      })
    }
    flatten(props.folders)
    folderOptions.value = options
  }
})

watch(() => show.value, (val) => {
  emit('update:visible', val)
})

const handleSave = () => {
  formRef.value?.validate(async (errors: any) => {
    if (!errors) {
      loading.value = true
      try {
        if (props.editData) {
          // 编辑模式：调用 PATCH 接口
          await execRequest.patch(`/folders/${props.editData.id}`, {
            name: formModel.value.name,
            parent_id: formModel.value.parentId || 0
          })
          message.success('目录修改成功')
        } else {
          // 新增模式：调用 POST 接口
          await execRequest.post('/folders', {
            name: formModel.value.name,
            parent_id: formModel.value.parentId || 0
          })
          message.success('目录创建成功')
        }
        emit('success')
        show.value = false
      } catch (err) {
        console.error(err)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
