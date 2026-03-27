<template>
  <aside
    :class="['page-sidebar', { collapsed, 'page-sidebar--light': siderVariant === 'light' }]"
    :style="{ width: collapsed ? '72px' : '300px' }"
  >
    <div class="sidebar-top">
      <div class="sidebar-toolbar">
        <div class="sb-search-box" v-if="!collapsed">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a0aab8" stroke-width="2.2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            :value="search"
            @input="$emit('update:search', $event.target.value)"
            type="text"
            :placeholder="searchPlaceholder"
            class="sb-search-input"
          />
        </div>

        <template v-if="!collapsed && showAddBtn">
          <n-dropdown
            v-if="addOptions && addOptions.length"
            :options="addOptions"
            trigger="click"
            placement="bottom-start"
            @select="(key) => $emit('add-option', key)"
          >
            <button class="sidebar-add-btn" :title="addTitle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </n-dropdown>
          <button v-else class="sidebar-add-btn" :title="addTitle" @click="$emit('add')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </template>

        <button class="sidebar-collapse-btn" @click="toggleCollapsed" :title="collapsed ? $t('sidebar.expand') : $t('sidebar.collapse')">
          <span>{{ collapsed ? '>' : '<' }}</span>
        </button>
      </div>
    </div>

    <nav class="sidebar-nav" v-show="!collapsed">
      <template v-if="showNavItems">
        <div
          v-for="item in navItems"
          :key="item.key"
          :class="['nav-item', { active: activeView === item.key }]"
          @click="handleNav(item.key)"
        >
          <div class="nav-icon-wrap" :style="item.bgStyle">
            <component :is="item.icon" />
          </div>
          <span class="nav-label">{{ $t(item.labelKey) }}</span>

          <!-- 指定 navAddItemKey 的导航项：badge 替换为 + 下拉按钮 -->
          <template v-if="item.key === navAddItemKey && addOptions && addOptions.length">
            <n-dropdown
              :options="addOptions"
              trigger="click"
              placement="bottom-start"
              @select="(key) => { $emit('add-option', key); $emit('update:activeView', item.key) }"
            >
              <span class="nav-add-icon" @click.stop title="新建">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
            </n-dropdown>
          </template>
          <template v-else>
            <span v-if="item.badge !== undefined" class="nav-badge">{{ item.badge }}</span>
          </template>

          <span v-if="item.badgeText" class="beta-pill">{{ $t(item.badgeTextKey) }}</span>
        </div>

        <div class="nav-divider" />
        <slot name="menu-extra" />
        <div class="nav-divider" />
      </template>

      <div v-if="$slots.tree" class="tree-content">
        <slot name="tree" />
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NDropdown } from 'naive-ui'
import { AppstoreOutlined, ApiOutlined, FileTextOutlined, FileMarkdownOutlined, FolderOutlined, ImportOutlined, CodeOutlined } from '@vicons/antd'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: String, default: '' },
  activeView: { type: String, default: 'all' },
  treeCount: { type: Number, default: 0 },
  searchPlaceholder: { type: String, default: '搜索接口 / 目录' },
  addTitle: { type: String, default: '新建' },
  mode: { type: String, default: 'automation' },
  showNavItems: { type: Boolean, default: true },
  showAddBtn: { type: Boolean, default: true },
  navAddItemKey: { type: String, default: '' },
  addOptions: { type: Array, default: () => [] },
  menuItems: {
    type: Array,
    default: () => []
  },
  /** dark：与单接口测试一致；light：白底侧栏（如自动化测试） */
  siderVariant: {
    type: String,
    default: 'dark',
    validator: (v: string) => ['dark', 'light'].includes(v)
  }
})

const emit = defineEmits(['update:search', 'update:activeView', 'add', 'add-option'])

const collapsed = ref(false)

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
}

const handleNav = (key: string) => {
  emit('update:activeView', key)
}

const defaultNavByMode = {
  automation: [
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
  ],
  interface: [
    {
      key: 'all',
      labelKey: 'sidebar.interfaceTest',
      icon: 'div',
      bgStyle: 'background:linear-gradient(135deg,#7d33ff,#a855f7)',
      badge: undefined,
      badgeTextKey: undefined
    },
    {
      key: 'directory',
      labelKey: 'sidebar.interfaceDirectory',
      icon: 'div',
      bgStyle: 'background:linear-gradient(135deg,#38bdf8,#22d3ee)',
      badge: undefined,
      badgeTextKey: undefined
    },
    {
      key: 'favorites',
      labelKey: 'sidebar.favorites',
      icon: 'div',
      bgStyle: 'background:linear-gradient(135deg,#a855f7,#ec4899)',
      badge: undefined,
      badgeTextKey: undefined
    }
  ]
}

const navItems = computed(() => {
  const items = props.menuItems.length > 0 ? props.menuItems : (defaultNavByMode[props.mode] || defaultNavByMode.automation)
  return items.map(item => ({
    ...item,
    badge: item.key === 'all' ? props.treeCount : item.badge
  }))
})

const search = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:search', v)
})
</script>

<style scoped>
/* 折叠按钮 — 暗色主题（默认） */
.sidebar-collapse-btn {
  flex-shrink: 0;
  padding: 0 8px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.55);
  border-radius: 7px;
  cursor: pointer;
  height: 34px;
  font-size: 12px;
  font-weight: 600;
  transition: background 0.18s, color 0.18s, border-color 0.18s;
}
.sidebar-collapse-btn:hover {
  background: rgba(99,102,241,0.2);
  color: #a5b4fc;
  border-color: rgba(99,102,241,0.35);
}

.page-sidebar--light .sidebar-collapse-btn {
  border: 1px solid #e4e7f0;
  background: #f8f9fc;
  color: #8792a2;
  height: 32px;
}
.page-sidebar--light .sidebar-collapse-btn:hover {
  border-color: #818cf8;
  color: #6366f1;
  background: rgba(99,102,241,0.06);
}

.tree-content {
  margin-top: 8px;
  padding: 0 4px;
}

/* 导航项加号图标 — 暗色主题（默认） */
.nav-add-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  color: #a5b4fc;
  background: rgba(99,102,241,0.2);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, transform 0.15s;
}
.nav-add-icon:hover {
  background: rgba(99,102,241,0.35);
  transform: rotate(90deg) scale(1.1);
}

.page-sidebar--light .nav-add-icon {
  color: #6366f1;
  background: rgba(99,102,241,0.1);
}
.page-sidebar--light .nav-add-icon:hover {
  background: rgba(99,102,241,0.2);
  transform: rotate(90deg) scale(1.1);
}
</style>