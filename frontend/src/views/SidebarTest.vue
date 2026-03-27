<template>
  <div class="test-page">
    <h1>SidebarNavigation 功能测试</h1>

    <div class="test-controls">
      <button @click="toggleLanguage">切换语言 ({{ currentLang }})</button>
      <button @click="updateMenuItems">更新菜单项</button>
      <button @click="changeTreeCount">更改树计数 ({{ treeCount }})</button>
    </div>

    <div class="page-layout">
      <SidebarNavigation
        v-model:search="searchValue"
        v-model:activeView="activeView"
        :treeCount="treeCount"
        :menuItems="customMenuItems"
        searchPlaceholder="搜索测试..."
        addTitle="添加测试项"
        @add="handleAdd"
      >
        <template #tree>
          <div class="test-tree">
            <div v-for="item in testTreeData" :key="item.id" class="test-tree-item">
              {{ item.name }} ({{ item.count }})
            </div>
          </div>
        </template>
      </SidebarNavigation>

      <div class="page-main">
        <div class="test-info">
          <h2>当前状态</h2>
          <p>搜索值: {{ searchValue }}</p>
          <p>活动视图: {{ activeView }}</p>
          <p>树计数: {{ treeCount }}</p>
          <p>语言: {{ currentLang }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SidebarNavigation from '../components/SidebarNavigation.vue'

const { t, locale } = useI18n()

const searchValue = ref('')
const activeView = ref('all')
const treeCount = ref(5)
const currentLang = ref('zh')

const customMenuItems = ref([
  {
    key: 'all',
    labelKey: 'sidebar.testScenarios',
    icon: 'div',
    bgStyle: 'background:linear-gradient(135deg,#7d33ff,#a855f7)',
    badge: undefined,
    badgeTextKey: undefined
  },
  {
    key: 'scheduled',
    labelKey: 'sidebar.scheduledTasks',
    icon: 'div',
    bgStyle: 'background:linear-gradient(135deg,#f97316,#fb923c)',
    badge: undefined,
    badgeTextKey: 'sidebar.beta'
  },
  {
    key: 'reports',
    labelKey: 'sidebar.testReports',
    icon: 'div',
    bgStyle: 'background:linear-gradient(135deg,#0ea5e9,#38bdf8)',
    badge: undefined,
    badgeTextKey: undefined
  }
])

const testTreeData = ref([
  { id: 1, name: '测试用例1', count: 10 },
  { id: 2, name: '测试用例2', count: 5 },
  { id: 3, name: '测试用例3', count: 8 }
])

const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
  locale.value = currentLang.value
}

const updateMenuItems = () => {
  customMenuItems.value = [
    ...customMenuItems.value,
    {
      key: 'new-feature',
      labelKey: 'sidebar.testScenarios', // 使用现有翻译
      icon: 'div',
      bgStyle: 'background:linear-gradient(135deg,#10b981,#34d399)',
      badge: 99,
      badgeTextKey: undefined
    }
  ]
}

const changeTreeCount = () => {
  treeCount.value = Math.floor(Math.random() * 20) + 1
}

const handleAdd = () => {
  alert('添加新项目!')
}
</script>

<style scoped>
.test-page {
  padding: 20px;
}

.test-controls {
  margin-bottom: 20px;
}

.test-controls button {
  margin-right: 10px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.test-controls button:hover {
  background: #f5f5f5;
}

.page-layout {
  display: flex;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.page-main {
  flex: 1;
  padding: 20px;
  background: #fafafa;
}

.test-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.test-info h2 {
  margin-top: 0;
  color: #333;
}

.test-info p {
  margin: 8px 0;
  color: #666;
}

.test-tree {
  padding: 10px;
}

.test-tree-item {
  padding: 8px 12px;
  margin: 4px 0;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 14px;
}
</style>