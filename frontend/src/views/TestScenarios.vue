<template>
  <div class="page-layout">

    <!-- ── 左侧边栏 ── -->
    <SidebarNavigation
      sider-variant="light"
      v-model:search="sidebarSearch"
      v-model:activeView="activeView"
      :treeCount="scenarios.length"
      searchPlaceholder="搜索场景..."
      :showNavItems="false"
      :showAddBtn="false"
    >
      <template #tree>
        <n-tree
          block-line
          expand-on-click
          :data="sidebarTreeData"
          :pattern="sidebarSearch"
          :render-prefix="renderSidebarPrefix"
          :render-suffix="renderSidebarSuffix"
          :on-update:selected-keys="handleSidebarSelect"
          :selected-keys="selectedSidebarKeys"
          :expanded-keys="expandedFolderKeys"
          :on-update:expanded-keys="(keys) => expandedFolderKeys = keys"
          class="scenario-tree"
        />
      </template>
    </SidebarNavigation>


    <!-- ── 主内容区 ── -->
    <div class="page-main">
      <!-- 渐变顶栏 -->
      <div class="ts-topbar">
        <div class="ts-topbar-deco"></div>
        <div class="ts-topbar-inner">
          <div class="ts-topbar-left">
            <div class="ts-topbar-breadcrumb">
              <span>自动化测试</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              <span>测试场景</span>
            </div>
            <div class="ts-topbar-title-row">
              <div class="ts-topbar-title-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <h1 class="ts-topbar-title">自动化测试</h1>
            </div>
          </div>
          <div class="ts-topbar-right">
            <span class="ts-topbar-pill ts-topbar-pill--green">
              <i class="ts-pill-dot"></i>服务在线
            </span>
            <span class="ts-topbar-pill">{{ scenarios.length }} 个场景</span>
          </div>
        </div>
      </div>

      <!-- ══ 欢迎页（首次进入） — 布局与动画对齐 InterfaceTest 欢迎页 ══ -->
      <transition name="it-fade" mode="out-in">
        <div v-if="activeView === 'welcome'" key="ts-welcome" class="welcome-container">
          <div class="it-welcome-wrap">
            <div class="it-hero">
              <div class="it-hero-glow-ring it-hero-ring-3"></div>
              <div class="it-hero-glow-ring it-hero-ring-2"></div>
              <div class="it-hero-glow-ring it-hero-ring-1"></div>
              <div class="it-hero-icon-box">
                <n-icon :component="ThunderboltOutlined" :size="32" class="it-hero-icon" />
              </div>
              <h2 class="it-hero-title">欢迎使用自动化测试</h2>
              <p class="it-hero-sub">从左侧选择场景，或新建一个测试场景开始自动化测试之旅</p>
              <div class="it-hero-actions">
                <button type="button" class="it-hero-btn it-hero-btn--primary" @click="enterScenarioList(); openCreateModal()">
                  <n-icon :component="PlusOutlined" :size="14" />
                  新建测试场景
                </button>
                <button type="button" class="it-hero-btn it-hero-btn--ghost" @click="activeView = 'scheduled'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
                  新建定时任务
                </button>
              </div>
            </div>

            <div class="it-stats-row">
              <div class="it-stat-card it-stat-card--blue">
                <div class="it-stat-icon">
                  <n-icon :component="ThunderboltOutlined" :size="22" />
                </div>
                <div class="it-stat-body">
                  <div class="it-stat-num">{{ scenarios.length }}</div>
                  <div class="it-stat-label">全部场景</div>
                </div>
                <div class="it-stat-trend it-stat-trend--up">↑</div>
              </div>
              <div class="it-stat-card it-stat-card--green">
                <div class="it-stat-icon">
                  <n-icon :component="CheckCircleOutlined" :size="22" />
                </div>
                <div class="it-stat-body">
                  <div class="it-stat-num">{{ scenarios.filter(s => s.last_result?.status === 'passed').length }}</div>
                  <div class="it-stat-label">最近通过</div>
                </div>
                <div class="it-stat-trend it-stat-trend--up">↑</div>
              </div>
              <div class="it-stat-card it-stat-card--rose">
                <div class="it-stat-icon">
                  <n-icon :component="CloseCircleOutlined" :size="22" />
                </div>
                <div class="it-stat-body">
                  <div class="it-stat-num">{{ scenarios.filter(s => s.last_result?.status === 'failed').length }}</div>
                  <div class="it-stat-label">最近失败</div>
                </div>
                <div class="it-stat-trend it-stat-trend--down">↓</div>
              </div>
              <div class="it-stat-card it-stat-card--purple">
                <div class="it-stat-icon">
                  <n-icon :component="ClockCircleOutlined" :size="22" />
                </div>
                <div class="it-stat-body">
                  <div class="it-stat-num">{{ scenarios.filter(s => s.last_result?.status === 'running').length }}</div>
                  <div class="it-stat-label">运行中</div>
                </div>
                <div class="it-stat-trend it-stat-trend--up">↑</div>
              </div>
            </div>

            <div class="it-feature-row">
              <div class="it-feat-card it-feat-card--debug">
                <div class="it-feat-card-bg"></div>
                <div class="it-feat-icon-wrap">
                  <n-icon :component="ThunderboltOutlined" :size="28" />
                </div>
                <h3 class="it-feat-title">批量执行</h3>
                <p class="it-feat-desc">一键运行全部场景，自动生成测试报告</p>
                <div class="it-feat-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
              </div>
              <div class="it-feat-card it-feat-card--mock">
                <div class="it-feat-card-bg"></div>
                <div class="it-feat-icon-wrap">
                  <n-icon :component="ClockCircleOutlined" :size="28" />
                </div>
                <h3 class="it-feat-title">定时调度</h3>
                <p class="it-feat-desc">设置 Cron 表达式，定时自动触发测试</p>
                <div class="it-feat-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
              </div>
              <div class="it-feat-card it-feat-card--env">
                <div class="it-feat-card-bg"></div>
                <div class="it-feat-icon-wrap">
                  <n-icon :component="FileOutlined" :size="28" />
                </div>
                <h3 class="it-feat-title">测试报告</h3>
                <p class="it-feat-desc">详细的成功/失败统计，支持分享导出</p>
                <div class="it-feat-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- ══ 定时任务视图 ══ -->
      <template v-if="activeView === 'scheduled'">
        <div class="content-panel">
          <header class="main-header">
            <div class="header-tabs">
              <button :class="['htab', { active: scheduledTab === 'tasks' }]" @click="scheduledTab = 'tasks'">
                定时任务
                <span v-if="scheduledTab === 'tasks'" class="htab-underline" />
              </button>
              <button :class="['htab', { active: scheduledTab === 'history' }]" @click="scheduledTab = 'history'">
                运行历史
                <span v-if="scheduledTab === 'history'" class="htab-underline" />
              </button>
            </div>
          </header>

          <!-- 无 Runner 提示横幅 -->
          <div class="runner-banner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fa8c16" style="flex-shrink:0"><path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
            <span>没有部署 Runner。请 <a href="#" class="runner-link">在此处</a> 部署通用 Runner 后，再使用定时任务功能。</span>
          </div>

          <!-- 搜索 + 新建 -->
          <div class="scheduled-toolbar">
            <n-input v-model:value="scheduledSearch" placeholder="输入关键字进行搜索" size="small" clearable style="width:280px">
              <template #suffix><n-icon :component="SearchOutlined" style="color:#a0aab8" /></template>
            </n-input>
            <n-button type="primary" size="small" class="new-btn-scheduled">
              <template #icon><n-icon :component="PlusOutlined" /></template>
              新建
            </n-button>
          </div>

          <!-- 表头 -->
          <div class="scheduled-table">
            <div class="st-head">
              <div class="st-col-name">任务信息</div>
              <div class="st-col-enable">启用</div>
              <div class="st-col-next">下次运行时间</div>
            </div>
            <div class="st-empty">
              <div class="st-empty-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0c8d8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
                </svg>
              </div>
              <div class="st-empty-text">暂无数据</div>
              <a href="#" class="st-empty-link">了解定时任务 ↗</a>
            </div>
          </div>
        </div>
      </template>

      <!-- ══ 测试场景 / 测试报告视图 ══ -->
      <template v-if="activeView !== 'welcome' && activeView !== 'scheduled'">

      <!-- 测试报告视图 -->
      <template v-if="activeView === 'reports'">
        <div class="content-panel">
          <header class="main-header">
            <div class="rpt-filter-bar">
              <div class="rpt-scope-tabs">
                <button :class="['rpt-scope-btn', { active: rptScope === 'personal' }]" @click="rptScope = 'personal'">个人</button>
                <button :class="['rpt-scope-btn', { active: rptScope === 'shared' }]" @click="rptScope = 'shared'">共享</button>
              </div>
              <n-select v-model:value="rptType" :options="[{ label: '全部类型', value: 'all' }, { label: '手动', value: 'manual' }, { label: '批量运行', value: 'batch' }, { label: '定时', value: 'scheduled' }]" size="small" style="width:120px" />
            </div>
            <div class="header-actions">
              <n-input v-model:value="rptSearch" placeholder="搜索场景名、创建者、标题…" size="small" clearable style="width:240px">
                <template #suffix><n-icon :component="SearchOutlined" style="color:#a0aab8" /></template>
              </n-input>
              <n-button size="small" quaternary @click="fetchReportsFromApi">
                <template #icon><n-icon :component="SyncOutlined" /></template>
                刷新
              </n-button>
            </div>
          </header>
          <n-spin :show="reportsLoading" class="rpt-spin-wrap">
          <div class="rpt-table-wrap">
            <div class="rpt-head">
              <div class="rpt-col-info">报告信息</div>
              <div class="rpt-col-status">状态</div>
              <div class="rpt-col-result">结果</div>
              <div class="rpt-col-op">操作</div>
            </div>
            <div v-if="!reportsLoading && filteredReports.length === 0" class="rpt-empty">
              <div class="rpt-empty-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0c8d8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg></div>
              <div class="rpt-empty-text">暂无测试报告（在场景详情中执行步骤后将自动落库）</div>
            </div>
            <div v-for="r in filteredReports" :key="r.id" class="rpt-row">
              <div class="rpt-col-info">
                <div class="rpt-name-wrap"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7d33ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span class="rpt-name">{{ r.name }}</span></div>
                <div class="rpt-meta"><span>{{ r.env }}</span><span>{{ r.time }}</span><span>{{ r.creator }}</span><span>{{ r.runMode }}</span><span>{{ r.triggerMode }}</span></div>
              </div>
              <div class="rpt-col-status">
                <span :class="['rpt-status-badge', r.status]">
                  <svg v-if="r.status==='done'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                  {{ r.status === 'done' ? '已完成' : r.status === 'running' ? '运行中' : '失败' }}
                </span>
              </div>
              <div class="rpt-col-result">
                <div class="rpt-result-line">总请求数：{{ r.total }} &nbsp; 成功：<span class="rpt-success">{{ r.success }}</span></div>
                <div class="rpt-result-line">失败：<span class="rpt-fail">{{ r.fail }}</span> &nbsp; 未测：<span class="rpt-skip">{{ r.skip }}</span></div>
              </div>
              <div class="rpt-col-op">
                <n-button size="tiny" quaternary @click="openReportArchiveDetail(r)">查看</n-button>
              </div>
            </div>
          </div>
          </n-spin>
        </div>
      </template>

      <!-- 测试场景视图 -->
      <template v-else>
        <div class="content-panel">
          <!-- ── 列表总览（点击左侧「测试场景」根节点）── -->
          <template v-if="scenarioPanelMode === 'list'">
          <header class="main-header">
        <div class="header-tabs">
          <button :class="['htab', { active: mainTab === 'scenarios' }]" @click="mainTab = 'scenarios'">
            全部场景
            <span v-if="mainTab === 'scenarios'" class="htab-underline" />
          </button>
          <button :class="['htab', { active: mainTab === 'reports' }]" @click="mainTab = 'reports'">
            测试报告
            <span v-if="mainTab === 'reports'" class="htab-underline" />
          </button>
        </div>
        <div class="header-actions">
          <n-input v-model:value="tableSearch" placeholder="搜索场景名称..." size="small" clearable style="width:200px">
            <template #prefix><n-icon :component="SearchOutlined" style="color:#a0aab8" /></template>
          </n-input>
          <n-button size="small" class="run-all-btn" :loading="batchRunning" :disabled="batchRunning" @click="runAll">
            <template #icon><n-icon :component="CaretRightOutlined" /></template>
            批量运行
          </n-button>
        </div>
      </header>

      <!-- 统计卡片行 -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ scenarios.length }}</div>
          <div class="stat-label">全部场景</div>
        </div>
        <div class="stat-card green">
          <div class="stat-value">{{ scenarios.filter(s => s.last_result?.status === 'passed').length }}</div>
          <div class="stat-label">最近通过</div>
        </div>
        <div class="stat-card red">
          <div class="stat-value">{{ scenarios.filter(s => s.last_result?.status === 'failed').length }}</div>
          <div class="stat-label">最近失败</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-value">{{ scenarios.filter(s => s.last_result?.status === 'running').length }}</div>
          <div class="stat-label">运行中</div>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-wrap">
        <div class="table-title-bar">
          <div class="table-title-row">
            <span class="table-title">测试场景列表</span>
            <span class="table-count">共 <b>{{ filteredScenarios.length }}</b> 个</span>
          </div>
          <div v-if="checkedIds.size > 0" class="batch-select-line">
            <span class="batch-select-text">已选 <b>{{ checkedIds.size }}</b> / {{ filteredScenarios.length }} 项</span>
            <n-button text type="primary" size="small" @click="clearSelection">取消选择</n-button>
          </div>
          <div v-if="checkedIds.size > 0" class="batch-toolbar">
            <n-button quaternary size="small" class="batch-tool-btn" @click="openBatchPriorityModal">
              <template #icon><n-icon :component="MenuOutlined" /></template>
              优先级
            </n-button>
            <n-button quaternary size="small" class="batch-tool-btn" @click="openBatchAddTagModal">
              <template #icon><n-icon :component="TagsOutlined" /></template>
              增加标签
            </n-button>
            <n-button quaternary size="small" class="batch-tool-btn" @click="openBatchRemoveTagModal">
              <template #icon><n-icon :component="TagsOutlined" /></template>
              删除标签
            </n-button>
            <n-button quaternary size="small" class="batch-tool-btn" @click="openBatchMoveModal">
              <template #icon><n-icon :component="FolderOutlined" /></template>
              移动
            </n-button>
            <n-button quaternary size="small" class="batch-tool-btn batch-tool-danger" @click="confirmBatchDelete">
              <template #icon><n-icon :component="DeleteOutlined" /></template>
              删除
            </n-button>
            <n-button quaternary size="tiny" circle class="batch-toolbar-close" @click="clearSelection">
              <template #icon><n-icon :component="CloseOutlined" /></template>
            </n-button>
          </div>
        </div>

        <!-- 表头 -->
        <div class="t-head">
          <div class="tc-check">
            <n-checkbox :checked="allFilteredChecked" :indeterminate="someFilteredChecked" @update:checked="toggleAll" />
          </div>
          <div class="tc-name">场景名称</div>
          <div class="tc-priority">优先级</div>
          <div class="tc-tags">标签</div>
          <div class="tc-env">运行环境</div>
          <div class="tc-result">最近结果</div>
          <div class="tc-time">创建时间</div>
          <div class="tc-creator">创建人</div>
        </div>

        <!-- 加载 -->
        <div v-if="loading" class="t-state">
          <n-spin size="large" />
          <span style="margin-top:12px;color:#a0aab8;font-size:13px">加载中...</span>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredScenarios.length === 0" class="t-state">
          <div class="empty-illustration">
            <n-icon :component="AppstoreOutlined" style="font-size:48px;color:#e0e4ef" />
          </div>
          <div class="empty-title">暂无测试场景</div>
          <div class="empty-desc">点击左侧「新建测试场景」开始创建</div>
          <n-button type="primary" size="small" class="new-btn-inline" @click="openCreateModal">
            <template #icon><n-icon :component="PlusOutlined" /></template>
            立即新建
          </n-button>
        </div>

        <!-- 数据行 -->
        <div
          v-for="row in filteredScenarios"
          :key="row.id"
          :class="['t-row', { selected: checkedIds.has(row.id) }]"
        >
          <div class="tc-check" @click.stop>
            <n-checkbox :checked="checkedIds.has(row.id)" @update:checked="toggleCheck(row.id)" />
          </div>
          <div class="tc-name" @click.stop="openScenarioDetail(row)">
            <div class="row-name-wrap">
              <span class="row-name">{{ row.name }}</span>
              <span v-if="row.description" class="row-desc">{{ row.description }}</span>
            </div>
          </div>
          <div class="tc-priority">
            <span :class="['p-badge', (row.priority || 'P0').toLowerCase()]">
              {{ row.priority || 'P0' }}
            </span>
          </div>
          <div class="tc-tags">
            <span v-if="row.tags" class="tag-chip">{{ row.tags }}</span>
            <span v-else class="dash">—</span>
          </div>
          <div class="tc-env">
            <span v-if="row.env_name" class="env-chip">
              <n-icon :component="GlobalOutlined" style="font-size:11px" />
              {{ row.env_name }}
            </span>
            <span v-else class="dash">—</span>
          </div>
          <div class="tc-result">
            <span v-if="row.last_result?.status === 'passed'" class="r-badge passed">
              <n-icon :component="CheckCircleOutlined" />通过
            </span>
            <span v-else-if="row.last_result?.status === 'failed'" class="r-badge failed">
              <n-icon :component="CloseCircleOutlined" />失败
            </span>
            <span v-else-if="row.last_result?.status === 'running'" class="r-badge running">
              <n-icon :component="SyncOutlined" />运行中
            </span>
            <span v-else class="dash">—</span>
          </div>
          <div class="tc-time">{{ row.created_at ? row.created_at.slice(0, 10) : '—' }}</div>
          <div class="tc-creator">
            <div v-if="row.creator" class="creator-wrap">
              <div class="creator-avatar">{{ row.creator.slice(0, 1).toUpperCase() }}</div>
              <span>{{ row.creator }}</span>
            </div>
            <span v-else class="dash">—</span>
          </div>
        </div>
      </div>
          </template>

          <!-- ── 单场景详情（点击树中具体场景节点）── -->
          <template v-else-if="detailScenario">
            <div class="scenario-detail-root">
              <header class="detail-page-header">
                <div class="detail-page-tabs">
                  <button
                    v-for="t in detailMainTabs"
                    :key="t.key"
                    :class="['dpt-btn', { active: detailMainTab === t.key }]"
                    type="button"
                    @click="detailMainTab = t.key"
                  >
                    <span>{{ t.label }}</span>
                    <span v-if="t.key === 'steps'" class="dpt-tab-count">{{ detailStepCount }}</span>
                    <span v-if="detailMainTab === t.key" class="dpt-underline" />
                  </button>
                </div>
                <div class="detail-page-header-right">
                  <n-button quaternary circle size="small"><template #icon><n-icon :component="ClockCircleOutlined" /></template></n-button>
                  <n-button quaternary circle size="small"><template #icon><n-icon :component="SettingOutlined" /></template></n-button>
                </div>
              </header>

              <div class="scenario-detail-body">
                <div class="scenario-detail-main detail-main-flex">
                  <template v-if="detailMainTab === 'steps'">
                    <div :class="['detail-steps-workspace', { 'workspace-empty': detailStepCount === 0 }]">
                      <aside class="step-list-sidebar">
                        <div class="step-list-toolbar">
                          <div class="step-toolbar-title-box">
                            <span class="step-toolbar-eyebrow">场景编排</span>
                            <span class="step-toolbar-title">测试步骤</span>
                            <span class="step-toolbar-caption">{{ detailScenario?.name || '当前场景' }} · 共 {{ detailStepCount }} 步</span>
                          </div>
                          <n-select
                            v-model:value="detailEnvId"
                            :options="envOptions"
                            size="small"
                            placeholder="请选择环境"
                            class="step-toolbar-env"
                            :consistent-menu-width="false"
                          />
                        </div>
                        <div class="step-toolbar-action-row">
                          <button type="button" class="step-link-btn primary" @click="openStepWizard">快速引导</button>
                          <button type="button" class="step-link-btn muted" :disabled="stepBulkSelectedCount === 0" @click="removeCheckedScenarioSteps">删除所选</button>
                          <button type="button" class="step-link-btn" @click="runScenarioSteps('current')">从当前执行</button>
                          <button type="button" class="step-link-btn" @click="runScenarioSteps('all')">全部执行</button>
                        </div>
                        <div class="step-toolbar-action-row secondary">
                          <button type="button" class="step-link-btn" @click="syncSelectedScenarioStep">同步配置</button>
                          <button type="button" class="step-link-btn" @click="runScenarioSteps('failed')">从失败处执行</button>
                          <button type="button" class="step-link-btn muted" :disabled="!stepScenarioRunning" @click="stopScenarioStepRun">停止运行</button>
                        </div>
                        <div class="step-toolbar-spotlight">
                          <button type="button" class="step-spotlight-card" @click="openStepWizard">
                            <span class="step-spotlight-title">快速引导</span>
                            <span class="step-spotlight-desc">一键补齐认证、断言与变量提取</span>
                          </button>
                          <button type="button" class="step-spotlight-card" @click="runScenarioSteps('all')">
                            <span class="step-spotlight-title">全部执行</span>
                            <span class="step-spotlight-desc">按步骤顺序完整运行当前场景</span>
                          </button>
                          <button type="button" class="step-spotlight-card" @click="runScenarioSteps('failed')">
                            <span class="step-spotlight-title">从失败处执行</span>
                            <span class="step-spotlight-desc">只重跑最近失败的步骤</span>
                          </button>
                        </div>
                        <div class="step-filter-bar">
                          <n-input v-model:value="stepListSearch" size="small" placeholder="搜索步骤名称、路径或方法" clearable class="step-filter-search">
                            <template #prefix><n-icon :component="SearchOutlined" style="color:#a0aab8" /></template>
                          </n-input>
                          <n-select
                            v-model:value="stepMethodFilter"
                            :options="stepMethodFilterOptions"
                            size="small"
                            class="step-filter-method"
                            :consistent-menu-width="false"
                          />
                          <n-popover
                            v-model:show="addStepPopoverShow"
                            trigger="click"
                            placement="bottom-end"
                            :flip="true"
                            :show-arrow="false"
                            to="body"
                            :z-index="4000"
                            raw
                            class="add-step-popover-trigger"
                          >
                            <template #trigger>
                              <n-button type="primary" class="step-filter-add-btn">
                                <template #icon><n-icon :component="PlusOutlined" /></template>
                                添加步骤
                              </n-button>
                            </template>
                            <div class="add-step-menu" @click.stop>
                              <div class="add-step-section">
                                <div class="add-step-section-title">HTTP 请求与导入</div>
                                <div
                                  v-for="item in addStepRequestItems"
                                  :key="item.key"
                                  class="add-step-item add-step-item-full"
                                  @click="handleAddStepItem(item)"
                                >
                                  <span :class="['add-step-icon', item.iconBg]">
                                    <n-icon :component="item.icon" :size="16" />
                                  </span>
                                  <span class="add-step-label">{{ item.label }}</span>
                                </div>
                              </div>
                              <div class="add-step-section">
                                <div class="add-step-section-title">流程与工具</div>
                                <div class="add-step-grid">
                                  <div
                                    v-for="item in addStepOtherItems"
                                    :key="item.key"
                                    class="add-step-item"
                                    @click="handleAddStepItem(item)"
                                  >
                                    <span :class="['add-step-icon', item.iconBg]">
                                      <n-icon :component="item.icon" :size="16" />
                                    </span>
                                    <span class="add-step-label">{{ item.label }}</span>
                                  </div>
                                </div>
                              </div>
                              <div class="add-step-section">
                                <div class="add-step-section-title">场景引用</div>
                                <div
                                  v-for="item in addStepScenarioItems"
                                  :key="item.key"
                                  class="add-step-item add-step-item-full"
                                  @click="handleAddStepItem(item)"
                                >
                                  <span :class="['add-step-icon', item.iconBg]">
                                    <n-icon :component="item.icon" :size="16" />
                                  </span>
                                  <span class="add-step-label">{{ item.label }}</span>
                                </div>
                              </div>
                            </div>
                          </n-popover>
                        </div>
                        <div class="step-stat-grid">
                          <div class="step-stat-card">
                            <span class="step-stat-label">步骤总数</span>
                            <strong class="step-stat-value">{{ detailStepCount }}</strong>
                          </div>
                          <div class="step-stat-card ok">
                            <span class="step-stat-label">通过</span>
                            <strong class="step-stat-value">{{ stepPassCount }}</strong>
                          </div>
                          <div class="step-stat-card fail">
                            <span class="step-stat-label">失败</span>
                            <strong class="step-stat-value">{{ stepFailCount }}</strong>
                          </div>
                          <div class="step-stat-card pending">
                            <span class="step-stat-label">未执行</span>
                            <strong class="step-stat-value">{{ stepPendingCount }}</strong>
                          </div>
                        </div>
                        <div class="step-recent-fail">
                          <span class="step-recent-label">最近失败步骤</span>
                          <span class="step-recent-value">{{ latestFailedStepLabel }}</span>
                        </div>
                        <n-scrollbar class="step-list-scrollbar">
                          <div v-if="filteredStepCards.length === 0" class="step-list-zero">无匹配步骤，请调整筛选或搜索</div>
                          <div
                            v-for="item in filteredStepCards"
                            v-else
                            :key="'stp-' + item.idx + '-' + String(item.step.case_id ?? '') + '-' + String(item.step.order ?? '')"
                            :class="['step-list-item', { active: selectedStepIndex === item.idx, 'drag-over': dragStepOverIndex === item.idx, 'dragging': dragStepFromIndex === item.idx }]"
                            draggable="true"
                            @click="selectScenarioStep(item.idx)"
                            @dragstart.stop="handleStepDragStart(item.idx)"
                            @dragover.prevent.stop="handleStepDragOver($event, item.idx)"
                            @dragleave.stop="handleStepDragLeave($event)"
                            @drop.prevent.stop="handleStepDrop(item.idx)"
                            @dragend.stop="handleStepDragEnd()"
                          >
                            <span class="step-drag-handle" title="拖动调整顺序" @mousedown.stop>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="5" r="1.5" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="9" cy="19" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="19" r="1.5" fill="currentColor" stroke="none"/></svg>
                            </span>
                            <n-checkbox
                              :checked="stepBulkCheckedIndices.includes(item.idx)"
                              @click.stop
                              @update:checked="(v: boolean) => toggleStepBulkCheck(item.idx, v)"
                            />
                            <div class="step-li-order">#{{ item.idx + 1 }}</div>
                            <span class="step-li-method" :style="methodBadgeStyle(stepSidebarMethod(item.idx))">{{ stepSidebarMethod(item.idx) }}</span>
                            <div class="step-li-main">
                              <div class="step-li-topline">
                                <div class="step-li-name">{{ item.step.name || '未命名步骤' }}</div>
                                <span :class="['step-li-status', item.statusClass]">{{ item.statusText }}</span>
                              </div>
                              <div v-if="item.step.case_id" class="step-li-meta">{{ stepCaseMetaLabel(item.step) }}</div>
                              <div v-else-if="item.step.source === 'interface' && item.step.interface_id" class="step-li-meta step-li-meta--iface">接口 #{{ item.step.interface_id }}</div>
                              <div v-else-if="item.step.source === 'http' || item.step.source === 'curl'" class="step-li-meta step-li-meta--http">{{ item.step.source === 'curl' ? 'cURL 请求' : 'HTTP 请求' }}</div>
                              <div v-else-if="item.step.source === 'wait_step'" class="step-li-meta step-li-meta--http">等待</div>
                              <div v-else-if="item.step.source === 'script_step'" class="step-li-meta step-li-meta--http">脚本</div>
                              <div v-else-if="item.step.source === 'group_step'" class="step-li-meta step-li-meta--iface">步骤组</div>
                              <div v-else-if="item.step.source === 'db_step'" class="step-li-meta step-li-meta--http">数据库</div>
                              <div class="step-li-submeta">
                                <span>{{ item.lastCode }}</span>
                                <span>{{ item.lastElapsed }}</span>
                                <span>{{ item.lastRunAt }}</span>
                              </div>
                            </div>
                          </div>
                        </n-scrollbar>
                      </aside>
                      <div v-if="detailStepCount === 0" class="step-editor-panel">
                        <n-spin :show="stepEditorLoading">
                          <div class="step-editor-placeholder">
                            <p>当前场景还没有测试步骤</p>
                            <p class="step-ph-sub">可在左侧添加 HTTP 请求，或通过导入接口、用例与 cURL 快速开始编排</p>
                            <div class="step-workspace-empty-actions">
                              <n-button type="primary" @click="openImportApiModal">从接口导入</n-button>
                              <n-button quaternary @click="openImportCaseModal('formal')">从单接口用例导入</n-button>
                              <n-button quaternary @click="openImportCaseModal('debug')">从接口调试用例导入</n-button>
                            </div>
                          </div>
                        </n-spin>
                      </div>
                      <Teleport to="body">
                        <Transition name="step-detail-panel">
                          <div v-if="detailStepCount > 0 && stepDetailDrawerVisible" class="step-detail-fixed-drawer">
                            <div class="step-editor-panel is-drawer">
                              <n-spin :show="stepEditorLoading">
                                <div class="step-editor-shell">
                                  <div class="step-drawer-region step-drawer-region--top">
                                  <div class="step-detail-drawer-backbar">
                                    <button
                                      type="button"
                                      class="step-drawer-back-btn"
                                      aria-label="返回步骤列表"
                                      @click="closeStepDetailDrawer"
                                    >
                                      <n-icon :component="ArrowLeftOutlined" :size="18" />
                                      <span>返回</span>
                                    </button>
                                  </div>
                                  <div class="step-overview-card step-overview-card--top">
                                    <div class="step-overview-head">
                                      <div class="step-overview-title-group">
                                        <span class="step-overview-eyebrow">步骤概览</span>
                                        <div class="step-overview-title-line">
                                          <span class="step-overview-title">{{ currentStepTitle }}</span>
                                          <span class="step-overview-method" :style="methodBadgeStyle(stepEditorMethod)">{{ stepEditorMethod }}</span>
                                        </div>
                                      </div>
                                      <div class="step-overview-env">
                                        <span class="step-overview-env-label">运行环境</span>
                                        <div class="step-overview-env-actions">
                                          <n-select
                                            v-model:value="detailEnvId"
                                            :options="envOptions"
                                            size="small"
                                            placeholder="请选择环境"
                                            style="width: 180px"
                                            :consistent-menu-width="false"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div class="step-overview-meta">
                                      <span class="step-overview-chip">步骤 {{ (selectedStepIndex ?? 0) + 1 }} / {{ detailStepCount }}</span>
                                      <span class="step-overview-chip">{{ currentStepSourceLabel }}</span>
                                      <span class="step-overview-chip" v-if="stepEditorCaseId">用例 #{{ stepEditorCaseId }}</span>
                                      <span class="step-overview-chip" v-if="stepEditorInterfaceId">接口 #{{ stepEditorInterfaceId }}</span>
                                      <span class="step-overview-chip step-overview-chip--ok">后置 {{ stepEditorPostOps.length }}</span>
                                    </div>
                                  </div>
                                  </div>
                                  <div class="step-drawer-split" ref="stepDrawerSplitRef">
                                    <div
                                      class="step-drawer-region step-drawer-region--upper"
                                      :style="stepDrawerUpperFlexStyle"
                                    >
                                      <div class="step-drawer-region-heading">
                                        <span class="step-drawer-region-label">请求参数</span>
                                      </div>
                                    <div class="step-editor-main">
                              <div class="step-req-toolbar">
                                <span v-if="!isCurrentStepCustom" class="step-req-method-tag" :style="methodBadgeStyle(stepEditorMethod)">{{ stepEditorMethod }}</span>
                                <n-select
                                  v-else
                                  :value="stepEditorMethod"
                                  :options="[
                                    { label: 'GET', value: 'GET' },
                                    { label: 'POST', value: 'POST' },
                                    { label: 'PUT', value: 'PUT' },
                                    { label: 'PATCH', value: 'PATCH' },
                                    { label: 'DELETE', value: 'DELETE' },
                                  ]"
                                  size="small"
                                  style="width: 88px; flex-shrink: 0"
                                  :consistent-menu-width="false"
                                  @update:value="onCustomStepMethodChange"
                                />
                                <n-input v-model:value="stepEditorFullUrl" size="small" placeholder="https://api.example.com/path" class="step-req-url-input" />
                                <n-button
                                  v-if="isCurrentStepCustom"
                                  size="small"
                                  class="step-save-cfg-btn"
                                  :loading="httpStepSaving"
                                  @click="saveHttpStepConfig"
                                >保存</n-button>
                                <n-button-group>
                                  <n-button
                                    type="primary"
                                    class="step-purple-btn"
                                    size="small"
                                    :loading="stepEditorSending"
                                    @click="sendScenarioStepRequest"
                                  >发送</n-button>
                                  <n-dropdown trigger="click" placement="bottom-end" :options="stepSendActionOptions" @select="handleStepSendActionSelect">
                                    <n-button type="primary" class="step-purple-btn" size="small" style="padding: 0 8px">
                                      <template #icon><n-icon :component="DownOutlined" /></template>
                                    </n-button>
                                  </n-dropdown>
                                </n-button-group>
                              </div>

                              <div v-if="isUtilityStep" class="step-utility-panel step-utility-panel--scroll">
                                <div class="step-utility-head">
                                  <div class="step-utility-title">{{ currentStepSourceLabel }}</div>
                                  <n-button size="small" type="primary" :loading="httpStepSaving" @click="saveUtilityStepConfig">保存配置</n-button>
                                </div>
                                <div v-if="selectedUtilityStepType === 'wait_step'" class="step-utility-grid two-cols">
                                  <n-input v-model:value="stepUtilityConfig.duration" size="small" placeholder="持续时长(ms)" />
                                  <n-input v-model:value="stepUtilityConfig.note" size="small" placeholder="备注" />
                                </div>
                                <div v-else-if="selectedUtilityStepType === 'script_step'" class="step-utility-stack">
                                  <div class="step-inline-op-actions">
                                    <n-button size="tiny" quaternary @click="stepUtilityConfig.script = &quot;context.setVar('token', 'demo-token')&quot;">示例：设置变量</n-button>
                                    <n-button size="tiny" quaternary @click="stepUtilityConfig.script = &quot;context.log('before request')&quot;">示例：打印日志</n-button>
                                  </div>
                                  <n-input
                                    v-model:value="stepUtilityConfig.script"
                                    type="textarea"
                                    size="small"
                                    :autosize="{ minRows: 10, maxRows: 16 }"
                                    placeholder="context.setVar('token', 'demo-token')"
                                  />
                                </div>
                                <div v-else-if="selectedUtilityStepType === 'group_step'" class="step-utility-stack">
                                  <n-input v-model:value="stepUtilityConfig.group_name" size="small" placeholder="分组名称" />
                                  <n-input v-model:value="stepUtilityConfig.note" type="textarea" size="small" :autosize="{ minRows: 4, maxRows: 8 }" placeholder="备注说明" />
                                </div>
                                <div v-else-if="selectedUtilityStepType === 'db_step'" class="step-utility-stack">
                                  <div class="step-utility-grid two-cols">
                                    <n-input v-model:value="stepUtilityConfig.datasource" size="small" placeholder="数据源，例如 default/mysql-main" />
                                    <n-select
                                      v-model:value="stepUtilityConfig.action"
                                      size="small"
                                      :options="[{ label: '查询', value: 'query' }, { label: '执行', value: 'execute' }]"
                                      :consistent-menu-width="false"
                                    />
                                  </div>
                                  <n-input
                                    v-model:value="stepUtilityConfig.sql"
                                    type="textarea"
                                    size="small"
                                    :autosize="{ minRows: 6, maxRows: 12 }"
                                    placeholder="SELECT * FROM user WHERE id = 1"
                                  />
                                </div>
                              </div>
                              <n-tabs v-else v-model:value="stepEditorTab" type="line" class="step-config-tabs" size="small">
                                <n-tab-pane name="params" :tab="stepParamsTabLabel">
                                  <div class="step-tab-pane-inner">
                                    <n-empty v-if="stepEditorQueryParams.length === 0" description="暂无 Query 参数" size="small" />
                                    <n-table v-else :single-line="false" size="small" class="step-mini-table">
                                      <thead>
                                        <tr>
                                          <th>参数名</th>
                                          <th>示例值</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr v-for="(row, ri) in stepEditorQueryParams" :key="'q-' + ri">
                                          <td><n-input v-model:value="row.name" size="small" placeholder="name" /></td>
                                          <td><n-input v-model:value="row.example" size="small" placeholder="value" /></td>
                                        </tr>
                                      </tbody>
                                    </n-table>
                                  </div>
                                </n-tab-pane>
                              <n-tab-pane name="body" :tab="stepBodyTabLabel">
                                <div class="step-tab-pane-inner">
                                  <n-radio-group v-model:value="stepEditorBodyType" size="small" class="step-body-type-group">
                                    <n-radio v-for="opt in stepBodyTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</n-radio>
                                  </n-radio-group>
                                  <div class="step-body-editor-bar">
                                    <n-button size="tiny" quaternary @click="insertStepDynamicValue">动态值</n-button>
                                    <n-button size="tiny" quaternary @click="formatStepEditorJson">格式化</n-button>
                                  </div>
                                  <n-input
                                    v-model:value="stepEditorBodyContent"
                                    type="textarea"
                                    :rows="12"
                                    placeholder="请求 Body（JSON 等）"
                                    class="step-body-textarea"
                                    :disabled="stepEditorBodyType === 'none'"
                                  />
                                </div>
                              </n-tab-pane>
                              <n-tab-pane name="headers" :tab="stepHeadersTabLabel">
                                <div class="step-tab-pane-inner">
                                  <n-empty v-if="stepEditorHeaderParams.length === 0" description="暂无 Header" size="small" />
                                  <n-table v-else :single-line="false" size="small" class="step-mini-table">
                                    <thead>
                                      <tr>
                                        <th>名称</th>
                                        <th>值</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr v-for="(row, hi) in stepEditorHeaderParams" :key="'h-' + hi">
                                        <td><n-input v-model:value="row.name" size="small" /></td>
                                        <td><n-input v-model:value="row.example" size="small" /></td>
                                      </tr>
                                    </tbody>
                                  </n-table>
                                </div>
                              </n-tab-pane>
                              <n-tab-pane name="cookies" tab="Cookies">
                                <div class="step-tab-pane-inner"><n-empty description="暂无 Cookies" size="small" /></div>
                              </n-tab-pane>
                              <n-tab-pane name="auth" tab="Auth">
                                <div class="step-tab-pane-inner">
                                  <div class="step-auth-pane">
                                    <div class="step-auth-head">
                                      <div class="step-auth-title">认证配置</div>
                                      <div class="step-auth-desc">选择一种认证方式后，请求发送时会自动注入，不需要手工重复写 Header。</div>
                                    </div>
                                    <div class="step-auth-grid">
                                      <button type="button" :class="['step-auth-card', { active: stepAuthMode === 'none' }]" @click="stepAuthMode = 'none'">
                                        <strong>无需认证</strong>
                                        <span>适合公开接口或本地联调</span>
                                      </button>
                                      <button type="button" :class="['step-auth-card', { active: stepAuthMode === 'bearer' }]" @click="stepAuthMode = 'bearer'">
                                        <strong>Bearer Token</strong>
                                        <span>自动注入 Authorization 头</span>
                                      </button>
                                      <button type="button" :class="['step-auth-card', { active: stepAuthMode === 'basic' }]" @click="stepAuthMode = 'basic'">
                                        <strong>Basic Auth</strong>
                                        <span>使用用户名和密码拼接认证头</span>
                                      </button>
                                      <button type="button" :class="['step-auth-card', { active: stepAuthMode === 'apikey' }]" @click="stepAuthMode = 'apikey'">
                                        <strong>API Key</strong>
                                        <span>支持放在 Header 或 Query 中</span>
                                      </button>
                                    </div>
                                    <div class="step-auth-note">
                                      {{ stepAuthNote }}
                                    </div>
                                    <div class="step-auth-form">
                                      <template v-if="stepAuthMode === 'bearer'">
                                        <n-input v-model:value="stepAuthBearer.prefix" size="small" placeholder="Bearer" />
                                        <n-input v-model:value="stepAuthBearer.token" size="small" placeholder="Token / 变量占位符" />
                                      </template>
                                      <template v-else-if="stepAuthMode === 'basic'">
                                        <n-input v-model:value="stepAuthBasic.username" size="small" placeholder="用户名" />
                                        <n-input v-model:value="stepAuthBasic.password" size="small" type="password" show-password-on="click" placeholder="密码" />
                                      </template>
                                      <template v-else-if="stepAuthMode === 'apikey'">
                                        <n-select
                                          v-model:value="stepAuthApiKey.position"
                                          size="small"
                                          :options="stepAuthApiKeyPositionOptions"
                                          :consistent-menu-width="false"
                                        />
                                        <n-input v-model:value="stepAuthApiKey.key" size="small" placeholder="参数名，例如 X-API-Key" />
                                        <n-input v-model:value="stepAuthApiKey.value" size="small" placeholder="参数值 / 变量占位符" />
                                      </template>
                                    </div>
                                  </div>
                                </div>
                              </n-tab-pane>
                              <n-tab-pane name="pre" tab="前置操作">
                                <div class="step-tab-pane-inner step-pre-pane">
                                  <div class="step-panel-section-head">
                                    <div>
                                      <div class="step-panel-section-title">请求前置编排</div>
                                      <div class="step-panel-section-desc">与单接口调试保持一致，支持数据库操作、脚本、公共脚本和等待时间。</div>
                                    </div>
                                    <span class="step-panel-section-count">{{ stepEditorPreOps.length }} 项</span>
                                  </div>
                                  <div class="step-pre-quick-add">
                                    <n-button v-for="item in stepUnifiedPreOpCreateOptions" :key="item.value" size="tiny" quaternary @click="addStepPreOpUnified(item.value)">{{ item.label }}</n-button>
                                  </div>
                                  <n-empty v-if="stepEditorPreOps.length === 0" description="暂无前置操作" size="small" />
                                  <div v-else class="step-inline-op-list">
                                    <div v-for="(op, pi) in stepEditorPreOps" :key="op.id || `pre-${pi}`" class="step-inline-op-card">
                                      <div class="step-inline-op-head">
                                        <div class="step-inline-op-title-group">
                                          <span class="step-inline-op-index">前置 {{ pi + 1 }}</span>
                                          <strong>{{ stepUnifiedPreOpTypeLabels[op.type] || '前置操作' }}</strong>
                                        </div>
                                        <n-button text type="error" size="tiny" @click="removeStepPreOpUnified(pi)">删除</n-button>
                                      </div>
                                      <div class="step-inline-op-grid two-cols">
                                        <n-input v-model:value="op.name" size="small" placeholder="操作名称" @blur="persistStepPreOperationsUnified" />
                                        <n-radio-group :value="op.enabled === false ? 'off' : 'on'" size="small" @update:value="(v: string) => { op.enabled = v === 'on'; persistStepPreOperationsUnified() }">
                                          <n-radio-button value="on">启用</n-radio-button>
                                          <n-radio-button value="off">停用</n-radio-button>
                                        </n-radio-group>
                                      </div>
                                      <div v-if="op.type === 'db'" class="step-inline-op-stack">
                                        <div class="step-inline-op-grid two-cols">
                                          <n-input v-model:value="op.config.datasource" size="small" placeholder="数据源，例如 default/mysql-main" @blur="persistStepPreOperationsUnified" />
                                          <n-select v-model:value="op.config.action" size="small" :options="stepUnifiedDbActionOptions" @update:value="persistStepPreOperationsUnified" />
                                        </div>
                                        <n-input v-model:value="op.config.sql" type="textarea" size="small" :autosize="{ minRows: 4, maxRows: 8 }" placeholder="SELECT * FROM user WHERE id = {{userId}}" @blur="persistStepPreOperationsUnified" />
                                        <div class="step-inline-op-grid two-cols">
                                          <n-input v-model:value="op.config.result_var" size="small" placeholder="结果变量，可选" @blur="persistStepPreOperationsUnified" />
                                          <n-input v-model:value="op.config.timeout_ms" size="small" placeholder="超时(ms)" @blur="persistStepPreOperationsUnified" />
                                        </div>
                                      </div>
                                      <div v-else-if="op.type === 'script'" class="step-inline-op-stack">
                                        <div class="step-inline-op-grid two-cols">
                                          <n-select v-model:value="op.config.language" size="small" :options="stepUnifiedScriptLanguageOptions" @update:value="persistStepPreOperationsUnified" />
                                          <div class="step-inline-op-hint">当前步骤详情执行链路以 JavaScript 为主，和调试接口保持一致。</div>
                                        </div>
                                        <div class="step-inline-op-actions">
                                          <n-button size="tiny" quaternary @click="applyStepPreScriptPreset(op, 'token')">插入 Token 脚本</n-button>
                                          <n-button size="tiny" quaternary @click="applyStepPreScriptPreset(op, 'trace')">插入 TraceId</n-button>
                                        </div>
                                        <n-input v-model:value="op.config.script" type="textarea" size="small" :autosize="{ minRows: 6, maxRows: 12 }" placeholder="context.setHeader('Authorization', 'Bearer {{token}}')" @blur="persistStepPreOperationsUnified" />
                                      </div>
                                      <div v-else-if="op.type === 'public_script'" class="step-inline-op-stack">
                                        <div class="step-inline-op-grid two-cols">
                                          <n-select v-model:value="op.config.script_key" size="small" :options="stepUnifiedPublicScriptOptions" @update:value="persistStepPreOperationsUnified" />
                                          <div class="step-inline-op-hint">{{ stepUnifiedPublicScriptRegistry[op.config.script_key]?.description || '选择公共脚本模板后，这里会显示说明。' }}</div>
                                        </div>
                                        <n-input v-model:value="op.config.params" type="textarea" size="small" :autosize="{ minRows: 4, maxRows: 8 }" placeholder='{"varName":"timestamp","mode":"ms"}' @blur="persistStepPreOperationsUnified" />
                                      </div>
                                      <div v-else class="step-inline-op-stack">
                                        <div class="step-inline-op-grid two-cols">
                                          <n-input v-model:value="op.config.duration" size="small" placeholder="等待时长" @blur="persistStepPreOperationsUnified" />
                                          <n-select v-model:value="op.config.unit" size="small" :options="stepUnifiedWaitUnitOptions" @update:value="persistStepPreOperationsUnified" />
                                        </div>
                                        <n-input v-model:value="op.config.note" size="small" placeholder="备注" @blur="persistStepPreOperationsUnified" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </n-tab-pane>
                              <n-tab-pane name="post" :tab="stepPostTabLabel">
                                <div class="step-tab-pane-inner step-post-pane">
                                  <template v-if="stepEditorCaseId || isCurrentStepCustom || selectedStep?.source === 'interface'">
                                    <div class="step-panel-section-head">
                                      <div>
                                        <div class="step-panel-section-title">响应后置编排</div>
                                        <div class="step-panel-section-desc">与单接口调试保持一致，支持校验响应、断言、变量提取、数据库操作、脚本、公共脚本和等待时间。</div>
                                      </div>
                                      <div class="step-panel-section-tags">
                                        <span class="step-panel-mini-tag">总计 {{ stepVisiblePostOps.length }}</span>
                                        <span class="step-panel-mini-tag">断言 {{ stepEditorAssertionOps.length }}</span>
                                        <span class="step-panel-mini-tag">提取 {{ stepEditorExtractOps.length }}</span>
                                      </div>
                                    </div>
                                    <div class="step-validate-response-bar">
                                      <div class="step-vr-left">
                                        <span class="step-vr-title">校验响应（契约测试）</span>
                                        <n-tooltip trigger="hover"><template #trigger><span class="step-vr-help-wrap"><n-icon :component="QuestionCircleOutlined" class="step-vr-help" /></span></template>开启后会校验期望状态码，必要时继续检查响应体中的业务成功标记。</n-tooltip>
                                      </div>
                                      <div class="step-vr-right">
                                        <n-select :value="stepValidateEnabledUi" :options="validateEnableSelectOptions" size="small" class="step-vr-select-enable" :consistent-menu-width="false" @update:value="onStepValidateEnabledChange" />
                                        <n-select :value="stepValidateExpectStatusUi" :options="validateStatusCodeOptions" size="small" class="step-vr-select-status" :disabled="stepValidateEnabledUi !== 'on'" :consistent-menu-width="false" @update:value="onStepValidateExpectStatusChange" />
                                      </div>
                                    </div>
                                    <div class="step-post-add-row">
                                      <n-button v-for="item in stepUnifiedPostOpCreateOptions" :key="item.value" size="tiny" quaternary @click="addStepPostOpUnified(item.value)">{{ item.label }}</n-button>
                                    </div>
                                    <n-empty v-if="stepVisiblePostOps.length === 0" description="暂无后置操作" size="small" />
                                    <div v-else class="step-inline-op-list">
                                      <div v-for="(op, pi) in stepVisiblePostOps" :key="op.id || `post-${pi}`" class="step-inline-op-card">
                                        <div class="step-inline-op-head">
                                          <div class="step-inline-op-title-group">
                                            <span class="step-inline-op-index">后置 {{ pi + 1 }}</span>
                                            <strong>{{ stepUnifiedPostOpTypeLabels[op.type] || '后置操作' }}</strong>
                                          </div>
                                          <n-button text type="error" size="tiny" @click="removeStepPostOpUnified(pi)">删除</n-button>
                                        </div>
                                        <div class="step-inline-op-grid two-cols">
                                          <n-input v-model:value="op.name" size="small" placeholder="操作名称" @blur="persistStepPostOperationsUnified" />
                                          <n-radio-group :value="op.enabled === false ? 'off' : 'on'" size="small" @update:value="(v: string) => { op.enabled = v === 'on'; persistStepPostOperationsUnified() }"><n-radio-button value="on">启用</n-radio-button><n-radio-button value="off">停用</n-radio-button></n-radio-group>
                                        </div>
                                        <div v-if="op.type === 'assertion'" class="step-inline-op-stack">
                                          <div class="step-inline-op-grid two-cols"><n-select v-model:value="op.config.target" size="small" :options="stepUnifiedAssertionTargetOptions" @update:value="persistStepPostOperationsUnified" /><n-select v-model:value="op.config.operator" size="small" :options="stepUnifiedAssertionOperatorOptions" @update:value="persistStepPostOperationsUnified" /></div>
                                          <div class="step-inline-op-grid two-cols"><n-input v-model:value="op.config.expression" size="small" placeholder="表达式，如 $.data.code / content-type" @blur="persistStepPostOperationsUnified" /><n-input v-model:value="op.config.value" size="small" placeholder="期望值 / 正则" @blur="persistStepPostOperationsUnified" /></div>
                                        </div>
                                        <div v-else-if="op.type === 'extract'" class="step-inline-op-stack">
                                          <div class="step-inline-op-grid two-cols"><n-input v-model:value="op.config.name" size="small" placeholder="变量名" @blur="persistStepPostOperationsUnified" /><n-select v-model:value="op.config.source" size="small" :options="stepUnifiedExtractSourceOptions" @update:value="persistStepPostOperationsUnified" /></div>
                                          <div class="step-inline-op-grid two-cols"><n-input v-model:value="op.config.expression" size="small" placeholder="表达式，如 $.data.token / content-type" @blur="persistStepPostOperationsUnified" /><n-select v-model:value="op.config.target" size="small" :options="[{ label: '环境变量', value: 'environment' }, { label: '临时变量', value: 'temporary' }]" @update:value="persistStepPostOperationsUnified" /></div>
                                        </div>
                                        <div v-else-if="op.type === 'db'" class="step-inline-op-stack">
                                          <div class="step-inline-op-grid two-cols"><n-input v-model:value="op.config.datasource" size="small" placeholder="数据源，例如 default/mysql-main" @blur="persistStepPostOperationsUnified" /><n-select v-model:value="op.config.action" size="small" :options="stepUnifiedDbActionOptions" @update:value="persistStepPostOperationsUnified" /></div>
                                          <n-input v-model:value="op.config.sql" type="textarea" size="small" :autosize="{ minRows: 4, maxRows: 8 }" placeholder="SELECT status FROM orders WHERE order_no = {{orderNo}}" @blur="persistStepPostOperationsUnified" />
                                          <div class="step-inline-op-grid two-cols"><n-input v-model:value="op.config.result_var" size="small" placeholder="结果变量，可选" @blur="persistStepPostOperationsUnified" /><n-input v-model:value="op.config.timeout_ms" size="small" placeholder="超时(ms)" @blur="persistStepPostOperationsUnified" /></div>
                                        </div>
                                        <div v-else-if="op.type === 'script'" class="step-inline-op-stack">
                                          <div class="step-inline-op-grid two-cols"><n-select v-model:value="op.config.language" size="small" :options="stepUnifiedScriptLanguageOptions" @update:value="persistStepPostOperationsUnified" /><div class="step-inline-op-hint">脚本会收到 response、responseData、statusCode 以及 context API。</div></div>
                                          <n-input v-model:value="op.config.script" type="textarea" size="small" :autosize="{ minRows: 6, maxRows: 12 }" placeholder="if (statusCode !== 200) { throw new Error('response failed') }" @blur="persistStepPostOperationsUnified" />
                                        </div>
                                        <div v-else-if="op.type === 'public_script'" class="step-inline-op-stack">
                                          <div class="step-inline-op-grid two-cols"><n-select v-model:value="op.config.script_key" size="small" :options="stepUnifiedPublicScriptOptions" @update:value="persistStepPostOperationsUnified" /><div class="step-inline-op-hint">{{ stepUnifiedPublicScriptRegistry[op.config.script_key]?.description || '选择公共脚本模板后，这里会显示说明。' }}</div></div>
                                          <n-input v-model:value="op.config.params" type="textarea" size="small" :autosize="{ minRows: 4, maxRows: 8 }" placeholder='{"varName":"postExecutedAt","mode":"ms"}' @blur="persistStepPostOperationsUnified" />
                                        </div>
                                        <div v-else class="step-inline-op-stack">
                                          <div class="step-inline-op-grid two-cols"><n-input v-model:value="op.config.duration" size="small" placeholder="等待时长" @blur="persistStepPostOperationsUnified" /><n-select v-model:value="op.config.unit" size="small" :options="stepUnifiedWaitUnitOptions" @update:value="persistStepPostOperationsUnified" /></div>
                                          <n-input v-model:value="op.config.note" size="small" placeholder="备注" @blur="persistStepPostOperationsUnified" />
                                        </div>
                                      </div>
                                    </div>
                                  </template>
                                  <template v-else><n-empty description="导入接口用例后可配置后置操作" size="small" /></template>
                                </div>
                              </n-tab-pane>
                              <n-tab-pane name="settings" tab="设置">
                                <div class="step-tab-pane-inner step-settings-pane">
                                  <div class="settings-section">
                                    <div class="settings-section-title">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7d33ff" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                                      基本请求设置
                                    </div>
                                    <div class="settings-row">
                                      <div class="settings-item">
                                        <div class="settings-label">
                                          请求超时（ms）
                                          <span class="settings-hint">0 表示不限制</span>
                                        </div>
                                        <n-input-number
                                          v-model:value="stepReqSettings.timeout"
                                          :min="0"
                                          :max="300000"
                                          :step="1000"
                                          placeholder="30000"
                                          style="width: 160px"
                                        />
                                      </div>
                                      <div class="settings-item">
                                        <div class="settings-label">
                                          最大重定向次数
                                          <span class="settings-hint">0 表示不跟随</span>
                                        </div>
                                        <n-input-number
                                          v-model:value="stepReqSettings.maxRedirects"
                                          :min="0"
                                          :max="20"
                                          placeholder="5"
                                          style="width: 120px"
                                        />
                                      </div>
                                    </div>
                                    <div class="settings-row">
                                      <div class="settings-item settings-item--switch">
                                        <div class="settings-switch-info">
                                          <div class="settings-label">自动跟随重定向</div>
                                          <div class="settings-desc">接收到 3xx 响应时自动跟随 Location 跳转</div>
                                        </div>
                                        <n-switch v-model:value="stepReqSettings.followRedirects" size="medium" />
                                      </div>
                                      <div class="settings-item settings-item--switch">
                                        <div class="settings-switch-info">
                                          <div class="settings-label">验证 SSL 证书</div>
                                          <div class="settings-desc">关闭后忽略自签名或过期证书错误</div>
                                        </div>
                                        <n-switch v-model:value="stepReqSettings.sslVerify" size="medium" />
                                      </div>
                                    </div>
                                    <div class="settings-row">
                                      <div class="settings-item settings-item--switch">
                                        <div class="settings-switch-info">
                                          <div class="settings-label">保持 Cookie</div>
                                          <div class="settings-desc">自动存储并携带响应中的 Set-Cookie</div>
                                        </div>
                                        <n-switch v-model:value="stepReqSettings.keepCookies" size="medium" />
                                      </div>
                                      <div class="settings-item settings-item--switch">
                                        <div class="settings-switch-info">
                                          <div class="settings-label">自动设置 Content-Type</div>
                                          <div class="settings-desc">根据 Body 类型自动设置 Content-Type Header</div>
                                        </div>
                                        <n-switch v-model:value="stepReqSettings.autoContentType" size="medium" />
                                      </div>
                                    </div>
                                  </div>
                                  <div class="settings-section">
                                    <div class="settings-section-title">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7d33ff" stroke-width="2" stroke-linecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                                      代理设置
                                    </div>
                                    <div class="settings-row">
                                      <div class="settings-item settings-item--switch">
                                        <div class="settings-switch-info">
                                          <div class="settings-label">使用代理</div>
                                          <div class="settings-desc">通过指定代理服务器转发请求</div>
                                        </div>
                                        <n-switch v-model:value="stepReqSettings.useProxy" size="medium" />
                                      </div>
                                    </div>
                                    <div v-if="stepReqSettings.useProxy" class="settings-row settings-proxy-fields">
                                      <div class="settings-item settings-item--wide">
                                        <div class="settings-label">代理地址</div>
                                        <n-input v-model:value="stepReqSettings.proxyUrl" placeholder="http://proxy.example.com:8080" />
                                      </div>
                                      <div class="settings-item">
                                        <div class="settings-label">代理用户名（可选）</div>
                                        <n-input v-model:value="stepReqSettings.proxyUser" placeholder="用户名" />
                                      </div>
                                      <div class="settings-item">
                                        <div class="settings-label">代理密码（可选）</div>
                                        <n-input v-model:value="stepReqSettings.proxyPass" type="password" placeholder="密码" show-password-on="click" />
                                      </div>
                                    </div>
                                  </div>
                                  <div class="settings-section">
                                    <div class="settings-section-title">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7d33ff" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                                      响应处理
                                    </div>
                                    <div class="settings-row">
                                      <div class="settings-item">
                                        <div class="settings-label">响应体编码</div>
                                        <n-select
                                          v-model:value="stepReqSettings.responseEncoding"
                                          :options="stepEncodingOptions"
                                          style="width: 180px"
                                          :consistent-menu-width="false"
                                        />
                                      </div>
                                      <div class="settings-item">
                                        <div class="settings-label">
                                          最大响应体大小（KB）
                                          <span class="settings-hint">0 不限制</span>
                                        </div>
                                        <n-input-number
                                          v-model:value="stepReqSettings.maxResponseSize"
                                          :min="0"
                                          :max="102400"
                                          :step="512"
                                          placeholder="10240"
                                          style="width: 160px"
                                        />
                                      </div>
                                    </div>
                                    <div class="settings-row">
                                      <div class="settings-item settings-item--switch">
                                        <div class="settings-switch-info">
                                          <div class="settings-label">自动解析 JSON 响应</div>
                                          <div class="settings-desc">响应体为 JSON 时自动格式化显示</div>
                                        </div>
                                        <n-switch v-model:value="stepReqSettings.autoParseJson" size="medium" />
                                      </div>
                                      <div class="settings-item settings-item--switch">
                                        <div class="settings-switch-info">
                                          <div class="settings-label">显示响应耗时</div>
                                          <div class="settings-desc">在响应头部显示请求耗时和响应大小</div>
                                        </div>
                                        <n-switch v-model:value="stepReqSettings.showTiming" size="medium" />
                                      </div>
                                    </div>
                                  </div>
                                  <div class="settings-footer">
                                    <n-button size="small" quaternary @click="resetStepReqSettings">恢复默认设置</n-button>
                                    <n-button size="small" type="primary" class="step-purple-btn" @click="saveStepReqSettings">保存设置</n-button>
                                  </div>
                                </div>
                              </n-tab-pane>
                              </n-tabs>
                                    </div>
                                    </div>
                                    <div
                                      class="step-drawer-resize-handle"
                                      role="separator"
                                      aria-orientation="horizontal"
                                      aria-label="拖动调整请求区与响应区高度"
                                      @mousedown="onStepDrawerResizeStart"
                                    >
                                      <span class="step-drawer-resize-grip" />
                                    </div>
                                    <div
                                      class="step-drawer-region step-drawer-region--lower"
                                      :style="stepDrawerLowerFlexStyle"
                                    >
                                    <div class="step-editor-bottom">
                            <div class="step-response-side">
                              <div class="step-response-panel always-visible">
                                <div class="step-response-head">
                                  <span class="step-response-title">响应结果</span>
                                  <template v-if="stepEditorLastResponse?.error">
                                    <n-tag type="error" size="small">失败</n-tag>
                                    <span class="step-response-err">{{ stepEditorLastResponse.error }}</span>
                                  </template>
                                  <template v-else-if="stepEditorLastResponse">
                                    <n-tag
                                      size="small"
                                      :type="(stepEditorLastResponse.status_code ?? 0) < 400 ? 'success' : 'error'"
                                    >
                                      HTTP {{ stepEditorLastResponse.status_code }}
                                    </n-tag>
                                    <span
                                      v-if="stepReqSettings.showTiming && stepEditorLastResponse.elapsed != null"
                                      class="step-response-meta"
                                    >{{ Math.round(Number(stepEditorLastResponse.elapsed)) }} ms</span>
                                  </template>
                                  <n-button quaternary size="tiny" @click="copyStepResponseBody" :disabled="!stepEditorLastResponse">复制当前内容</n-button>
                                </div>
                                <div class="step-response-toolbar">
                                  <div class="step-response-view-switch">
                                    <button type="button" :class="['step-view-btn', { active: stepResponseViewMode === 'pretty' }]" @click="stepResponseViewMode = 'pretty'">Pretty</button>
                                    <button type="button" :class="['step-view-btn', { active: stepResponseViewMode === 'raw' }]" @click="stepResponseViewMode = 'raw'">Raw</button>
                                  </div>
                                  <div class="step-response-tabs-mini">
                                    <button type="button" :class="['step-mini-tab', { active: stepResponsePanelTab === 'body' }]" @click="stepResponsePanelTab = 'body'">响应体</button>
                                    <button type="button" :class="['step-mini-tab', { active: stepResponsePanelTab === 'headers' }]" @click="stepResponsePanelTab = 'headers'">响应头</button>
                                    <button type="button" :class="['step-mini-tab', { active: stepResponsePanelTab === 'assert' }]" @click="stepResponsePanelTab = 'assert'">断言 {{ stepResponseAssertionCount }}</button>
                                    <button type="button" :class="['step-mini-tab', { active: stepResponsePanelTab === 'extract' }]" @click="stepResponsePanelTab = 'extract'">提取 {{ stepResponseExtractCount }}</button>
                                  </div>
                                </div>
                                <div class="step-response-body-shell">
                                  <template v-if="!stepEditorLastResponse">
                                    <div class="step-response-empty step-response-empty--idle">
                                      <span class="step-response-empty-badge">Response</span>
                                      <div class="step-response-empty-title">当前步骤尚未执行</div>
                                      <div class="step-response-empty-desc">
                                        发送当前步骤后，这里会展示状态码、耗时、响应体、断言结果以及变量提取结果。
                                      </div>
                                      <div class="step-response-empty-metrics">
                                        <div class="step-response-empty-metric">
                                          <span>请求方法</span>
                                          <strong>{{ stepEditorMethod || '--' }}</strong>
                                        </div>
                                        <div class="step-response-empty-metric">
                                          <span>后置动作</span>
                                          <strong>{{ stepEditorPostOps.length }}</strong>
                                        </div>
                                      </div>
                                      <div class="step-response-empty-tip">
                                        左侧继续完善参数、鉴权和前后置配置，右侧会实时承接本步骤的执行结果。
                                      </div>
                                    </div>
                                  </template>
                                  <template v-else-if="stepResponsePanelTab === 'body'">
                                    <pre class="step-response-pre">{{ stepResponseViewMode === 'pretty' ? stepResponseBodyPrettyText : stepResponseBodyRawText }}</pre>
                                  </template>
                                  <template v-else-if="stepResponsePanelTab === 'headers'">
                                    <div v-if="stepResponseHeaderEntries.length === 0" class="step-response-empty step-response-empty--compact">
                                      <span class="step-response-empty-badge">Headers</span>
                                      <div class="step-response-empty-title">暂无响应头信息</div>
                                      <div class="step-response-empty-desc">本次返回中没有可展示的 Header 字段。</div>
                                    </div>
                                    <div v-else class="step-response-kv-list">
                                      <div v-for="([k, v], idx) in stepResponseHeaderEntries" :key="`${k}-${idx}`" class="step-response-kv-row">
                                        <span class="step-response-k">{{ k }}</span>
                                        <span class="step-response-v">{{ v }}</span>
                                      </div>
                                    </div>
                                  </template>
                                  <template v-else-if="stepResponsePanelTab === 'assert'">
                                    <div class="step-assert-card">
                                      <div class="step-assert-line">
                                        <span class="step-assert-label">校验响应</span>
                                        <span :class="['step-assert-pill', stepResponseAssertionPass ? 'is-pass' : 'is-fail']">{{ stepResponseAssertionText }}</span>
                                      </div>
                                      <div class="step-assert-help">后置操作中的校验响应会影响此处判定结果。</div>
                                      <div v-if="stepResponseAssertionResults.length > 0" class="step-assert-list">
                                        <div v-for="(item, idx) in stepResponseAssertionResults" :key="`${item.name}-${idx}`" class="step-assert-list-item">
                                          <span class="step-assert-item-name">{{ item.name }}</span>
                                          <span :class="['step-assert-pill', item.passed ? 'is-pass' : 'is-fail']">{{ item.passed ? '通过' : '失败' }}</span>
                                          <span class="step-assert-item-msg">{{ item.message }}</span>
                                        </div>
                                      </div>
                                      <div v-else class="step-assert-empty">
                                        <span class="step-response-empty-badge">Assert</span>
                                        <div class="step-response-empty-title">暂无断言明细</div>
                                        <div class="step-response-empty-desc">当前步骤尚未生成断言结果，执行后会在这里展示每一条校验结论。</div>
                                      </div>
                                    </div>
                                  </template>
                                  <template v-else>
                                    <div v-if="stepResponseExtractItems.length === 0" class="step-response-empty step-response-empty--compact">
                                      <span class="step-response-empty-badge">Extract</span>
                                      <div class="step-response-empty-title">暂无可提取字段</div>
                                      <div class="step-response-empty-desc">执行后若命中提取规则，这里会列出可复用的变量和值。</div>
                                    </div>
                                    <div v-else class="step-response-kv-list">
                                      <div v-for="item in stepResponseExtractItems" :key="item.key" class="step-response-kv-row">
                                        <span class="step-response-k">{{ item.key }}</span>
                                        <span class="step-response-v">{{ item.value }}</span>
                                      </div>
                                    </div>
                                  </template>
                                </div>
                              </div>
                            </div>
                                    </div>
                                    </div>
                                  </div>
                          </div>
                              </n-spin>
                            </div>
                          </div>
                        </Transition>
                      </Teleport>
                    </div>
                  </template>
                  <template v-else-if="detailMainTab === 'report'">
                    <div class="detail-report-root">
                      <div class="detail-report-summary-card">
                        <div class="drr-chart-wrap">
                          <div v-if="reportSummary.total === 0" class="drr-chart-empty">
                            <span class="drr-empty-ring" />
                            <div class="drr-empty-text">
                              <span>已完成</span>
                              <strong>0</strong>
                            </div>
                          </div>
                          <div v-show="reportSummary.total > 0" ref="reportDonutRef" class="drr-chart" />
                        </div>
                        <div class="drr-status-col">
                          <div class="drr-status-line">
                            <span class="drr-dot pass" />
                            <span class="drr-status-label">通过</span>
                            <span class="drr-status-val">{{ reportSummary.pass }}</span>
                            <span class="drr-status-pct">({{ reportPassPct }}%)</span>
                          </div>
                          <div class="drr-status-line">
                            <span class="drr-dot fail" />
                            <span class="drr-status-label">失败</span>
                            <span class="drr-status-val drr-em-fail">{{ reportSummary.fail }}</span>
                            <span class="drr-status-pct">({{ reportFailPct }}%)</span>
                          </div>
                          <div class="drr-status-line">
                            <span class="drr-dot idle" />
                            <span class="drr-status-label">未测</span>
                            <span class="drr-status-val">{{ reportSummary.untested }}</span>
                            <span class="drr-status-pct">({{ reportUntestedPct }}%)</span>
                          </div>
                        </div>
                        <div class="drr-vdivider" />
                        <div class="drr-metrics-wrap">
                          <div class="drr-metric-col">
                            <div class="drr-metric-row">
                              <span class="drr-metric-label">总耗时</span>
                              <span class="drr-metric-val green">{{ formatReportMs(reportTotalDurationMs) }}</span>
                            </div>
                            <div class="drr-metric-row">
                              <span class="drr-metric-label">接口请求耗时</span>
                              <span class="drr-metric-val green">{{ formatReportMs(reportSummary.sumMs) }}</span>
                            </div>
                            <div class="drr-metric-row">
                              <span class="drr-metric-label">平均接口请求耗时</span>
                              <span class="drr-metric-val green">{{ formatReportMs(reportSummary.avgMs) }}</span>
                            </div>
                          </div>
                          <div class="drr-metric-col drr-metric-col-right">
                            <div class="drr-metric-row drr-metric-block">
                              <span class="drr-metric-label">循环数</span>
                              <div class="drr-metric-sub">
                                执行：<b>{{ reportSummary.total }}</b>
                                ，失败：<b class="drr-loop-fail">{{ reportSummary.fail }}</b>
                              </div>
                            </div>
                            <div class="drr-metric-row drr-metric-block">
                              <span class="drr-metric-label">断言数</span>
                              <div class="drr-metric-sub">
                                执行：<b>0</b>
                                ，失败：<b>0</b>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="detail-report-toolbar">
                        <div class="detail-report-tabs">
                          <button
                            type="button"
                            :class="['drt-pill', { active: detailReportFilter === 'all' }]"
                            @click="detailReportFilter = 'all'"
                          >全部 ({{ reportSummary.total }})</button>
                          <button
                            type="button"
                            :class="['drt-pill', { active: detailReportFilter === 'pass' }]"
                            @click="detailReportFilter = 'pass'"
                          >通过 ({{ reportSummary.pass }})</button>
                          <button
                            type="button"
                            :class="['drt-pill', { active: detailReportFilter === 'fail' }]"
                            @click="detailReportFilter = 'fail'"
                          >失败 ({{ reportSummary.fail }})</button>
                        </div>
                        <div class="detail-report-toolbar-icons">
                          <n-input
                            v-model:value="detailReportSearch"
                            size="small"
                            clearable
                            placeholder="搜索步骤 / URL"
                            class="detail-report-search"
                          >
                            <template #prefix>
                              <n-icon :component="SearchOutlined" />
                            </template>
                          </n-input>
                          <n-button quaternary circle size="small"><template #icon><n-icon :component="MenuOutlined" /></template></n-button>
                          <n-button quaternary circle size="small"><template #icon><n-icon :component="SortDescendingOutlined" /></template></n-button>
                        </div>
                      </div>

                      <div
                        class="detail-report-body-split"
                        :class="{ 'with-detail': !!selectedReportLog }"
                      >
                        <div class="detail-report-list-col">
                          <n-scrollbar class="detail-report-list-scroll">
                            <div v-if="filteredDetailReportLogs.length === 0" class="detail-report-list-empty">
                              <template v-if="reportSummary.total === 0">
                                暂无记录。请在「测试步骤」中点击「发送」后回到此处查看；记录保存在本浏览器。
                              </template>
                              <template v-else>当前筛选下暂无记录</template>
                            </div>
                            <div
                              v-for="row in filteredDetailReportLogs"
                              :key="row.id"
                              role="button"
                              tabindex="0"
                              :class="[
                                'detail-report-row',
                                row.pass ? 'pass' : 'fail',
                                { active: selectedReportLogId === row.id }
                              ]"
                              @click="selectReportLogRow(row)"
                              @keyup.enter="selectReportLogRow(row)"
                            >
                              <span :class="['detail-report-status', row.pass ? 'ok' : 'bad']">{{ row.pass ? '通过' : '失败' }}</span>
                              <span class="detail-report-step-name">{{ row.name }}</span>
                              <span class="detail-report-method" :style="methodBadgeStyle(row.method)">{{ row.method }}</span>
                              <span class="detail-report-url" :title="row.url">{{ row.url }}</span>
                              <span class="detail-report-meta">
                                <span v-if="row.statusCode != null" :class="['detail-report-code', row.pass ? 'ok' : 'bad']">{{ row.statusCode }}</span>
                                <span v-else class="detail-report-code bad">—</span>
                                <span v-if="row.elapsedMs != null" class="detail-report-time">{{ row.elapsedMs.toFixed(2) }}ms</span>
                                <span v-else class="detail-report-time">—</span>
                              </span>
                            </div>
                          </n-scrollbar>
                        </div>

                        <aside v-if="selectedReportLog" class="detail-report-detail-pane">
                          <div class="drp-topbar">
                            <div class="drp-summary-line">
                              <span class="drp-sum-label">HTTP 状态码</span>
                              <span
                                :class="['drp-sum-code', reportDetailStatusClass]"
                              >{{ selectedReportLog.statusCode ?? '—' }}</span>
                              <span class="drp-sum-sep">耗时</span>
                              <span class="drp-sum-val">{{
                                selectedReportLog.elapsedMs != null
                                  ? `${Math.round(Number(selectedReportLog.elapsedMs))}ms`
                                  : '—'
                              }}</span>
                              <span class="drp-sum-sep">大小</span>
                              <span class="drp-sum-val">{{ reportDetailBodySizeLabel }}</span>
                            </div>
                            <n-button
                              quaternary
                              circle
                              size="small"
                              class="drp-close"
                              @click="clearReportLogSelection"
                            >
                              <template #icon><n-icon :component="CloseOutlined" /></template>
                            </n-button>
                          </div>

                          <div class="drp-validate-block">
                            <div class="drp-validate-title">校验响应</div>
                            <div
                              :class="[
                                'drp-validate-msg',
                                reportDetailAssertionFailed ? 'is-fail' : 'is-ok'
                              ]"
                            >
                              <n-icon
                                :component="reportDetailAssertionFailed ? CloseCircleOutlined : CheckCircleOutlined"
                                class="drp-validate-icon"
                              />
                              <span>{{ reportDetailAssertionMessage }}</span>
                            </div>
                          </div>

                          <div class="drp-pane-tabs">
                            <div class="drp-pane-tab-btns">
                              <button
                                type="button"
                                :class="['drp-pt', { active: detailReportPaneTab === 'body' }]"
                                @click="detailReportPaneTab = 'body'"
                              >Body</button>
                              <button
                                type="button"
                                :class="['drp-pt', { active: detailReportPaneTab === 'cookie' }]"
                                @click="detailReportPaneTab = 'cookie'"
                              >Cookie</button>
                              <button
                                type="button"
                                :class="['drp-pt', { active: detailReportPaneTab === 'header' }]"
                                @click="detailReportPaneTab = 'header'"
                              >Header<n-tag v-if="reportDetailHeaderCount" size="small" round class="drp-pt-badge">{{ reportDetailHeaderCount }}</n-tag></button>
                              <button
                                type="button"
                                :class="['drp-pt', { active: detailReportPaneTab === 'console' }]"
                                @click="detailReportPaneTab = 'console'"
                              >控制台</button>
                              <button
                                type="button"
                                :class="['drp-pt', { active: detailReportPaneTab === 'request' }]"
                                @click="detailReportPaneTab = 'request'"
                              >实际请求</button>
                            </div>
                            <n-button size="small" class="drp-debug-btn" @click="debugThisReportStep">
                              <template #icon><n-icon :component="ThunderboltOutlined" /></template>
                              调试此步骤
                            </n-button>
                          </div>

                          <n-scrollbar class="drp-pane-scroll">
                            <div v-show="detailReportPaneTab === 'body'" class="drp-tab-panel">
                              <div v-if="reportDetailMissingBodySnapshot" class="drp-legacy-hint">
                                该条为历史记录，当时未保存响应体。请到「测试步骤」中对该步骤重新点击「发送」，即可在报告中查看完整 Body。
                              </div>
                              <div class="drp-body-subbar">
                                <div class="drp-body-modes">
                                  <button
                                    type="button"
                                    :class="['drp-bm', { active: detailReportBodyView === 'pretty' }]"
                                    @click="detailReportBodyView = 'pretty'"
                                  >Pretty</button>
                                  <button
                                    type="button"
                                    :class="['drp-bm', { active: detailReportBodyView === 'raw' }]"
                                    @click="detailReportBodyView = 'raw'"
                                  >Raw</button>
                                </div>
                                <span class="drp-body-tag">JSON</span>
                                <span class="drp-body-tag muted">utf8</span>
                                <div class="drp-body-actions">
                                  <n-button quaternary circle size="tiny" @click="copyReportDetailBody">
                                    <template #icon><n-icon :component="CopyOutlined" /></template>
                                  </n-button>
                                  <n-button quaternary circle size="tiny" @click="downloadReportDetailBody">
                                    <template #icon><n-icon :component="DownloadOutlined" /></template>
                                  </n-button>
                                </div>
                              </div>
                              <div class="drp-code-frame">
                                <div class="drp-code-gutter">
                                  <span
                                    v-for="(_, i) in reportDetailBodyLines"
                                    :key="'ln-' + i"
                                    class="drp-gutter-line"
                                  >{{ i + 1 }}</span>
                                </div>
                                <pre class="drp-code-pre">{{ reportDetailBodyForView }}</pre>
                              </div>
                            </div>

                            <div v-show="detailReportPaneTab === 'cookie'" class="drp-tab-panel">
                              <div v-if="reportDetailCookieEntries.length === 0" class="drp-empty-hint">无 Set-Cookie 响应头</div>
                              <div v-else class="drp-kv-list">
                                <div
                                  v-for="([k, v], idx) in reportDetailCookieEntries"
                                  :key="'ck-' + idx"
                                  class="drp-kv-row"
                                >
                                  <span class="drp-k">{{ k }}</span>
                                  <span class="drp-v" :title="v">{{ v }}</span>
                                </div>
                              </div>
                            </div>

                            <div v-show="detailReportPaneTab === 'header'" class="drp-tab-panel">
                              <div
                                v-if="!selectedReportLog.responseHeaders || reportDetailHeaderCount === 0"
                                class="drp-empty-hint"
                              >无响应头记录（旧数据或未经过代理返回）</div>
                              <div v-else class="drp-kv-list">
                                <div
                                  v-for="([k, v]) in Object.entries(selectedReportLog.responseHeaders)"
                                  :key="'h-' + k"
                                  class="drp-kv-row"
                                >
                                  <span class="drp-k">{{ k }}</span>
                                  <span class="drp-v" :title="v">{{ v }}</span>
                                </div>
                              </div>
                            </div>

                            <div v-show="detailReportPaneTab === 'console'" class="drp-tab-panel">
                              <pre v-if="selectedReportLog.error" class="drp-console-pre">{{ selectedReportLog.error }}</pre>
                              <div v-else class="drp-empty-hint">暂无控制台输出</div>
                            </div>

                            <div v-show="detailReportPaneTab === 'request'" class="drp-tab-panel">
                              <div class="drp-req-line">
                                <span class="detail-report-method" :style="methodBadgeStyle(selectedReportLog.method)">{{ selectedReportLog.method }}</span>
                                <span class="drp-req-url" :title="selectedReportLog.url">{{ selectedReportLog.url }}</span>
                              </div>
                              <div class="drp-subtitle">请求头</div>
                              <div
                                v-if="!selectedReportLog.requestHeaders || Object.keys(selectedReportLog.requestHeaders).length === 0"
                                class="drp-empty-hint"
                              >无请求头快照</div>
                              <div v-else class="drp-kv-list">
                                <div
                                  v-for="([k, v]) in Object.entries(selectedReportLog.requestHeaders)"
                                  :key="'rqh-' + k"
                                  class="drp-kv-row"
                                >
                                  <span class="drp-k">{{ k }}</span>
                                  <span class="drp-v" :title="v">{{ v }}</span>
                                </div>
                              </div>
                              <div class="drp-subtitle">请求体</div>
                              <pre class="drp-req-body-pre">{{ selectedReportLog.requestBodySnippet || '（空）' }}</pre>
                            </div>
                          </n-scrollbar>
                        </aside>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>
      </div><!-- end content-panel -->

      </template><!-- end 测试场景 v-else -->
      </template><!-- end v-else (非scheduled) -->
    </div><!-- end workspace-main -->

    <!-- ── 新建/编辑场景弹窗 ── -->
    <n-modal
      v-model:show="showModal"
      :mask-closable="false"
      preset="card"
      :style="{ width: '520px', borderRadius: '12px' }"
      :bordered="false"
    >
      <template #header>
        <div class="modal-header">
          <div :class="['modal-icon', editingId ? 'edit' : 'create']">
            <n-icon :component="editingId ? EditOutlined : PlusOutlined" />
          </div>
          <span>{{ editingId ? '编辑测试场景' : '新建场景用例' }}</span>
        </div>
      </template>
      <n-form :model="form" label-placement="top" :show-feedback="false" style="display:flex;flex-direction:column;gap:14px">
        <n-form-item label="场景名称" required>
          <n-input v-model:value="form.name" placeholder="请输入场景名称" />
        </n-form-item>
        <n-form-item label="所属目录">
          <n-select
            v-model:value="form.folder_id"
            :options="folderSelectOptions"
            placeholder="不选则放到根目录"
            clearable
          />
        </n-form-item>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <n-form-item label="优先级">
            <n-select v-model:value="form.priority" :options="priorityOptions" placeholder="选择优先级" />
          </n-form-item>
          <n-form-item label="运行环境">
            <n-select v-model:value="form.env_id" :options="envOptions" placeholder="选择环境" clearable />
          </n-form-item>
        </div>
        <n-form-item label="标签">
          <n-input v-model:value="form.tags" placeholder="输入标签（可选）" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="form.description" type="textarea" placeholder="场景描述（可选）" :autosize="{ minRows: 2, maxRows: 4 }" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="saveScenario" style="background:#7d33ff;border-color:#7d33ff">
            {{ editingId ? '保存修改' : '创建场景' }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- ── 新建目录弹窗 ── -->
    <n-modal
      v-model:show="showFolderModal"
      :mask-closable="false"
      preset="card"
      :style="{ width: '400px', borderRadius: '12px' }"
      :bordered="false"
    >
      <template #header>
        <div class="modal-header">
          <div class="modal-icon create">
            <n-icon :component="FolderOutlined" />
          </div>
          <span>新建目录</span>
        </div>
      </template>
      <n-form label-placement="top" :show-feedback="false">
        <n-form-item label="目录名称" required>
          <n-input v-model:value="folderForm.name" placeholder="请输入目录名称" @keyup.enter="saveFolder" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <n-button @click="showFolderModal = false">取消</n-button>
          <n-button type="primary" @click="saveFolder" style="background:#7d33ff;border-color:#7d33ff">创建目录</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 批量：修改优先级 -->
    <n-modal v-model:show="showBatchPriorityModal" preset="card" title="批量设置优先级" :style="{ width: '400px' }">
      <n-select v-model:value="batchPriorityValue" :options="priorityOptions" style="width:100%" />
      <template #footer>
        <n-button @click="showBatchPriorityModal = false">取消</n-button>
        <n-button type="primary" :loading="batchLoading" style="background:#7d33ff;border-color:#7d33ff" @click="applyBatchPriority">确定</n-button>
      </template>
    </n-modal>

    <!-- 批量：增加标签 -->
    <n-modal v-model:show="showBatchAddTagModal" preset="card" title="批量增加标签" :style="{ width: '400px' }">
      <n-input v-model:value="batchTagInput" placeholder="输入要追加的标签（逗号分隔）" />
      <template #footer>
        <n-button @click="showBatchAddTagModal = false">取消</n-button>
        <n-button type="primary" :loading="batchLoading" style="background:#7d33ff;border-color:#7d33ff" @click="applyBatchAddTag">确定</n-button>
      </template>
    </n-modal>

    <!-- 批量：删除标签 -->
    <n-modal v-model:show="showBatchRemoveTagModal" preset="card" title="批量删除标签" :style="{ width: '400px' }">
      <n-input v-model:value="batchTagRemoveInput" placeholder="输入要移除的标签关键字" />
      <template #footer>
        <n-button @click="showBatchRemoveTagModal = false">取消</n-button>
        <n-button type="primary" :loading="batchLoading" style="background:#7d33ff;border-color:#7d33ff" @click="applyBatchRemoveTag">确定</n-button>
      </template>
    </n-modal>

    <!-- 批量：移动到目录 -->
    <n-modal v-model:show="showBatchMoveModal" preset="card" title="移动到目录" :style="{ width: '400px' }">
      <n-select
        v-model:value="batchMoveFolderId"
        :options="batchMoveFolderOptions"
        placeholder="选择目标目录（选「根目录」可移出）"
        clearable
        style="width:100%"
      />
      <template #footer>
        <n-button @click="showBatchMoveModal = false">取消</n-button>
        <n-button type="primary" :loading="batchLoading" style="background:#7d33ff;border-color:#7d33ff" @click="applyBatchMove">确定</n-button>
      </template>
    </n-modal>

    <!-- 从单接口用例 / 调试用例 导入：左树右表，对齐单接口测试 -->
    <n-modal
      v-model:show="showImportCaseModal"
      preset="card"
      :style="{ width: 'min(1000px, calc(100vw - 32px))', borderRadius: '12px' }"
      :mask-closable="false"
      @on-after-leave="onImportCaseModalLeave"
    >
      <template #header>
        <div class="import-debug-modal-title">{{ importCaseModalTitle }}</div>
        <div class="import-debug-modal-sub">{{ importCaseModalSub }}</div>
      </template>
      <n-spin :show="importTreeLoading" class="import-case-modal-spin">
        <div class="import-case-modal-body">
          <div class="import-case-tree-pane">
            <div class="import-pane-head">接口目录</div>
            <n-input
              v-model:value="importTreePattern"
              placeholder="搜索目录 / 接口"
              clearable
              size="small"
              class="import-tree-search"
            >
              <template #prefix><n-icon :component="SearchOutlined" style="color:#a0aab8" /></template>
            </n-input>
            <n-scrollbar class="import-tree-scroll">
              <n-tree
                block-line
                expand-on-click
                :data="importModalTreeData"
                :pattern="importTreePattern"
                :selected-keys="importModalTreeSelectedKeys"
                :render-label="renderImportModalTreeLabel"
                @update:selected-keys="onImportModalTreeSelect"
                class="import-modal-tree"
              />
            </n-scrollbar>
          </div>
          <div class="import-case-list-pane">
            <template v-if="!importSelectedInterfaceId">
              <div class="import-case-pane-placeholder">
                请从左侧选择接口，右侧将展示该接口下的测试用例（与「单接口测试 → 测试用例」一致的数据来源）
              </div>
            </template>
            <template v-else>
              <div class="import-interface-bar">
                <span class="idc-method import-if-method" :style="methodBadgeStyle(importInterfaceDetail?.method || '')">
                  {{ importInterfaceDetail?.method || '—' }}
                </span>
                <span class="import-if-title">{{ importInterfaceDetail?.name }}</span>
                <span class="import-if-path">{{ importInterfaceDetail?.path }}</span>
              </div>
              <n-tabs v-model:value="importModalCategory" type="line" size="small" class="import-cat-tabs">
                <n-tab-pane name="all" :tab="`全部 (${importModalCounts.all})`" />
                <n-tab-pane name="positive" :tab="`正向 (${importModalCounts.positive})`" />
                <n-tab-pane name="negative" :tab="`负向 (${importModalCounts.negative})`" />
                <n-tab-pane name="boundary" :tab="`边界值 (${importModalCounts.boundary})`" />
                <n-tab-pane name="security" :tab="`安全性 (${importModalCounts.security})`" />
                <n-tab-pane name="other" :tab="`其他 (${importModalCounts.other})`" />
              </n-tabs>
              <n-input
                v-model:value="importCaseListSearch"
                placeholder="搜索用例名称"
                clearable
                size="small"
                class="import-case-list-search"
              >
                <template #prefix><n-icon :component="SearchOutlined" style="color:#a0aab8" /></template>
              </n-input>
              <n-spin :show="importCasesLoading" class="import-cases-inner-spin">
                <div
                  v-if="!importCasesLoading && importModalCasesList.length === 0"
                  class="import-debug-empty import-case-list-empty"
                >
                  {{ importCaseEmptyHint }}
                </div>
                <div
                  v-else-if="!importCasesLoading && importModalFilteredCases.length === 0"
                  class="import-debug-empty import-case-list-empty"
                >
                  当前筛选下没有用例，请切换分组或清空搜索
                </div>
                <div v-else class="import-case-table-wrap">
                  <n-table :single-line="false" size="small" class="import-case-n-table">
                    <thead>
                      <tr>
                        <th class="ict-col-check"></th>
                        <th class="ict-col-idx">#</th>
                        <th class="ict-col-name">名称</th>
                        <th class="ict-col-group">分组</th>
                        <th class="ict-col-result">运行结果</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in importModalFilteredCases" :key="row.id" class="import-case-tr">
                        <td class="ict-col-check" @click.stop>
                          <n-checkbox
                            :checked="!!importSelectedCaseRows[row.id]"
                            @update:checked="(v: boolean) => toggleImportCaseRow(row, v)"
                          />
                        </td>
                        <td class="ict-col-idx">{{ idx + 1 }}</td>
                        <td class="ict-col-name" :title="row.name">{{ row.name }}</td>
                        <td class="ict-col-group">{{ row.groupLabel }}</td>
                        <td class="ict-col-result"><span class="ict-result-dash">—</span></td>
                      </tr>
                    </tbody>
                  </n-table>
                </div>
              </n-spin>
            </template>
          </div>
        </div>
      </n-spin>
      <template #footer>
        <div class="import-debug-footer">
          <span class="import-debug-hint" v-if="importSelectedCaseCount">已选 {{ importSelectedCaseCount }} 条</span>
          <div class="import-debug-actions">
            <n-button @click="showImportCaseModal = false">取消</n-button>
            <n-button
              type="primary"
              :loading="importDebugSaving"
              :disabled="importSelectedCaseCount === 0"
              style="background:#7d33ff;border-color:#7d33ff"
              @click="confirmImportCases"
            >
              导入选中
            </n-button>
          </div>
        </div>
      </template>
    </n-modal>

    <!-- 归档测试报告详情（数据库） -->
    <n-modal
      v-model:show="reportArchiveModalVisible"
      preset="card"
      :title="reportArchiveDetail?.scenario_name ? `报告 · ${reportArchiveDetail.scenario_name}` : '报告详情'"
      style="width: min(920px, 96vw)"
      :segmented="{ content: true }"
      @after-leave="closeReportArchiveModal"
    >
      <n-spin :show="reportArchiveLoading">
        <div v-if="reportArchiveDetail" class="arc-root">
          <div class="arc-summary-bar">
            <n-tag size="small" type="success" round>通过 {{ reportArchiveDetail.summary?.pass ?? 0 }}</n-tag>
            <n-tag size="small" type="error" round>失败 {{ reportArchiveDetail.summary?.fail ?? 0 }}</n-tag>
            <n-tag size="small" round>总计 {{ reportArchiveDetail.summary?.total ?? 0 }}</n-tag>
            <span class="arc-meta">{{ reportArchiveDetail.created_at }} · {{ reportArchiveDetail.env_name || '—' }}</span>
          </div>
          <n-scrollbar style="max-height: min(520px, 70vh)">
            <div
              v-for="(e, idx) in (reportArchiveDetail.entries || [])"
              :key="e.id || idx"
              class="arc-entry"
            >
              <div class="arc-entry-head">
                <span :class="['arc-pass', e.pass ? 'ok' : 'bad']">{{ e.pass ? '通过' : '失败' }}</span>
                <span class="arc-name">{{ e.name }}</span>
                <n-tag size="tiny" round>{{ e.method }}</n-tag>
                <span class="arc-code" v-if="e.statusCode != null">{{ e.statusCode }}</span>
                <span class="arc-ms" v-if="e.elapsedMs != null">{{ Math.round(e.elapsedMs) }}ms</span>
              </div>
              <div class="arc-url" :title="e.url">{{ e.url }}</div>
              <pre v-if="e.responseBodyText" class="arc-body-snippet">{{ e.responseBodyText.length > 1200 ? e.responseBodyText.slice(0, 1200) + '…' : e.responseBodyText }}</pre>
              <div v-else-if="e.error" class="arc-err">{{ e.error }}</div>
            </div>
          </n-scrollbar>
        </div>
      </n-spin>
    </n-modal>

    <!-- 从接口导入步骤（直接导入接口定义） -->
    <n-modal
      v-model:show="showImportApiModal"
      preset="card"
      :style="{ width: 'min(800px, calc(100vw - 32px))', borderRadius: '12px' }"
      :mask-closable="false"
      @after-leave="onImportApiModalLeave"
    >
      <template #header>
        <div class="import-debug-modal-title">从接口导入步骤</div>
        <div class="import-debug-modal-sub">从接口树中选择接口，直接导入为场景步骤（无需关联测试用例）</div>
      </template>
      <n-spin :show="importTreeLoading" class="import-case-modal-spin">
        <div class="import-case-modal-body">
          <div class="import-case-tree-pane">
            <div class="import-pane-head">接口目录</div>
            <n-input v-model:value="importTreePattern" placeholder="搜索目录 / 接口" clearable size="small" class="import-tree-search">
              <template #prefix><n-icon :component="SearchOutlined" style="color:#a0aab8" /></template>
            </n-input>
            <n-scrollbar class="import-tree-scroll">
              <n-tree
                block-line
                expand-on-click
                :data="importModalTreeData"
                :pattern="importTreePattern"
                :render-label="renderImportModalTreeLabel"
                @update:selected-keys="onImportApiTreeSelect"
                class="import-modal-tree"
              />
            </n-scrollbar>
          </div>
          <div class="import-case-list-pane">
            <div v-if="importApiSelectedList.length === 0" class="import-case-pane-placeholder">
              从左侧点击接口节点，即可选中该接口作为导入步骤。可多次点击选中多个接口。
            </div>
            <template v-else>
              <div class="import-pane-head">已选接口（{{ importApiSelectedList.length }} 个）</div>
              <n-scrollbar style="max-height: 360px">
                <div v-for="api in importApiSelectedList" :key="api.id" class="import-api-selected-row">
                  <span class="idc-method import-if-method" :style="methodBadgeStyle(api.method)">{{ api.method }}</span>
                  <div class="import-api-sel-info">
                    <div class="import-api-sel-name">{{ api.name }}</div>
                    <div class="import-api-sel-path">{{ api.path }}</div>
                  </div>
                  <n-button quaternary circle size="tiny" @click="removeImportApiSelected(api.id)">
                    <template #icon><n-icon :component="CloseOutlined" /></template>
                  </n-button>
                </div>
              </n-scrollbar>
            </template>
          </div>
        </div>
      </n-spin>
      <template #footer>
        <div class="import-debug-footer">
          <span class="import-debug-hint" v-if="importApiSelectedList.length">已选 {{ importApiSelectedList.length }} 个接口</span>
          <div class="import-debug-actions">
            <n-button @click="showImportApiModal = false">取消</n-button>
            <n-button
              type="primary"
              :loading="importApiSaving"
              :disabled="importApiSelectedList.length === 0"
              style="background:#7d33ff;border-color:#7d33ff"
              @click="confirmImportApi"
            >
              导入为步骤
            </n-button>
          </div>
        </div>
      </template>
    </n-modal>

    <!-- 从 cURL 导入步骤 -->
    <n-modal
      v-model:show="showCurlModal"
      preset="card"
      :style="{ width: 'min(600px, calc(100vw - 32px))', borderRadius: '12px' }"
      :mask-closable="false"
    >
      <template #header>
        <div class="import-debug-modal-title">从 cURL 导入步骤</div>
        <div class="import-debug-modal-sub">粘贴 cURL 命令，系统自动解析为 HTTP 请求步骤</div>
      </template>
      <div style="display:flex;flex-direction:column;gap:12px">
        <n-input
          v-model:value="curlInput"
          type="textarea"
          :rows="6"
          :placeholder="curlInputPlaceholder"
          style="font-family: monospace; font-size: 12px"
        />
        <n-button size="small" @click="parseCurlCommand" :disabled="!curlInput.trim()">解析 cURL</n-button>
        <div v-if="curlParsed" class="curl-preview-box">
          <div class="curl-preview-row">
            <span class="curl-preview-label">方法</span>
            <span class="step-li-method" :style="methodBadgeStyle(curlParsed.method)">{{ curlParsed.method }}</span>
          </div>
          <div class="curl-preview-row">
            <span class="curl-preview-label">URL</span>
            <span class="curl-preview-val">{{ curlParsed.url || '（未识别）' }}</span>
          </div>
          <div class="curl-preview-row">
            <span class="curl-preview-label">Headers</span>
            <span class="curl-preview-val">{{ Object.keys(curlParsed.headers).length }} 个</span>
          </div>
          <div class="curl-preview-row">
            <span class="curl-preview-label">Body</span>
            <span class="curl-preview-val">{{ curlParsed.body ? curlParsed.body.slice(0, 60) + (curlParsed.body.length > 60 ? '…' : '') : '（空）' }}</span>
          </div>
          <n-input
            v-model:value="curlStepName"
            size="small"
            placeholder="步骤名称（可选）"
            style="margin-top:8px"
          />
        </div>
      </div>
      <template #footer>
        <div class="import-debug-footer">
          <div class="import-debug-actions">
            <n-button @click="showCurlModal = false; curlParsed = null; curlInput = ''">取消</n-button>
            <n-button
              type="primary"
              :loading="curlSaving"
              :disabled="!curlParsed"
              style="background:#7d33ff;border-color:#7d33ff"
              @click="confirmImportCurl"
            >
              导入步骤
            </n-button>
          </div>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="stepWizardVisible"
      preset="card"
      title="步骤快速向导"
      :style="{ width: '760px' }"
      class="step-wizard-modal"
    >
      <div class="step-wizard-body">
        <div class="step-wizard-headline">
          <div class="step-wizard-title">{{ currentStepTitle }}</div>
          <div class="step-wizard-subtitle">一键补齐认证、前置准备、响应校验和变量提取。</div>
        </div>
        <div class="step-wizard-grid">
          <button
            v-for="preset in stepWizardPresets"
            :key="preset.key"
            type="button"
            class="step-wizard-card"
            @click="applyStepWizardPreset(preset.key)"
          >
            <strong>{{ preset.label }}</strong>
            <span>{{ preset.description }}</span>
          </button>
        </div>
        <div class="step-wizard-footer-tip">
          「从当前执行」会从当前选中步骤开始顺序执行；「运行全部」会从第一步开始完整重跑。
        </div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="stepWizardVisible = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 批量运行进度 -->
    <n-modal
      v-model:show="batchRunModalVisible"
      preset="card"
      :mask-closable="!batchRunning"
      :closable="!batchRunning"
      class="batch-run-modal"
      style="width: min(440px, 94vw); border-radius: 12px"
      title="批量运行"
      @after-leave="onBatchRunModalAfterLeave"
    >
      <div class="batch-run-body">
        <p class="batch-run-hint">
          将按步骤顺序真实请求接口，并为每个场景生成一条「批量运行」报告（可在<strong>执行报告</strong>菜单查看）。
        </p>
        <n-progress
          type="line"
          :percentage="batchRunProgress"
          :processing="batchRunning"
          indicator-placement="inside"
          style="margin-bottom: 16px"
        />
        <div class="batch-run-phase">{{ batchRunPhase }}</div>
        <div v-if="batchRunDetail" class="batch-run-detail">{{ batchRunDetail }}</div>
        <div v-if="batchRunSummary && !batchRunning" class="batch-run-result">
          <n-tag type="success" size="small" round>通过 {{ batchRunSummary.passSteps }} 步</n-tag>
          <n-tag type="error" size="small" round>失败 {{ batchRunSummary.failSteps }} 步</n-tag>
          <span class="batch-run-sc-count">涉及 {{ batchRunSummary.scenarios }} 个场景</span>
        </div>
      </div>
      <template #footer>
        <n-button :disabled="batchRunning" type="primary" class="step-purple-btn" @click="closeBatchRunModal">
          {{ batchRunning ? '运行中…' : '关闭' }}
        </n-button>
      </template>
    </n-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h, watch, nextTick, type Component } from 'vue'
import * as echarts from 'echarts'
import SidebarNavigation from '@/components/SidebarNavigation.vue'
import { useUserStore } from '@/store/user'
import {
  SearchOutlined, PlusOutlined, AppstoreOutlined, FolderOutlined,
  ClockCircleOutlined, FileTextOutlined, CaretRightOutlined,
  FilterOutlined, GlobalOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, CloseCircleOutlined, SyncOutlined,
  FileOutlined, FolderOpenOutlined, MenuOutlined, TagsOutlined, CloseOutlined,
  ArrowLeftOutlined,
  LinkOutlined, SettingOutlined, DownOutlined,
  ApiOutlined, CloudUploadOutlined, ImportOutlined, CodeOutlined,
  DatabaseOutlined, ApartmentOutlined, ThunderboltOutlined,
  SortDescendingOutlined, CopyOutlined, DownloadOutlined, QuestionCircleOutlined
} from '@vicons/antd'
import {
  useMessage,
  useDialog,
  NIcon,
  NButton,
  NTree,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NDropdown,
  NCheckbox,
  NSpin,
  NPopover,
  NTabs,
  NTabPane,
  NTable,
  NScrollbar,
  NSpace,
  NButtonGroup,
  NEmpty,
  NRadio,
  NRadioGroup,
  NTag,
  NTooltip,
  NProgress,
  NInputNumber,
  NSwitch
} from 'naive-ui'
import execRequest from '@/api/exec-request'
import {
  normalizeStepReqSettings,
  defaultStepReqSettings,
  buildProxyExtraFields,
  type StepReqSettings
} from '@/utils/req-settings'
import {
  loadStepExecContext,
  runStepExecContext,
  computeSummaryForLogEntries,
  evaluatePostAssertions,
  normalizeProxyHeaderMap,
  type ScenarioSendLogEntry as ExecScenarioLogEntry
} from '@/utils/scenario-step-exec'

const message = useMessage()
const dialog = useDialog()
const userStore = useUserStore()

// ── 基础状态 ──
const activeView = ref('welcome')
const mainTab = ref('scenarios')
const scheduledTab = ref('tasks')
const sidebarSearch = ref('')
const sidebarSearch2 = ref('')
const tableSearch = ref('')
const scheduledSearch = ref('')
const rptScope = ref('personal')
const rptType = ref('all')
const rptSearch = ref('')

// ── 测试报告（服务端持久化）──
type ReportListRowUi = {
  id: number
  name: string
  env: string
  time: string
  creator: string
  runMode: string
  triggerMode: string
  status: 'done' | 'running' | 'failed'
  total: number
  success: number
  fail: number
  skip: number
  scenario_id: number
}

const reportsLoading = ref(false)
const reportsFromApi = ref<any[]>([])

const mapApiReportToRow = (d: any): ReportListRowUi => {
  const sum = d.summary || {}
  const tt = String(d.trigger_type || 'manual')
  return {
    id: d.id,
    name: (d.title && String(d.title).trim()) || d.scenario_name || `场景 #${d.scenario_id}`,
    env: d.env_name || '—',
    time: d.created_at || '—',
    creator: d.creator || '—',
    runMode: '客户端运行',
    triggerMode: tt === 'scheduled' ? '定时' : tt === 'batch' ? '批量运行' : '手动',
    status: 'done',
    total: Number(sum.total ?? 0),
    success: Number(sum.pass ?? 0),
    fail: Number(sum.fail ?? 0),
    skip: Number(sum.untested ?? 0),
    scenario_id: d.scenario_id
  }
}

const fetchReportsFromApi = async () => {
  reportsLoading.value = true
  try {
    const q = rptSearch.value.trim()
    const data: any = await execRequest.get('/test-scenarios/reports', {
      params: { q: q || undefined, limit: 100 }
    })
    reportsFromApi.value = Array.isArray(data) ? data : []
  } catch {
    reportsFromApi.value = []
  } finally {
    reportsLoading.value = false
  }
}

let rptSearchDebounce: ReturnType<typeof setTimeout> | null = null
watch(rptSearch, () => {
  if (activeView.value !== 'reports') return
  if (rptSearchDebounce) clearTimeout(rptSearchDebounce)
  rptSearchDebounce = setTimeout(() => {
    rptSearchDebounce = null
    fetchReportsFromApi()
  }, 400)
})

watch(
  () => activeView.value,
  (v) => {
    if (v === 'reports') fetchReportsFromApi()
  }
)

const filteredReports = computed((): ReportListRowUi[] => {
  let list = reportsFromApi.value.map(mapApiReportToRow)
  if (rptScope.value === 'personal') {
    const me = (userStore.username || '').trim()
    if (me) list = list.filter((r) => r.creator === me)
  }
  if (rptType.value === 'scheduled') list = list.filter((r) => r.triggerMode === '定时')
  else if (rptType.value === 'manual') list = list.filter((r) => r.triggerMode === '手动')
  else if (rptType.value === 'batch') list = list.filter((r) => r.triggerMode === '批量运行')
  return list
})

/** 全局报告详情弹窗 */
const reportArchiveModalVisible = ref(false)
const reportArchiveLoading = ref(false)
const reportArchiveDetail = ref<any | null>(null)

const openReportArchiveDetail = async (row: ReportListRowUi) => {
  reportArchiveModalVisible.value = true
  reportArchiveLoading.value = true
  reportArchiveDetail.value = null
  try {
    const data: any = await execRequest.get(`/test-scenarios/reports/${row.id}`)
    reportArchiveDetail.value = data
  } catch {
    message.error('加载报告详情失败')
    reportArchiveModalVisible.value = false
  } finally {
    reportArchiveLoading.value = false
  }
}

const closeReportArchiveModal = () => {
  reportArchiveModalVisible.value = false
  reportArchiveDetail.value = null
}

// ── 场景数据 ──
const loading = ref(false)
const saving = ref(false)
const scenarios = ref<any[]>([])
const environments = ref<any[]>([])
const checkedIds = ref<Set<number>>(new Set())

/** 批量运行进度 */
const batchRunning = ref(false)
const batchRunModalVisible = ref(false)
const batchRunProgress = ref(0)
const batchRunPhase = ref('')
const batchRunDetail = ref('')
const batchRunSummary = ref<{ scenarios: number; passSteps: number; failSteps: number } | null>(null)

const showBatchPriorityModal = ref(false)
const batchPriorityValue = ref('P0')
const showBatchAddTagModal = ref(false)
const batchTagInput = ref('')
const showBatchRemoveTagModal = ref(false)
const batchTagRemoveInput = ref('')
const showBatchMoveModal = ref(false)
const batchMoveFolderId = ref<string | null>(null)
const batchLoading = ref(false)

// ── 目录数据（localStorage持久化）──
const FOLDER_KEY = 'scenario_folders'
const FOLDER_MAP_KEY = 'scenario_folder_map'

const loadFolders = (): Array<{id: string, name: string}> => {
  try { return JSON.parse(localStorage.getItem(FOLDER_KEY) || '[]') } catch { return [] }
}
const saveFolders = (list: Array<{id: string, name: string}>) => {
  localStorage.setItem(FOLDER_KEY, JSON.stringify(list))
}
const loadFolderMap = (): Record<number, string> => {
  try { return JSON.parse(localStorage.getItem(FOLDER_MAP_KEY) || '{}') } catch { return {} }
}
const saveFolderMap = (map: Record<number, string>) => {
  localStorage.setItem(FOLDER_MAP_KEY, JSON.stringify(map))
}

const localFolders = ref(loadFolders())
const scenarioFolderMap = ref(loadFolderMap())

// ── 场景弹窗 ──
const showModal = ref(false)
const editingId = ref<number | null>(null)
const form = ref({
  name: '',
  priority: 'P0',
  tags: '',
  env_id: null as number | null,
  description: '',
  folder_id: null as string | null,
})

// ── 目录弹窗 ──
const showFolderModal = ref(false)
const folderForm = ref({ name: '' })

const priorityOptions = [
  { label: 'P0', value: 'P0' },
  { label: 'P1', value: 'P1' },
  { label: 'P2', value: 'P2' },
  { label: 'P3', value: 'P3' },
]
const envOptions = computed(() =>
  environments.value.map(e => ({ label: e.name, value: e.id }))
)
const folderSelectOptions = computed(() =>
  localFolders.value.map(f => ({ label: f.name, value: f.id }))
)

// ── 左侧树 / 列表与详情切换 ──
const ROOT_KEY = 'root-scenarios'
const scenarioPanelMode = ref<'list' | 'detail'>('list')
const selectedScenarioForDetail = ref<any | null>(null)
const selectedSidebarKeys = ref<string[]>([ROOT_KEY])
const expandedFolderKeys = ref<string[]>([ROOT_KEY])

const detailScenario = computed(() => {
  const id = selectedScenarioForDetail.value?.id
  if (id == null) return null
  return scenarios.value.find(s => s.id === id) || selectedScenarioForDetail.value
})

const detailMainTab = ref('steps')
const detailMainTabs = [
  { key: 'steps', label: '测试步骤' },
  { key: 'report', label: '测试报告' }
]
const detailEnvId = ref<number | null>(null)

const detailStepCount = computed(() => {
  const steps = detailScenario.value?.steps
  return Array.isArray(steps) ? steps.length : 0
})

const detailStepsOrdered = computed(() => {
  const steps = detailScenario.value?.steps
  if (!Array.isArray(steps)) return []
  return [...steps].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
})

type ScenarioSendLogEntry = {
  id: string
  at: number
  pass: boolean
  name: string
  method: string
  url: string
  statusCode: number | null
  elapsedMs: number | null
  error?: string
  /** 代理返回的响应体文本（JSON 已格式化） */
  responseBodyText?: string
  responseSizeBytes?: number
  responseHeaders?: Record<string, string>
  requestHeaders?: Record<string, string>
  requestBodySnippet?: string
  /** 契约校验：期望状态码（开启校验时） */
  expectedStatusCode?: number
  /** 是否启用「校验响应」契约 */
  validateResponseEnabled?: boolean
  /** 响应体 JSON 顶层 code（存在时参与业务校验） */
  jsonBusinessCode?: string | null
  /** 业务层 code/success 校验是否通过；undefined 表示未检测或无 code 字段 */
  jsonBusinessOk?: boolean
}

/** 后置操作 · 校验响应（与调试页 post_operations 约定一致） */
const VALIDATE_RESPONSE_TYPE = 'validate_response'

const defaultValidateResponseOp = () => ({
  type: VALIDATE_RESPONSE_TYPE,
  enabled: true,
  expect_status: 200,
  /** 为 false 时不根据 JSON 顶层 code / success 做二次校验 */
  check_json_code: true
})

const mergePostOpsWithValidateResponse = (raw: any[]): any[] => {
  const list = Array.isArray(raw) ? raw.map((x) => ({ ...x })) : []
  const idx = list.findIndex((o) => o?.type === VALIDATE_RESPONSE_TYPE)
  if (idx >= 0) {
    const cur = list[idx]
    const n = Number(cur.expect_status ?? cur.expected_status ?? 200)
    list[idx] = {
      type: VALIDATE_RESPONSE_TYPE,
      enabled: cur.enabled !== false,
      expect_status: Number.isFinite(n) ? n : 200,
      check_json_code: cur.check_json_code !== false
    }
    return list
  }
  return [defaultValidateResponseOp(), ...list]
}

const getValidateResponseConfigFromPostOps = (ops: any[] | undefined) => {
  const list = Array.isArray(ops) ? ops : []
  const op = list.find((o) => o?.type === VALIDATE_RESPONSE_TYPE)
  if (!op) {
    return { enabled: true as boolean, expect_status: 200, check_json_code: true as boolean }
  }
  const n = Number(op.expect_status ?? 200)
  return {
    enabled: op.enabled !== false,
    expect_status: Number.isFinite(n) ? n : 200,
    check_json_code: op.check_json_code !== false
  }
}

/**
 * 许多接口 HTTP 恒为 200，业务错误放在 JSON：{ code: '401', msg } 或 success:false。
 * 在存在顶层 code 或 success===false 时做二次判定；成功码视为 200 / 0（字符串或数字）。
 */
const checkJsonEnvelopeBusinessSuccess = (
  data: unknown
): { skipped: boolean; ok: boolean; displayCode: string | null } => {
  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    return { skipped: true, ok: true, displayCode: null }
  }
  const o = data as Record<string, unknown>
  if (o.success === false) {
    return { skipped: false, ok: false, displayCode: null }
  }
  if (!('code' in o)) {
    return { skipped: true, ok: true, displayCode: null }
  }
  const raw = o.code
  if (raw === undefined || raw === null) {
    return { skipped: true, ok: true, displayCode: null }
  }
  const s = String(raw).trim()
  const n = Number(s)
  const ok = s === '200' || s === '0' || n === 200 || n === 0
  return { skipped: false, ok, displayCode: s }
}

const evaluateValidateResponsePass = (
  statusCode: number | null | undefined,
  postOps: any[] | undefined,
  responseData?: unknown
): {
  pass: boolean
  expectedStatusCode: number
  validateResponseEnabled: boolean
  jsonBusinessCode?: string | null
  jsonBusinessOk?: boolean
} => {
  const cfg = getValidateResponseConfigFromPostOps(postOps)
  const c =
    statusCode != null && Number.isFinite(Number(statusCode)) ? Number(statusCode) : null
  if (!cfg.enabled) {
    return {
      pass: c != null && c >= 200 && c < 400,
      expectedStatusCode: cfg.expect_status,
      validateResponseEnabled: false
    }
  }
  if (c == null) {
    return { pass: false, expectedStatusCode: cfg.expect_status, validateResponseEnabled: true }
  }
  const httpPass = c === cfg.expect_status
  let jsonBusinessCode: string | null | undefined
  let jsonBusinessOk: boolean | undefined

  if (cfg.check_json_code && httpPass && responseData !== undefined) {
    const biz = checkJsonEnvelopeBusinessSuccess(responseData)
    if (!biz.skipped) {
      jsonBusinessCode = biz.displayCode
      jsonBusinessOk = biz.ok
    }
  }

  const pass = httpPass && (jsonBusinessOk === undefined || jsonBusinessOk === true)

  return {
    pass,
    expectedStatusCode: cfg.expect_status,
    validateResponseEnabled: true,
    jsonBusinessCode,
    jsonBusinessOk
  }
}

const validateEnableSelectOptions = [
  { label: '开启', value: 'on' },
  { label: '关闭', value: 'off' }
]

const validateStatusCodeOptions = [
  { label: '成功 (200)', value: 200 },
  { label: '创建成功 (201)', value: 201 },
  { label: '无内容 (204)', value: 204 },
  { label: '重定向 (301)', value: 301 },
  { label: '重定向 (302)', value: 302 },
  { label: '错误请求 (400)', value: 400 },
  { label: '未授权 (401)', value: 401 },
  { label: '禁止 (403)', value: 403 },
  { label: '未找到 (404)', value: 404 },
  { label: '服务器错误 (500)', value: 500 }
]

const LS_SCENARIO_SEND_LOGS = 'test-scenarios-send-logs-v1'

/** 与 localStorage / 接口 id 对齐，避免 number / string 混用导致读不到桶 */
const normalizeScenarioLogId = (id: unknown): number | null => {
  if (id == null || id === '') return null
  const n = Number(id)
  return Number.isFinite(n) ? n : null
}

const normalizeProxyHeaderMap = (h: unknown): Record<string, string> => {
  if (!h || typeof h !== 'object') return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(h as Record<string, unknown>)) {
    if (v == null) continue
    out[String(k)] = Array.isArray(v) ? (v as unknown[]).map(String).join(', ') : String(v)
  }
  return out
}

/** 将 execRequest 返回结果规范为与 exec-engine /proxy 一致的形状（兼容多包一层 data、或拦截器已剥壳） */
const normalizeExecProxyResponse = (raw: unknown) => {
  const pick = (o: Record<string, unknown>) => ({
    status_code: o.status_code != null ? Number(o.status_code) : null,
    headers: o.headers,
    data: o.data,
    elapsed:
      o.elapsed != null && !Number.isNaN(Number(o.elapsed)) ? Number(o.elapsed) : null,
    error: o.error != null ? String(o.error) : undefined,
    msg: o.msg != null ? String(o.msg) : undefined
  })

  if (raw == null || typeof raw !== 'object') {
    return pick({ status_code: null, headers: undefined, data: undefined, elapsed: null })
  }
  const r = raw as Record<string, unknown>
  if ('status_code' in r || r.error != null) {
    return pick(r)
  }
  const inner = r.data
  if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
    const d = inner as Record<string, unknown>
    if ('status_code' in d || d.error != null || (d.headers != null && 'data' in d)) {
      return pick(d)
    }
  }
  return {
    status_code: null as number | null,
    headers: undefined as unknown,
    data: raw,
    elapsed: null as number | null,
    error: undefined as string | undefined,
    msg: undefined as string | undefined
  }
}

const stringifyResponseForLog = (data: unknown): { text: string; bytes: number } => {
  if (data === undefined || data === null) {
    return { text: '(空响应体)', bytes: 0 }
  }
  if (data === '') {
    return { text: '(空响应体)', bytes: 0 }
  }
  let text: string
  if (typeof data === 'string') {
    text = data
  } else {
    try {
      const s = JSON.stringify(data, null, 2)
      text = s === undefined ? String(data) : s
    } catch {
      text = String(data)
    }
  }
  const bytes = new TextEncoder().encode(text).byteLength
  return { text, bytes }
}

const buildRequestBodySnippet = (b: unknown): string => {
  if (b == null || b === '') return ''
  if (typeof b === 'string') {
    return b.length > 8000 ? `${b.slice(0, 8000)}…` : b
  }
  try {
    const s = JSON.stringify(b)
    return s.length > 8000 ? `${s.slice(0, 8000)}…` : s
  } catch {
    const s = String(b)
    return s.length > 8000 ? `${s.slice(0, 8000)}…` : s
  }
}

const scenarioSendLogs = ref<Record<number, ScenarioSendLogEntry[]>>({})

/** 待写入数据库的报告条目（防抖合并为一条报告记录） */
const pendingReportPersistEntries = ref<ScenarioSendLogEntry[]>([])
let pendingReportPersistTimer: ReturnType<typeof setTimeout> | null = null

const schedulePersistScenarioReportToServer = () => {
  if (pendingReportPersistTimer != null) clearTimeout(pendingReportPersistTimer)
  pendingReportPersistTimer = setTimeout(() => {
    pendingReportPersistTimer = null
    void flushPendingScenarioReportToServer()
  }, 1800)
}

const flushPendingScenarioReportToServer = async () => {
  const sid = normalizeScenarioLogId(detailScenario.value?.id)
  const batch = [...pendingReportPersistEntries.value]
  pendingReportPersistEntries.value = []
  if (sid == null || batch.length === 0) return
  const summary = computeSummaryForLogEntries(batch)
  const title = `${String(detailScenario.value?.name || '场景').slice(0, 200)} · ${new Date().toLocaleString()}`
  try {
    await execRequest.post(`/test-scenarios/${sid}/reports`, {
      entries: batch,
      summary,
      env_id: detailEnvId.value,
      creator: userStore.username || 'anonymous',
      trigger_type: 'manual',
      title
    })
    if (activeView.value === 'reports') await fetchReportsFromApi()
  } catch {
    /* 静默失败，避免打断调试；可改为 message.warning */
  }
}

const detailReportFilter = ref<'all' | 'pass' | 'fail'>('all')
const detailReportSearch = ref('')
const selectedReportLogId = ref<string | null>(null)
const detailReportPaneTab = ref<'body' | 'cookie' | 'header' | 'console' | 'request'>('body')
const detailReportBodyView = ref<'pretty' | 'raw'>('pretty')

const selectedReportLog = computed(() => {
  if (!selectedReportLogId.value) return null
  return currentScenarioSendLogs.value.find((r) => r.id === selectedReportLogId.value) ?? null
})

const reportDetailHeaderCount = computed(() => {
  const h = selectedReportLog.value?.responseHeaders
  return h ? Object.keys(h).length : 0
})

const reportDetailBodyDisplay = computed(() => {
  const log = selectedReportLog.value
  if (!log) return ''
  if (log.responseBodyText != null && log.responseBodyText !== '') return log.responseBodyText
  if (log.error) return log.error
  return '(无响应体)'
})

/** 有状态码但无快照：多为升级功能前的 localStorage 记录 */
const reportDetailMissingBodySnapshot = computed(() => {
  const log = selectedReportLog.value
  if (!log) return false
  const hasSnap = log.responseBodyText != null && log.responseBodyText !== ''
  return !hasSnap && !log.error && log.statusCode != null
})

const reportDetailBodyForView = computed(() => {
  const base = reportDetailBodyDisplay.value
  if (detailReportBodyView.value !== 'raw') return base
  try {
    const j = JSON.parse(base)
    return JSON.stringify(j)
  } catch {
    return base.replace(/\r\n/g, '\n').replace(/\n/g, '').trim()
  }
})

const reportDetailBodyLines = computed(() => {
  const raw = reportDetailBodyForView.value
  return raw === '' ? [''] : raw.split('\n')
})

const reportDetailBodySizeLabel = computed(() => {
  const log = selectedReportLog.value
  if (log?.responseSizeBytes != null && !Number.isNaN(log.responseSizeBytes)) {
    const b = log.responseSizeBytes
    if (b < 1024) return `${b}B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`
    return `${(b / 1024 / 1024).toFixed(2)}MB`
  }
  const enc = new TextEncoder().encode(reportDetailBodyForView.value)
  const b = enc.byteLength
  if (b < 1024) return `${b}B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`
  return `${(b / 1024 / 1024).toFixed(2)}MB`
})

const reportDetailCookieEntries = computed(() => {
  const h = selectedReportLog.value?.responseHeaders
  if (!h) return [] as [string, string][]
  return Object.entries(h).filter(([k]) => {
    const lk = k.toLowerCase()
    return lk === 'set-cookie' || lk.startsWith('set-cookie')
  })
})

const reportDetailAssertionFailed = computed(() => {
  const log = selectedReportLog.value
  if (!log) return false
  if (log.jsonBusinessOk === false) return true
  const c = log.statusCode
  if (log.validateResponseEnabled === false) {
    return !(c != null && c >= 200 && c < 300)
  }
  if (log.expectedStatusCode != null) {
    return c == null || c !== log.expectedStatusCode
  }
  return c == null || c < 200 || c >= 300
})

const reportDetailAssertionMessage = computed(() => {
  const log = selectedReportLog.value
  if (!log) return ''
  if (log.validateResponseEnabled === false) {
    if (!reportDetailAssertionFailed.value) return '校验响应已关闭，按 2xx 判定通过'
    return '请求未成功（非 2xx）'
  }
  if (log.jsonBusinessOk === false) {
    const codeHint =
      log.jsonBusinessCode != null && log.jsonBusinessCode !== ''
        ? `响应体 code 为「${log.jsonBusinessCode}」`
        : '响应体 success 为 false'
    const httpOk =
      log.statusCode != null &&
      log.expectedStatusCode != null &&
      log.statusCode === log.expectedStatusCode
    if (httpOk) {
      return `HTTP ${log.statusCode} 已通过，但业务未通过：${codeHint}（成功时 code 应为 200 或 0）`
    }
    return `业务未通过：${codeHint}（成功时 code 应为 200 或 0）`
  }
  if (log.expectedStatusCode != null) {
    if (!reportDetailAssertionFailed.value) {
      return `HTTP 状态码校验通过（期望 ${log.expectedStatusCode}）`
    }
    return `HTTP 状态码应当是 ${log.expectedStatusCode}`
  }
  if (!reportDetailAssertionFailed.value) return 'HTTP 状态码校验通过'
  return 'HTTP 状态码应当是 2xx'
})

const reportDetailStatusClass = computed(() => {
  const c = selectedReportLog.value?.statusCode
  if (c == null) return 'na'
  if (c >= 200 && c < 300) return 'ok'
  if (c >= 400 && c < 500) return 'warn'
  if (c >= 500) return 'bad'
  return 'na'
})

const selectReportLogRow = (row: ScenarioSendLogEntry) => {
  selectedReportLogId.value = row.id
  detailReportPaneTab.value = 'body'
  detailReportBodyView.value = 'pretty'
}

const clearReportLogSelection = () => {
  selectedReportLogId.value = null
}

const copyReportDetailBody = async () => {
  try {
    await navigator.clipboard.writeText(reportDetailBodyForView.value)
    message.success('已复制')
  } catch {
    message.warning('复制失败')
  }
}

const downloadReportDetailBody = () => {
  const log = selectedReportLog.value
  if (!log) return
  const blob = new Blob([reportDetailBodyForView.value], { type: 'application/json;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `response-${log.id}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

const debugThisReportStep = () => {
  const log = selectedReportLog.value
  if (!log) return
  const name = String(log.name || '').trim()
  detailMainTab.value = 'steps'
  const idx = detailStepsOrdered.value.findIndex((s) => String(s?.name || '').trim() === name)
  if (idx >= 0) {
    selectScenarioStep(idx)
    message.success('已切换到测试步骤')
  } else {
    message.warning('未找到同名步骤，请在左侧步骤列表中手动选择')
  }
}

const currentScenarioSendLogs = computed(() => {
  const id = normalizeScenarioLogId(detailScenario.value?.id)
  if (id == null) return []
  return scenarioSendLogs.value[id] ?? []
})

const reportSummary = computed(() => {
  const logs = currentScenarioSendLogs.value
  const total = logs.length
  let pass = 0
  let fail = 0
  let sumMs = 0
  let nMs = 0
  for (const e of logs) {
    if (e.pass) pass++
    else fail++
    if (e.elapsedMs != null && !Number.isNaN(e.elapsedMs)) {
      sumMs += e.elapsedMs
      nMs++
    }
  }
  const untested = 0
  return {
    total,
    pass,
    fail,
    untested,
    sumMs,
    avgMs: nMs > 0 ? sumMs / nMs : 0,
    nMs
  }
})

const reportPassPct = computed(() => {
  const t = reportSummary.value.total
  if (!t) return '0.00'
  return ((reportSummary.value.pass / t) * 100).toFixed(2)
})
const reportFailPct = computed(() => {
  const t = reportSummary.value.total
  if (!t) return '0.00'
  return ((reportSummary.value.fail / t) * 100).toFixed(2)
})
const reportUntestedPct = computed(() => {
  const t = reportSummary.value.total
  if (!t) return '0.00'
  return ((reportSummary.value.untested / t) * 100).toFixed(2)
})

const formatReportMs = (n: number) => {
  if (n == null || Number.isNaN(n)) return '0 ms'
  return `${Math.round(n)} ms`
}

/** 总耗时：多笔记录时取时间跨度与接口耗时的较大值，更贴近「整段执行」观感 */
const reportTotalDurationMs = computed(() => {
  const logs = currentScenarioSendLogs.value
  const sum = reportSummary.value.sumMs
  if (logs.length <= 1) return sum
  const ats = logs.map((l) => l.at).filter((x) => typeof x === 'number')
  if (ats.length < 2) return sum
  const span = Math.max(...ats) - Math.min(...ats)
  return Math.max(sum, span)
})

const reportDonutRef = ref<HTMLElement | null>(null)
let reportDonutChart: echarts.ECharts | null = null

const disposeReportDonut = () => {
  reportDonutChart?.dispose()
  reportDonutChart = null
}

const syncReportDonutChart = () => {
  if (detailMainTab.value !== 'report') return
  const el = reportDonutRef.value
  const { total, pass, fail, untested } = reportSummary.value
  if (!el || total === 0) {
    disposeReportDonut()
    return
  }
  if (!reportDonutChart) reportDonutChart = echarts.init(el)
  reportDonutChart.setOption({
    animationDuration: 320,
    tooltip: { trigger: 'item' },
    color: ['#52c41a', '#ff6b9d', '#d9d9d9'],
    series: [
      {
        type: 'pie',
        radius: ['58%', '82%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 3 },
        label: { show: false },
        emphasis: { scale: false },
        data: [
          { value: pass, name: '通过' },
          { value: fail, name: '失败' },
          { value: untested, name: '未测' }
        ]
      }
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '38%',
        style: {
          text: '已完成',
          fill: '#8792a2',
          fontSize: 12,
          fontWeight: 500
        }
      },
      {
        type: 'text',
        left: 'center',
        top: '50%',
        style: {
          text: String(total),
          fill: '#1a1f36',
          fontSize: 28,
          fontWeight: 700
        }
      }
    ]
  })
  reportDonutChart.resize()
}

const filteredDetailReportLogs = computed(() => {
  let list = [...currentScenarioSendLogs.value]
  if (detailReportFilter.value === 'pass') list = list.filter((e) => e.pass)
  else if (detailReportFilter.value === 'fail') list = list.filter((e) => !e.pass)
  const q = detailReportSearch.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.url.toLowerCase().includes(q) ||
        String(e.statusCode ?? '').includes(q)
    )
  }
  return list
})

watch(
  () => detailScenario.value?.id,
  () => {
    selectedReportLogId.value = null
  }
)

watch(
  () => [detailMainTab.value, filteredDetailReportLogs.value.map((r) => r.id).join('|')] as const,
  () => {
    if (detailMainTab.value !== 'report') {
      selectedReportLogId.value = null
      return
    }
    const id = selectedReportLogId.value
    if (id && !filteredDetailReportLogs.value.some((r) => r.id === id)) {
      selectedReportLogId.value = null
    }
  }
)

const persistScenarioSendLogs = () => {
  try {
    localStorage.setItem(LS_SCENARIO_SEND_LOGS, JSON.stringify(scenarioSendLogs.value))
  } catch {
    /* ignore */
  }
}

const loadScenarioSendLogs = () => {
  try {
    const raw = localStorage.getItem(LS_SCENARIO_SEND_LOGS)
    if (!raw) return
    const obj = JSON.parse(raw) as Record<string, ScenarioSendLogEntry[]>
    const next: Record<number, ScenarioSendLogEntry[]> = {}
    for (const k of Object.keys(obj)) next[Number(k)] = obj[k]
    scenarioSendLogs.value = next
  } catch {
    /* ignore */
  }
}

const appendScenarioSendLog = (entry: Omit<ScenarioSendLogEntry, 'id' | 'at'>) => {
  const sid = normalizeScenarioLogId(detailScenario.value?.id)
  if (sid == null) return
  const row: ScenarioSendLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    at: Date.now(),
    ...entry
  }
  const prev = scenarioSendLogs.value[sid] ?? []
  scenarioSendLogs.value = { ...scenarioSendLogs.value, [sid]: [row, ...prev] }
  persistScenarioSendLogs()
  pendingReportPersistEntries.value = [...pendingReportPersistEntries.value, row]
  schedulePersistScenarioReportToServer()
}

const onReportWindowResize = () => {
  if (detailMainTab.value === 'report') reportDonutChart?.resize()
}

watch(
  () => [
    detailMainTab.value,
    detailScenario.value?.id,
    reportSummary.value.total,
    reportSummary.value.pass,
    reportSummary.value.fail,
    reportSummary.value.untested
  ],
  async () => {
    await nextTick()
    if (detailMainTab.value !== 'report') {
      disposeReportDonut()
      return
    }
    syncReportDonutChart()
  }
)

const selectedStepIndex = ref<number | null>(null)
const stepDetailDrawerOpened = ref(false)
const stepDetailDrawerVisible = computed(() =>
  detailMainTab.value === 'steps'
  && detailStepCount.value > 0
  && selectedStepIndex.value != null
  && stepDetailDrawerOpened.value
)

const closeStepDetailDrawer = () => {
  stepDetailDrawerOpened.value = false
}

const handleStepDetailDrawerEscape = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return
  if (!stepDetailDrawerVisible.value) return
  e.preventDefault()
  stepDetailDrawerOpened.value = false
}

watch(stepDetailDrawerVisible, (visible) => {
  if (visible) {
    window.addEventListener('keydown', handleStepDetailDrawerEscape)
  } else {
    window.removeEventListener('keydown', handleStepDetailDrawerEscape)
  }
})

/** 右侧步骤详情：上/下区高度比例（可拖拽分隔条调整，与下区之和恒为 100） */
const stepDrawerSplitRef = ref<HTMLElement | null>(null)
const stepDrawerSplitUpper = ref(58)
const stepDrawerSplitLower = computed(() => 100 - stepDrawerSplitUpper.value)
const stepDrawerUpperFlexStyle = computed(() => ({
  flexGrow: stepDrawerSplitUpper.value,
  flexShrink: 1,
  flexBasis: '0px',
  minHeight: 0
}))
const stepDrawerLowerFlexStyle = computed(() => ({
  flexGrow: stepDrawerSplitLower.value,
  flexShrink: 1,
  flexBasis: '0px',
  minHeight: 0
}))

function onStepDrawerResizeStart(e: MouseEvent) {
  e.preventDefault()
  const el = stepDrawerSplitRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const startY = e.clientY
  const startUpper = stepDrawerSplitUpper.value
  const H = rect.height
  if (H < 48) return

  const onMove = (ev: MouseEvent) => {
    ev.preventDefault()
    const dy = ev.clientY - startY
    const dPercent = (dy / H) * 100
    let next = startUpper + dPercent
    next = Math.round(Math.max(28, Math.min(72, next)))
    stepDrawerSplitUpper.value = next
  }
  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
  document.body.style.cursor = 'ns-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

const stepBulkCheckedIndices = ref<number[]>([])
const stepBulkSelectedCount = computed(() => stepBulkCheckedIndices.value.length)
const stepSidebarMethods = ref<Record<number, string>>({})
const stepListSearch = ref('')
const stepMethodFilter = ref<string>('all')
const stepScenarioRunning = ref(false)
const stopStepScenarioRunFlag = ref(false)

const stepEditorLoading = ref(false)
const stepEditorSending = ref(false)
const stepEditorTab = ref('params')
const stepEditorCaseId = ref<number | null>(null)
const stepEditorInterfaceId = ref<number | null>(null)
const stepEditorLastResponse = ref<any | null>(null)
const stepEditorMethod = ref('GET')
const stepEditorPath = ref('')
const stepEditorFullUrl = ref('')
const stepEditorQueryParams = ref<any[]>([])
const stepEditorHeaderParams = ref<any[]>([])
const stepEditorPreOps = ref<any[]>([])
const stepEditorPostOps = ref<any[]>([])
const stepEditorBodyType = ref('none')
const stepEditorBodyContent = ref('')
const stepResponseViewMode = ref<'pretty' | 'raw'>('pretty')
const stepResponsePanelTab = ref<'body' | 'headers' | 'assert' | 'extract'>('body')
const stepAuthMode = ref<'none' | 'bearer' | 'basic' | 'apikey'>('none')
const stepWizardVisible = ref(false)
const stepUtilityConfig = ref<Record<string, any>>({})
const stepAuthBearer = ref({ prefix: 'Bearer', token: '' })
const stepAuthBasic = ref({ username: '', password: '' })
const stepAuthApiKey = ref<{ position: 'header' | 'query'; key: string; value: string }>({
  position: 'header',
  key: 'X-API-Key',
  value: ''
})

/** 与单接口调试「设置」Tab 一致（存于场景步骤 req_settings） */
const stepReqSettings = ref<StepReqSettings>({ ...defaultStepReqSettings })
const stepEncodingOptions = [
  { label: 'UTF-8', value: 'utf-8' },
  { label: 'GBK', value: 'gbk' },
  { label: 'GB2312', value: 'gb2312' },
  { label: 'ISO-8859-1', value: 'iso-8859-1' },
  { label: 'ASCII', value: 'ascii' }
]

const stepBodyTypeOptions = [
  { label: 'none', value: 'none' },
  { label: 'x-www-form-urlencoded', value: 'x-www-form-urlencoded' },
  { label: 'form-data', value: 'form-data' },
  { label: 'JSON', value: 'json' },
  { label: 'Text', value: 'text' }
]

const stepAuthApiKeyPositionOptions = [
  { label: 'Header', value: 'header' },
  { label: 'Query', value: 'query' }
]

const stepExtractSourceOptions = [
  { label: '响应 JSON', value: 'body' },
  { label: '响应头', value: 'header' }
]

const stepAssertionTargetOptions = [
  { label: '状态码', value: 'status' },
  { label: '响应 JSON', value: 'response_json' },
  { label: '响应头', value: 'response_header' },
  { label: '响应文本', value: 'response_text' }
]

const stepAssertionOperatorOptions = [
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'neq' },
  { label: '包含', value: 'contains' },
  { label: '存在', value: 'exists' },
  { label: '正则匹配', value: 'regex' }
]

const stepUnifiedDbActionOptions = [
  { label: '查询', value: 'query' },
  { label: '执行', value: 'execute' }
]

const stepUnifiedScriptLanguageOptions = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Java', value: 'java' },
  { label: 'Python', value: 'python' },
  { label: 'Groovy', value: 'groovy' },
  { label: 'Shell', value: 'shell' },
  { label: 'Lua', value: 'lua' }
]

const stepUnifiedWaitUnitOptions = [
  { label: '毫秒', value: 'ms' },
  { label: '秒', value: 's' },
  { label: '分钟', value: 'm' }
]

const stepUnifiedPublicScriptRegistry: Record<string, { label: string; description: string; script: string }> = {
  inject_timestamp: {
    label: '注入时间戳',
    description: '写入时间戳变量，可用于请求签名或防重放参数。',
    script: `
const varName = params.varName || 'timestamp'
const mode = params.mode || 'ms'
const value = mode === 's' ? Math.floor(Date.now() / 1000) : Date.now()
context.setVar(varName, value)
`,
  },
  bearer_from_env: {
    label: '环境 Bearer 注入',
    description: '从环境变量读取 token，并自动写入指定请求头。',
    script: `
const tokenVar = params.tokenVar || 'token'
const headerName = params.headerName || 'Authorization'
const prefix = params.prefix || 'Bearer '
const token = context.getVar(tokenVar)
if (!token) {
  throw new Error(\`未找到环境变量 \${tokenVar}\`)
}
context.setHeader(headerName, \`\${prefix}\${token}\`)
`,
  },
  sign_demo: {
    label: '签名示例',
    description: '使用时间戳和密钥拼接生成简单签名，适合联调演示。',
    script: `
const secretVar = params.secretVar || 'secret'
const headerName = params.headerName || 'X-Debug-Sign'
const timestampVar = params.timestampVar || 'timestamp'
const secret = context.getVar(secretVar) || ''
const timestamp = context.getVar(timestampVar) || Date.now()
const raw = \`\${context.method}|\${context.path}|\${timestamp}|\${secret}\`
const signature = btoa(unescape(encodeURIComponent(raw)))
context.setHeader(headerName, signature)
context.setVar('signature', signature)
`,
  }
}

const stepUnifiedPublicScriptOptions = Object.entries(stepUnifiedPublicScriptRegistry).map(([value, item]) => ({
  label: item.label,
  value
}))

const stepUnifiedPreOpCreateOptions = [
  { label: '数据库操作', value: 'db' },
  { label: '脚本', value: 'script' },
  { label: '公共脚本', value: 'public_script' },
  { label: '等待时间', value: 'wait' }
]

const stepUnifiedPostOpCreateOptions = [
  { label: '断言', value: 'assertion' },
  { label: '提取变量', value: 'extract' },
  { label: '数据库操作', value: 'db' },
  { label: '脚本', value: 'script' },
  { label: '公共脚本', value: 'public_script' },
  { label: '等待时间', value: 'wait' }
]

const stepUnifiedExtractSourceOptions = [
  { label: '响应 JSON', value: 'json' },
  { label: '响应 Header', value: 'header' },
  { label: '响应文本', value: 'text' }
]

const stepUnifiedAssertionTargetOptions = [
  { label: 'HTTP Code', value: 'status_code' },
  { label: 'Response JSON', value: 'response_json' },
  { label: 'Response Header', value: 'response_header' },
  { label: 'Response Text', value: 'response_text' },
  { label: 'Response Cookie', value: 'response_cookie' },
  { label: '环境变量', value: 'env_var' },
  { label: '全局变量', value: 'global_var' }
]

const stepUnifiedAssertionOperatorOptions = [
  { label: '等于', value: 'equals' },
  { label: '不等于', value: 'not_equals' },
  { label: '包含', value: 'contains' },
  { label: '存在', value: 'exists' },
  { label: '不存在', value: 'not_exists' },
  { label: '小于', value: 'less_than' },
  { label: '小于等于', value: 'less_than_or_equals' },
  { label: '大于', value: 'greater_than' },
  { label: '大于等于', value: 'greater_than_or_equals' },
  { label: '正则匹配', value: 'regex' }
]

const stepUnifiedPreOpTypeLabels: Record<string, string> = {
  db: '数据库操作',
  script: '脚本',
  public_script: '公共脚本',
  wait: '等待时间'
}

const stepUnifiedPostOpTypeLabels: Record<string, string> = {
  assertion: '断言',
  extract: '提取变量',
  db: '数据库操作',
  script: '脚本',
  public_script: '公共脚本',
  wait: '等待时间'
}

const createStepUnifiedOpId = (prefix: 'pre' | 'post' | 'assert' | 'extract') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const createStepUnifiedPreOp = (type: 'db' | 'script' | 'public_script' | 'wait') => {
  const base = {
    id: createStepUnifiedOpId('pre'),
    type,
    enabled: true,
    name: stepUnifiedPreOpTypeLabels[type] || '前置操作'
  }
  if (type === 'db') {
    return {
      ...base,
      config: { datasource: '', action: 'query', sql: '', result_var: '', timeout_ms: '5000' }
    }
  }
  if (type === 'script') {
    return {
      ...base,
      config: {
        language: 'javascript',
        script: "context.setVar('requestId', Date.now())\ncontext.setHeader('X-Request-Id', String(context.getVar('requestId')))"
      }
    }
  }
  if (type === 'public_script') {
    return {
      ...base,
      config: { script_key: 'inject_timestamp', params: '{\n  \"varName\": \"timestamp\",\n  \"mode\": \"ms\"\n}' }
    }
  }
  return {
    ...base,
    config: { duration: '500', unit: 'ms', note: '' }
  }
}

const createStepUnifiedPostOp = (type: 'assertion' | 'extract' | 'db' | 'script' | 'public_script' | 'wait') => {
  const base = {
    id: createStepUnifiedOpId(type === 'assertion' ? 'assert' : type === 'extract' ? 'extract' : 'post'),
    type,
    enabled: true,
    name: stepUnifiedPostOpTypeLabels[type] || '后置操作'
  }
  if (type === 'assertion') {
    return {
      ...base,
      config: { name: '', target: 'response_json', target_label: 'Response JSON', expression: '$.data.id', operator: 'equals', value: '' }
    }
  }
  if (type === 'extract') {
    return {
      ...base,
      config: { name: 'new_variable', source: 'json', expression: '$.data.id', target: 'environment' }
    }
  }
  if (type === 'db') {
    return {
      ...base,
      config: { datasource: '', action: 'query', sql: '', result_var: '', timeout_ms: '5000' }
    }
  }
  if (type === 'script') {
    return {
      ...base,
      config: {
        language: 'javascript',
        script: "if (statusCode !== 200) {\n  throw new Error('期望 HTTP 状态码为 200')\n}\n\ncontext.setTempVar('latestResponse', responseData)\ncontext.setTempVar('latestStatusCode', statusCode)"
      }
    }
  }
  if (type === 'public_script') {
    return {
      ...base,
      config: { script_key: 'inject_timestamp', params: '{\n  \"varName\": \"postExecutedAt\",\n  \"mode\": \"ms\"\n}' }
    }
  }
  return {
    ...base,
    config: { duration: '500', unit: 'ms', note: '' }
  }
}

const legacyStepValueScript = (method: 'setHeader' | 'setQuery' | 'setVar', name: string, value: string) =>
  `context.${method}(${JSON.stringify(name)}, ${JSON.stringify(value)})`

const normalizeStepUnifiedAssertionOperator = (operator: string) => {
  if (operator === 'eq') return 'equals'
  if (operator === 'neq') return 'not_equals'
  if (operator === 'gt') return 'greater_than'
  if (operator === 'gte') return 'greater_than_or_equals'
  if (operator === 'lt') return 'less_than'
  if (operator === 'lte') return 'less_than_or_equals'
  return operator || 'equals'
}

const normalizeStepUnifiedAssertionTarget = (target: string) => {
  if (target === 'status') return 'status_code'
  if (target === 'header') return 'response_header'
  if (target === 'text') return 'response_text'
  return target || 'response_json'
}

const normalizeStepUnifiedPreOperation = (op: any) => {
  if (!op || typeof op !== 'object') return createStepUnifiedPreOp('script')
  if (op.type === 'set_header') {
    return {
      ...createStepUnifiedPreOp('script'),
      id: op?.id || createStepUnifiedOpId('pre'),
      enabled: op?.enabled ?? true,
      name: op?.name || '兼容：设置 Header',
      config: {
        language: 'javascript',
        script: legacyStepValueScript('setHeader', String(op?.config?.name || ''), String(op?.config?.value || ''))
      }
    }
  }
  if (op.type === 'set_query') {
    return {
      ...createStepUnifiedPreOp('script'),
      id: op?.id || createStepUnifiedOpId('pre'),
      enabled: op?.enabled ?? true,
      name: op?.name || '兼容：设置 Query',
      config: {
        language: 'javascript',
        script: legacyStepValueScript('setQuery', String(op?.config?.name || ''), String(op?.config?.value || ''))
      }
    }
  }
  if (op.type === 'set_var') {
    return {
      ...createStepUnifiedPreOp('script'),
      id: op?.id || createStepUnifiedOpId('pre'),
      enabled: op?.enabled ?? true,
      name: op?.name || '兼容：设置变量',
      config: {
        language: 'javascript',
        script: legacyStepValueScript('setVar', String(op?.config?.name || ''), String(op?.config?.value || ''))
      }
    }
  }
  const normalizedType = op.type === 'db' || op.type === 'script' || op.type === 'public_script' || op.type === 'wait' ? op.type : 'script'
  const defaults = createStepUnifiedPreOp(normalizedType)
  return {
    ...defaults,
    ...op,
    id: op?.id || createStepUnifiedOpId('pre'),
    enabled: op?.enabled ?? true,
    name: op?.name || defaults.name,
    config: {
      ...defaults.config,
      ...(op?.config || {}),
      language: String(op?.config?.language || defaults.config.language || 'javascript'),
      unit: String(op?.config?.unit || defaults.config.unit || 'ms')
    }
  }
}

const normalizeStepUnifiedPostOperation = (op: any) => {
  if (!op || typeof op !== 'object') return createStepUnifiedPostOp('assertion')
  if (op.type === VALIDATE_RESPONSE_TYPE) {
    const n = Number(op?.expect_status ?? op?.expected_status ?? 200)
    return {
      type: VALIDATE_RESPONSE_TYPE,
      enabled: op?.enabled !== false,
      expect_status: Number.isFinite(n) ? n : 200,
      check_json_code: op?.check_json_code !== false
    }
  }
  const normalizedType = op.type === 'assertion' || op.type === 'extract' || op.type === 'db' || op.type === 'script' || op.type === 'public_script' || op.type === 'wait' ? op.type : 'assertion'
  const defaults = createStepUnifiedPostOp(normalizedType)
  const next = {
    ...defaults,
    ...op,
    id: op?.id || createStepUnifiedOpId(normalizedType === 'assertion' ? 'assert' : normalizedType === 'extract' ? 'extract' : 'post'),
    enabled: op?.enabled ?? true,
    name: op?.name || op?.config?.name || defaults.name,
    config: { ...defaults.config, ...(op?.config || {}) }
  }
  if (normalizedType === 'assertion') {
    next.config.target = normalizeStepUnifiedAssertionTarget(String(next.config.target || 'response_json'))
    next.config.operator = normalizeStepUnifiedAssertionOperator(String(next.config.operator || 'equals'))
    next.config.target_label = stepUnifiedAssertionTargetOptions.find((item) => item.value === next.config.target)?.label || next.config.target_label
  }
  if (normalizedType === 'extract') {
    const source = String(next.config.source || 'json')
    next.config.source = source === 'body' ? 'json' : source
    if (!next.config.target) next.config.target = 'environment'
  }
  if (normalizedType === 'script') next.config.language = String(next.config.language || 'javascript')
  if (normalizedType === 'wait') next.config.unit = String(next.config.unit || 'ms')
  return next
}

const normalizeStepUnifiedPreOperations = (raw: any) =>
  Array.isArray(raw) ? raw.map((item) => normalizeStepUnifiedPreOperation(item)) : []

const normalizeStepUnifiedPostOperations = (raw: any) =>
  mergePostOpsWithValidateResponse(Array.isArray(raw) ? raw.map((item) => normalizeStepUnifiedPostOperation(item)) : [])

const stepSendActionOptions = [
  { label: '保存并发送', key: 'save-and-send' },
  { label: '复制 cURL', key: 'copy-curl' },
  { label: '清空响应区', key: 'clear-response' }
]

const stepWizardPresets = [
  {
    key: 'login',
    label: '登录接口向导',
    description: '补齐 JSON Body、200 校验，并自动提取 token / userId。'
  },
  {
    key: 'authorized-json',
    label: '鉴权 JSON 接口',
    description: '补齐 Bearer 认证、Content-Type、TraceId 和通用断言。'
  },
  {
    key: 'query-debug',
    label: '查询调试向导',
    description: '适合 GET 查询类步骤，补齐 TraceId、基础断言和耗时等待。'
  }
]

const selectedStep = computed(() => {
  const idx = selectedStepIndex.value
  if (idx == null) return null
  return detailStepsOrdered.value[idx] || null
})

const isUtilityStep = computed(() =>
  utilityStepKinds.includes(String(selectedStep.value?.source || '') as any)
)

const selectedUtilityStepType = computed(() => String(selectedStep.value?.source || ''))

const stepMethodFilterOptions = [
  { label: '全部方法', value: 'all' },
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'DELETE', value: 'DELETE' }
]

const stepResponseBodyText = computed(() => {
  const r = stepEditorLastResponse.value
  if (!r) return ''
  if (r.error) {
    return `${r.error}${r.msg ? '\n' + r.msg : ''}`
  }
  const d = r.data
  if (d == null || d === '') return '(空响应体)'
  if (typeof d === 'string') return d
  try {
    return JSON.stringify(d, null, 2)
  } catch {
    return String(d)
  }
})

const stepResponseBodyRawText = computed(() => {
  const r = stepEditorLastResponse.value
  if (!r) return ''
  if (r.error) return `${r.error}${r.msg ? '\n' + r.msg : ''}`
  const d = r.data
  if (d == null || d === '') return '(空响应体)'
  if (typeof d === 'string') return d
  try {
    return JSON.stringify(d)
  } catch {
    return String(d)
  }
})

const stepResponseBodyPrettyText = computed(() => stepResponseBodyText.value)

const stepResponseHeaderEntries = computed(() => {
  const headers = stepEditorLastResponse.value?.headers
  if (!headers || typeof headers !== 'object') return [] as Array<[string, string]>
  return Object.entries(headers as Record<string, unknown>).map(([k, v]) => [k, String(v ?? '')])
})

const stepLogsByName = computed(() => {
  const map = new Map<string, ScenarioSendLogEntry>()
  for (const log of currentScenarioSendLogs.value) {
    const key = String(log.name || '').trim()
    if (!key || map.has(key)) continue
    map.set(key, log)
  }
  return map
})

const filteredStepCards = computed(() => {
  const q = stepListSearch.value.trim().toLowerCase()
  return detailStepsOrdered.value
    .map((step: any, idx: number) => {
      const method = stepSidebarMethod(idx)
      const log = stepLogsByName.value.get(String(step?.name || '').trim())
      const statusText = !log ? '待执行' : log.pass ? '已通过' : '失败'
      const statusClass = !log ? 'pending' : log.pass ? 'passed' : 'failed'
      return {
        idx,
        step,
        method,
        statusText,
        statusClass,
        lastCode: log?.statusCode != null ? `HTTP ${log.statusCode}` : '未响应',
        lastElapsed: log?.elapsedMs != null ? `${Math.round(Number(log.elapsedMs))} ms` : '未执行',
        lastRunAt: log ? new Date(log.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '刚刚'
      }
    })
    .filter((item) => {
      if (stepMethodFilter.value !== 'all' && item.method !== stepMethodFilter.value) return false
      if (!q) return true
      const name = String(item.step?.name || '').toLowerCase()
      const url = String(item.step?.custom_url || item.step?.url || '').toLowerCase()
      return name.includes(q) || url.includes(q)
    })
})

const stepPassCount = computed(() => filteredStepCards.value.filter((item) => item.statusClass === 'passed').length)
const stepFailCount = computed(() => filteredStepCards.value.filter((item) => item.statusClass === 'failed').length)
const stepPendingCount = computed(() => filteredStepCards.value.filter((item) => item.statusClass === 'pending').length)

const latestFailedStepLabel = computed(() => {
  const row = currentScenarioSendLogs.value.find((log) => !log.pass)
  return row ? row.name : '暂无'
})

const buildUrlWithQueryString = (url: string, rows: any[]): string => {
  const params = new URLSearchParams()
  for (const row of rows) {
    const k = String(row.name || '').trim()
    if (!k) continue
    params.append(k, String(row.example ?? row.value ?? ''))
  }
  const qs = params.toString()
  if (!qs) return url
  return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`
}

const buildFormBodyFromParamRows = (rows: any[]): string => {
  const params = new URLSearchParams()
  for (const row of rows) {
    const k = String(row.name || '').trim()
    if (!k) continue
    params.append(k, String(row.example ?? row.value ?? ''))
  }
  return params.toString()
}

const stepParamsTabLabel = computed(() => {
  const n = stepEditorQueryParams.value.length
  return n ? `Params (${n})` : 'Params'
})
const stepBodyTabLabel = computed(() =>
  stepEditorBodyType.value !== 'none' ? 'Body (1)' : 'Body'
)
const stepHeadersTabLabel = computed(() => {
  const n = stepEditorHeaderParams.value.length
  return n ? `Headers (${n})` : 'Headers'
})
const stepPostTabLabel = computed(() => {
  const n = stepEditorPostOps.value.length
  return n ? `后置操作 (${n})` : '后置操作'
})

const stepEditorExtractOps = computed(() =>
  stepEditorPostOps.value.filter((o) => o?.type === 'extract')
)

const stepEditorAssertionOps = computed(() =>
  stepEditorPostOps.value.filter((o) => o?.type === 'assertion')
)

const stepEditorPostOpsOther = computed(() =>
  stepEditorPostOps.value.filter((o) => o?.type !== VALIDATE_RESPONSE_TYPE && o?.type !== 'extract' && o?.type !== 'assertion')
)

const stepValidateEnabledUi = computed(() => {
  const op = stepEditorPostOps.value.find((o) => o?.type === VALIDATE_RESPONSE_TYPE)
  const on = op ? op.enabled !== false : true
  return on ? 'on' : 'off'
})

const stepValidateExpectStatusUi = computed(() => {
  const op = stepEditorPostOps.value.find((o) => o?.type === VALIDATE_RESPONSE_TYPE)
  const n = Number(op?.expect_status ?? 200)
  return Number.isFinite(n) ? n : 200
})

const upsertValidateResponseOp = (patch: { enabled?: boolean; expect_status?: number }) => {
  const list = [...stepEditorPostOps.value]
  const idx = list.findIndex((o) => o?.type === VALIDATE_RESPONSE_TYPE)
  const base = idx >= 0 ? { ...list[idx] } : defaultValidateResponseOp()
  if (patch.enabled !== undefined) base.enabled = patch.enabled
  if (patch.expect_status !== undefined) base.expect_status = patch.expect_status
  base.type = VALIDATE_RESPONSE_TYPE
  if (idx >= 0) list[idx] = base
  else list.unshift(base)
  stepEditorPostOps.value = list
}

const persistStepPostOperations = async () => {
  const cid = stepEditorCaseId.value
  if (!cid) {
    await persistCurrentStepDraftToScenarioStep({ post_operations: stepEditorPostOps.value })
    return
  }
  try {
    await execRequest.patch(`/test-cases/${cid}`, { post_operations: stepEditorPostOps.value })
  } catch {
    message.error('保存后置操作失败')
  }
}

const persistCurrentStepDraftToScenarioStep = async (patch: Record<string, any>) => {
  const idx = selectedStepIndex.value
  const scenario = detailScenario.value
  if (idx == null || !scenario?.id) return
  const steps = [...(detailStepsOrdered.value as any[])]
  const step = steps[idx]
  if (!step) return
  steps[idx] = { ...step, ...patch }
  try {
    await execRequest.patch(`/test-scenarios/${scenario.id}`, { steps })
    await fetchScenarios()
  } catch {
    message.error('保存步骤配置失败')
  }
}

const resetStepReqSettings = () => {
  stepReqSettings.value = { ...defaultStepReqSettings }
}

const saveStepReqSettings = async () => {
  if (isUtilityStep.value) return
  if (selectedStepIndex.value == null) return
  try {
    await persistCurrentStepDraftToScenarioStep({ req_settings: { ...stepReqSettings.value } })
    message.success('请求设置已保存')
  } catch {
    message.error('保存失败')
  }
}

const stepPreOpTypeLabel = (type: string) => {
  if (type === 'set_header') return '设置 Header'
  if (type === 'set_query') return '设置 Query'
  if (type === 'set_var') return '设置变量'
  if (type === 'wait') return '等待时间'
  if (type === 'script') return '前置脚本'
  return '前置操作'
}

const createStepPreOp = (type: 'set_header' | 'set_query' | 'set_var' | 'wait' | 'script') => {
  const base = {
    id: `pre-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    enabled: true,
    config: {} as Record<string, any>
  }
  if (type === 'wait') {
    base.config = { duration: '500', note: '' }
  } else if (type === 'script') {
    base.config = { script: '' }
  } else {
    base.config = { name: '', value: '' }
  }
  return base
}

const createStepExtractOp = () => ({
  id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type: 'extract',
  enabled: true,
  config: {
    name: '',
    source: 'body',
    expression: ''
  }
})

const createStepAssertionOp = () => ({
  id: `assert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type: 'assertion',
  enabled: true,
  config: {
    name: '',
    target: 'status',
    expression: '',
    operator: 'eq',
    value: '200'
  }
})

const persistStepPreOperations = async () => {
  const cid = stepEditorCaseId.value
  if (!cid) {
    await persistCurrentStepDraftToScenarioStep({ pre_operations: stepEditorPreOps.value })
    return
  }
  try {
    await execRequest.patch(`/test-cases/${cid}`, { pre_operations: stepEditorPreOps.value })
  } catch {
    message.error('保存前置操作失败')
  }
}

const addStepPreOp = async (type: 'set_header' | 'set_query' | 'set_var' | 'wait' | 'script') => {
  stepEditorPreOps.value = [...stepEditorPreOps.value, createStepPreOp(type)]
  await persistStepPreOperations()
}

const removeStepPreOp = async (idx: number) => {
  stepEditorPreOps.value = stepEditorPreOps.value.filter((_, i) => i !== idx)
  await persistStepPreOperations()
}

const addStepExtractOp = async () => {
  stepEditorPostOps.value = [...stepEditorPostOps.value, createStepExtractOp()]
  await persistStepPostOperations()
}

const addStepAssertionOp = async () => {
  stepEditorPostOps.value = [...stepEditorPostOps.value, createStepAssertionOp()]
  await persistStepPostOperations()
}

const removeStepAssertionOp = async (idx: number) => {
  let seen = -1
  stepEditorPostOps.value = stepEditorPostOps.value.filter((op) => {
    if (op?.type !== 'assertion') return true
    seen += 1
    return seen !== idx
  })
  await persistStepPostOperations()
}

const applyStepPreScriptPreset = (op: any, preset: 'token' | 'trace') => {
  if (preset === 'token') {
    op.config.script = "context.setHeader('Authorization', 'Bearer {{token}}')"
  } else {
    op.config.script = "context.setHeader('X-Trace-Id', `trace-${Date.now()}`)"
  }
  void persistStepPreOperations()
}

const stepVisiblePostOps = computed(() =>
  stepEditorPostOps.value.filter((op) => op?.type !== VALIDATE_RESPONSE_TYPE)
)

const persistStepPreOperationsUnified = async () => {
  const normalized = normalizeStepUnifiedPreOperations(stepEditorPreOps.value)
  stepEditorPreOps.value = normalized
  const cid = stepEditorCaseId.value
  if (!cid) {
    await persistCurrentStepDraftToScenarioStep({ pre_operations: normalized })
    return
  }
  try {
    await execRequest.patch(`/test-cases/${cid}`, { pre_operations: normalized })
  } catch {
    message.error('保存前置操作失败')
  }
}

const persistStepPostOperationsUnified = async () => {
  const normalized = normalizeStepUnifiedPostOperations(stepEditorPostOps.value)
  stepEditorPostOps.value = normalized
  const cid = stepEditorCaseId.value
  if (!cid) {
    await persistCurrentStepDraftToScenarioStep({ post_operations: normalized })
    return
  }
  try {
    await execRequest.patch(`/test-cases/${cid}`, { post_operations: normalized })
  } catch {
    message.error('保存后置操作失败')
  }
}

const addStepPreOpUnified = async (type: 'db' | 'script' | 'public_script' | 'wait') => {
  stepEditorPreOps.value = [...stepEditorPreOps.value, createStepUnifiedPreOp(type)]
  await persistStepPreOperationsUnified()
}

const addStepPostOpUnified = async (type: 'assertion' | 'extract' | 'db' | 'script' | 'public_script' | 'wait') => {
  stepEditorPostOps.value = [...stepEditorPostOps.value, createStepUnifiedPostOp(type)]
  await persistStepPostOperationsUnified()
}

const removeStepPreOpUnified = async (idx: number) => {
  stepEditorPreOps.value = stepEditorPreOps.value.filter((_, i) => i !== idx)
  await persistStepPreOperationsUnified()
}

const removeStepPostOpUnified = async (idx: number) => {
  const target = stepVisiblePostOps.value[idx]
  if (!target) return
  stepEditorPostOps.value = stepEditorPostOps.value.filter((op) => op !== target)
  await persistStepPostOperationsUnified()
}

const createUtilityStep = (type: 'wait_step' | 'script_step' | 'group_step' | 'db_step') => {
  const base: any = {
    source: type,
    case_id: null,
    interface_id: null,
    pre_operations: [],
    post_operations: [],
    auth_config: { mode: 'none' },
    utility_config: {}
  }
  if (type === 'wait_step') {
    return { ...base, name: '等待时间', utility_config: { duration: '500', note: '' } }
  }
  if (type === 'script_step') {
    return { ...base, name: '前置脚本步骤', utility_config: { script: "context.setVar('token', 'demo-token')" } }
  }
  if (type === 'group_step') {
    return { ...base, name: '步骤分组', utility_config: { group_name: '新分组', note: '' } }
  }
  return { ...base, name: '数据库步骤', utility_config: { datasource: '', action: 'query', sql: '' } }
}

const removeStepExtractOp = async (idx: number) => {
  let seen = -1
  stepEditorPostOps.value = stepEditorPostOps.value.filter((op) => {
    if (op?.type !== 'extract') return true
    seen += 1
    return seen !== idx
  })
  await persistStepPostOperations()
}

const onStepValidateEnabledChange = async (v: string) => {
  upsertValidateResponseOp({ enabled: v === 'on' })
  await persistStepPostOperations()
}

const onStepValidateExpectStatusChange = async (v: number) => {
  upsertValidateResponseOp({ expect_status: v })
  await persistStepPostOperations()
}

const cloneParamRows = (raw: any): any[] =>
  Array.isArray(raw) ? raw.map((x: any) => ({ ...x })) : []

const unwrapEntity = (res: any): any => {
  if (!res || typeof res !== 'object') return null
  if ('id' in res) return res
  if (res.data && typeof res.data === 'object' && 'id' in res.data) return res.data
  return null
}

const stepSidebarMethod = (idx: number) => stepSidebarMethods.value[idx] || 'GET'
const currentStepTitle = computed(() => {
  const idx = selectedStepIndex.value
  if (idx == null) return '步骤详情'
  const s = detailStepsOrdered.value[idx]
  if (!s) return '步骤详情'
  const name = String(s.name || '').trim()
  return name || `步骤 ${idx + 1}`
})

const currentStepSourceLabel = computed(() => {
  const step = selectedStep.value as any
  if (!step) return '来源：未选择'
  if (step.source === 'interface_case') return '来源：单接口用例'
  if (step.source === 'debug_case') return '来源：调试用例'
  if (step.source === 'interface') return '来源：接口定义'
  if (step.source === 'curl') return '来源：cURL 导入'
  if (step.source === 'http') return '来源：自定义请求'
  if (step.source === 'wait_step') return '来源：等待时间步骤'
  if (step.source === 'script_step') return '来源：脚本步骤'
  if (step.source === 'group_step') return '来源：分组步骤'
  if (step.source === 'db_step') return '来源：数据库步骤'
  return `来源：${String(step.source || '步骤').replace(/_/g, ' ')}`
})

const stepResponseAssertionPass = computed(() => {
  if (!stepEditorLastResponse.value) return false
  if (stepEditorLastResponse.value.error) return false
  const status = Number(stepEditorLastResponse.value?.status_code ?? 0)
  return stepResponseValidatePass.value && stepResponsePostAssertionPass.value
})

const stepResponseAssertionText = computed(() => {
  if (!stepEditorLastResponse.value) return '尚未执行'
  return stepResponseAssertionPass.value ? '校验通过' : '校验失败'
})

const stepResponseAssertionCount = computed(() =>
  (stepEditorPostOps.value.some((o) => o?.type === VALIDATE_RESPONSE_TYPE) ? 1 : 0) + stepEditorAssertionOps.value.length
)

const stepResponseValidatePass = computed(() => {
  if (!stepEditorLastResponse.value || stepEditorLastResponse.value.error) return false
  const status = Number(stepEditorLastResponse.value?.status_code ?? 0)
  return evaluateValidateResponsePass(status, stepEditorPostOps.value, stepEditorLastResponse.value?.data).pass
})

const stepResponseAssertionResults = computed(() => {
  if (!stepEditorLastResponse.value || stepEditorLastResponse.value.error) return []
  const status = Number(stepEditorLastResponse.value?.status_code ?? 0)
  const headers = normalizeProxyHeaderMap(stepEditorLastResponse.value?.headers)
  return evaluatePostAssertions(status, headers, stepEditorLastResponse.value?.data, stepEditorPostOps.value).results
})

const stepResponsePostAssertionPass = computed(() =>
  stepResponseAssertionResults.value.every((item) => item.passed)
)

const stepAssertionOpPreview = (op: any) => {
  const target = stepAssertionTargetOptions.find((item) => item.value === op?.config?.target)?.label || '响应 JSON'
  const operator = stepAssertionOperatorOptions.find((item) => item.value === op?.config?.operator)?.label || '等于'
  return `${target} ${operator}`
}

const stepResponseExtractItems = computed(() => {
  const configured = buildConfiguredStepExtractItems()
  if (configured.length > 0) return configured
  const data = stepEditorLastResponse.value?.data
  if (!data || typeof data !== 'object' || Array.isArray(data)) return [] as Array<{ key: string; value: string }>
  const out: Array<{ key: string; value: string }> = []
  const pushValue = (key: string, value: unknown) => {
    if (out.length >= 8 || value == null || typeof value === 'object') return
    out.push({ key, value: String(value) })
  }
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) pushValue(k, v)
  const nested = (data as Record<string, unknown>).data
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    for (const [k, v] of Object.entries(nested as Record<string, unknown>)) pushValue(`data.${k}`, v)
  }
  return out
})

const stepResponseExtractCount = computed(() => stepResponseExtractItems.value.length)

const stepOutputTags = computed(() => {
  const tags: string[] = []
  for (const item of stepResponseExtractItems.value) {
    const key = item.key.split('.').pop() || item.key
    if (/token|id|code|msg|message|success/i.test(key)) tags.push(`{{${key}}}`)
  }
  return [...new Set(tags)].slice(0, 6)
})

const stepAuthNote = computed(() => {
  if (stepAuthMode.value === 'bearer') return '将以 Authorization: Bearer <token> 的形式自动注入认证头。'
  if (stepAuthMode.value === 'basic') return '将以用户名和密码拼接 Basic Authorization 头。'
  if (stepAuthMode.value === 'apikey') return '适合将 API Key 放在 Header 或 Query 参数中的接口。'
  return '当前不会注入认证信息，适合公开接口或通过 Cookies 认证的场景。'
})

const inferStepAuthModeFromHeaders = (rows: any[]) => {
  const authRow = (Array.isArray(rows) ? rows : []).find(
    (r) => String(r?.name || '').toLowerCase() === 'authorization'
  )
  if (authRow) {
    const raw = String(authRow.example ?? authRow.value ?? '').toLowerCase()
    if (raw.startsWith('bearer ')) return 'bearer' as const
    if (raw.startsWith('basic ')) return 'basic' as const
  }
  const apiKeyRow = (Array.isArray(rows) ? rows : []).find((r) =>
    /api[-_ ]?key/i.test(String(r?.name || ''))
  )
  return apiKeyRow ? ('apikey' as const) : ('none' as const)
}

const hydrateStepAuthState = (config?: any, rows?: any[]) => {
  const mode = (config?.mode || inferStepAuthModeFromHeaders(rows || [])) as 'none' | 'bearer' | 'basic' | 'apikey'
  stepAuthMode.value = mode
  stepAuthBearer.value = {
    prefix: String(config?.bearer?.prefix || 'Bearer'),
    token: String(config?.bearer?.token || '')
  }
  stepAuthBasic.value = {
    username: String(config?.basic?.username || ''),
    password: String(config?.basic?.password || '')
  }
  stepAuthApiKey.value = {
    position: config?.apikey?.position === 'query' ? 'query' : 'header',
    key: String(config?.apikey?.key || 'X-API-Key'),
    value: String(config?.apikey?.value || '')
  }
}

const currentStepAuthConfig = computed(() => ({
  mode: stepAuthMode.value,
  bearer: { ...stepAuthBearer.value },
  basic: { ...stepAuthBasic.value },
  apikey: { ...stepAuthApiKey.value }
}))

const applyStepAuthToRequest = (headers: Record<string, string>, queryRows: any[], vars: Record<string, string> = {}) => {
  if (stepAuthMode.value === 'bearer' && stepAuthBearer.value.token.trim()) {
    headers.Authorization = `${stepAuthBearer.value.prefix || 'Bearer'} ${resolveStepTemplateText(stepAuthBearer.value.token.trim(), vars)}`
    return
  }
  if (stepAuthMode.value === 'basic' && stepAuthBasic.value.username.trim()) {
    const raw = `${resolveStepTemplateText(stepAuthBasic.value.username, vars)}:${resolveStepTemplateText(stepAuthBasic.value.password || '', vars)}`
    headers.Authorization = `Basic ${btoa(unescape(encodeURIComponent(raw)))}`
    return
  }
  if (stepAuthMode.value === 'apikey' && stepAuthApiKey.value.key.trim() && stepAuthApiKey.value.value.trim()) {
    if (stepAuthApiKey.value.position === 'query') {
      const existing = queryRows.find((row) => String(row?.name || '').trim() === stepAuthApiKey.value.key.trim())
      const value = resolveStepTemplateText(stepAuthApiKey.value.value, vars)
      if (existing) existing.example = value
      else queryRows.push({ name: stepAuthApiKey.value.key.trim(), example: value })
      return
    }
    headers[stepAuthApiKey.value.key.trim()] = resolveStepTemplateText(stepAuthApiKey.value.value, vars)
  }
}

const resolveStepTemplateText = (text: string, vars: Record<string, string>) =>
  String(text || '').replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => vars[key] ?? '')

const runStepPreScript = async (
  script: string,
  context: {
    headers: Record<string, string>
    queryRows: any[]
    vars: Record<string, string>
    setBody: (value: string) => void
    setUrl: (value: string) => void
    setMethod: (value: string) => void
  }
) => {
  if (!script.trim()) return
  const runtime = {
    setHeader: (name: string, value: string) => {
      if (!name) return
      context.headers[String(name)] = String(value)
    },
    setQuery: (name: string, value: string) => {
      if (!name) return
      const row = context.queryRows.find((item) => String(item?.name || '').trim() === String(name).trim())
      if (row) row.example = String(value)
      else context.queryRows.push({ name: String(name), example: String(value) })
    },
    setVar: (name: string, value: string) => {
      if (!name) return
      context.vars[String(name)] = String(value)
    },
    setBody: context.setBody,
    setUrl: context.setUrl,
    setMethod: context.setMethod
  }
  await Promise.resolve(new Function('context', script)(runtime))
}

const resolveStepResponseValue = (source: string, expression: string, response: any) => {
  const exp = String(expression || '').trim()
  if (!exp) return undefined
  if (source === 'header') {
    const headers = response?.headers && typeof response.headers === 'object' ? response.headers : {}
    const entry = Object.entries(headers).find(([k]) => k.toLowerCase() === exp.toLowerCase())
    return entry?.[1]
  }
  const raw = response?.data
  if (raw == null) return undefined
  const data = typeof raw === 'string'
    ? (() => { try { return JSON.parse(raw) } catch { return undefined } })()
    : raw
  if (data == null || typeof data !== 'object') return undefined
  return exp
    .replace(/^\./, '')
    .split('.')
    .filter(Boolean)
    .reduce<any>((acc, key) => (acc != null ? acc[key] : undefined), data)
}

const buildConfiguredStepExtractItems = () => {
  if (!stepEditorLastResponse.value) return [] as Array<{ key: string; value: string }>
  const out: Array<{ key: string; value: string }> = []
  for (const op of stepEditorExtractOps.value) {
    const key = String(op?.config?.name || '').trim()
    if (!key) continue
    const value = resolveStepResponseValue(op?.config?.source || 'body', op?.config?.expression || '', stepEditorLastResponse.value)
    if (value == null || typeof value === 'object') continue
    out.push({ key, value: String(value) })
  }
  return out
}

const copyStepResponseBody = async () => {
  if (!stepEditorLastResponse.value) return
  try {
    const text = stepResponseViewMode.value === 'pretty' ? stepResponseBodyPrettyText.value : stepResponseBodyRawText.value
    await navigator.clipboard.writeText(text)
    message.success('已复制响应内容')
  } catch {
    message.error('复制失败')
  }
}

const focusSelectedStep = () => {
  if (selectedStepIndex.value == null && detailStepCount.value > 0) {
    selectScenarioStep(0)
    return
  }
  if (selectedStepIndex.value != null) {
    stepDetailDrawerOpened.value = true
    stepResponsePanelTab.value = 'body'
    loadScenarioStepEditor()
  }
}

const openStepWizard = () => {
  if (selectedStepIndex.value == null && detailStepCount.value > 0) {
    selectScenarioStep(0)
  }
  stepWizardVisible.value = true
}

const applyStepWizardPreset = async (key: string) => {
  if (selectedStepIndex.value == null) {
    message.warning('请先选择一个步骤')
    return
  }
  if (key === 'login') {
    stepEditorBodyType.value = 'json'
    if (!stepEditorBodyContent.value.trim()) {
      stepEditorBodyContent.value = '{\n  "username": "",\n  "password": ""\n}'
    }
    stepAuthMode.value = 'none'
    stepEditorPostOps.value = [
      defaultValidateResponseOp(),
      {
        id: `assert-${Date.now()}-code`,
        type: 'assertion',
        enabled: true,
        config: { name: '业务码为成功', target: 'response_json', expression: 'code', operator: 'eq', value: '200' }
      },
      {
        id: `extract-${Date.now()}-token`,
        type: 'extract',
        enabled: true,
        config: { name: 'token', source: 'body', expression: 'data.token' }
      },
      {
        id: `extract-${Date.now()}-uid`,
        type: 'extract',
        enabled: true,
        config: { name: 'userId', source: 'body', expression: 'data.userId' }
      }
    ]
  } else if (key === 'authorized-json') {
    stepEditorBodyType.value = stepEditorMethod.value === 'GET' ? 'none' : 'json'
    if (!stepEditorHeaderParams.value.some((row) => String(row?.name || '').toLowerCase() === 'content-type')) {
      stepEditorHeaderParams.value = [...stepEditorHeaderParams.value, { name: 'Content-Type', example: 'application/json' }]
    }
    stepAuthMode.value = 'bearer'
    if (!stepAuthBearer.value.token) stepAuthBearer.value.token = '{{token}}'
    if (!stepEditorPreOps.value.some((op) => op?.type === 'set_header' && String(op?.config?.name || '').toLowerCase() === 'x-trace-id')) {
      stepEditorPreOps.value = [...stepEditorPreOps.value, { id: `pre-${Date.now()}-trace`, type: 'set_header', enabled: true, config: { name: 'X-Trace-Id', value: `trace-${Date.now()}` } }]
    }
    if (!stepEditorPostOps.value.some((op) => op?.type === 'assertion')) {
      stepEditorPostOps.value = [
        ...stepEditorPostOps.value,
        { id: `assert-${Date.now()}-success`, type: 'assertion', enabled: true, config: { name: '响应包含 success', target: 'response_text', expression: '', operator: 'contains', value: 'success' } }
      ]
    }
  } else if (key === 'query-debug') {
    stepEditorMethod.value = 'GET'
    stepEditorPreOps.value = [
      ...stepEditorPreOps.value,
      { id: `pre-${Date.now()}-wait`, type: 'wait', enabled: true, config: { duration: '200', note: '等待链路稳定' } }
    ]
    stepEditorPostOps.value = [
      defaultValidateResponseOp(),
      {
        id: `assert-${Date.now()}-status`,
        type: 'assertion',
        enabled: true,
        config: { name: '状态码为 200', target: 'status', expression: '', operator: 'eq', value: '200' }
      }
    ]
  }
  await persistStepPreOperations()
  await persistStepPostOperations()
  if (isCurrentStepCustom.value) await saveHttpStepConfig()
  stepWizardVisible.value = false
  message.success('已应用步骤向导配置')
}

const insertStepDynamicValue = () => {
  const tag = stepOutputTags.value[0] || '{{token}}'
  stepEditorBodyContent.value = `${stepEditorBodyContent.value}${stepEditorBodyContent.value ? '\n' : ''}${tag}`
  message.success('已插入动态变量占位符')
}

const buildCurrentStepCurlText = () => {
  const method = String(stepEditorMethod.value || 'GET').toUpperCase()
  const queryRows = cloneParamRows(stepEditorQueryParams.value)
  const headers = buildProxyHeaders()
  applyStepAuthToRequest(headers, queryRows, stepVars)
  const url = buildUrlWithQueryString(stepEditorFullUrl.value.trim(), queryRows)
  const lines = [`curl -X ${method} '${url}'`]
  Object.entries(headers).forEach(([k, v]) => {
    lines.push(`  -H '${k}: ${String(v).replace(/'/g, `'\"'\"'`)}'`)
  })
  if (stepEditorBodyType.value === 'json' && stepEditorBodyContent.value.trim()) {
    lines.push(`  -d '${stepEditorBodyContent.value.replace(/'/g, `'\"'\"'`)}'`)
  } else if (stepEditorBodyType.value === 'text' && stepEditorBodyContent.value.trim()) {
    lines.push(`  --data-raw '${stepEditorBodyContent.value.replace(/'/g, `'\"'\"'`)}'`)
  }
  return lines.join(' \\\n')
}

const handleStepSendActionSelect = async (key: string) => {
  if (key === 'save-and-send') {
    if (isCurrentStepCustom.value) await saveHttpStepConfig()
    await sendScenarioStepRequest()
    return
  }
  if (key === 'copy-curl') {
    try {
      await navigator.clipboard.writeText(buildCurrentStepCurlText())
      message.success('已复制当前步骤 cURL')
    } catch {
      message.error('复制 cURL 失败')
    }
    return
  }
  if (key === 'clear-response') {
    stepEditorLastResponse.value = null
  }
}

const syncSelectedScenarioStep = async () => {
  const idx = selectedStepIndex.value
  const scenario = detailScenario.value
  if (idx == null || !scenario?.id) {
    message.warning('请先选择一个步骤')
    return
  }
  const steps = [...(detailStepsOrdered.value as any[])]
  const step = steps[idx]
  if (!step) return
  if (step.source === 'http' || step.source === 'curl') {
    await saveHttpStepConfig()
    message.success('当前自定义步骤配置已同步保存')
    return
  }
  try {
    if (step.case_id) {
      const tcRaw: any = await execRequest.get(`/test-cases/${step.case_id}`)
      const tc = unwrapEntity(tcRaw) ?? tcRaw
      if (tc?.name) step.name = tc.name
      if (Array.isArray(tc?.pre_operations)) step.pre_operations = cloneParamRows(tc.pre_operations)
      if (Array.isArray(tc?.post_operations)) step.post_operations = cloneParamRows(tc.post_operations)
    }
    if (step.interface_id) {
      const ifaceRaw: any = await execRequest.get(`/interfaces/${step.interface_id}`)
      const iface = unwrapEntity(ifaceRaw) ?? ifaceRaw
      if (iface?.name && !step.case_id) step.name = iface.name
      if (iface?.method) step.method = String(iface.method).toUpperCase()
    }
    await execRequest.patch(`/test-scenarios/${scenario.id}`, { steps })
    await fetchScenarios()
    await nextTick()
    selectScenarioStep(idx)
    message.success('步骤已同步最新配置')
  } catch (err) {
    console.error(err)
    message.error('同步步骤失败')
  }
}

const executeUtilityScenarioStep = async (step: any) => {
  const source = String(step?.source || '')
  const name = String(step?.name || '未命名步骤')
  const cfg = step?.utility_config || {}
  const startedAt = Date.now()
  if (source === 'wait_step') {
    const duration = Math.max(0, Number(cfg.duration || 0))
    if (duration > 0) await new Promise((resolve) => window.setTimeout(resolve, duration))
    return {
      pass: true,
      name,
      method: 'STEP',
      url: `wait://${duration}`,
      statusCode: 200,
      elapsedMs: Date.now() - startedAt,
      responseBodyText: cfg.note ? String(cfg.note) : `等待 ${duration} ms 完成`,
      responseSizeBytes: 0,
      responseHeaders: {},
      requestHeaders: {},
      requestBodySnippet: ''
    }
  }
  if (source === 'group_step') {
    return {
      pass: true,
      name,
      method: 'GROUP',
      url: 'group://marker',
      statusCode: 200,
      elapsedMs: 0,
      responseBodyText: String(cfg.note || cfg.group_name || '分组标记'),
      responseSizeBytes: 0,
      responseHeaders: {},
      requestHeaders: {},
      requestBodySnippet: ''
    }
  }
  if (source === 'script_step') {
    const vars: Record<string, string> = {}
    try {
      await runStepPreScript(String(cfg.script || ''), {
        headers: {},
        queryRows: [],
        vars,
        setBody: () => {},
        setUrl: () => {},
        setMethod: () => {}
      })
      return {
        pass: true,
        name,
        method: 'SCRIPT',
        url: 'script://local',
        statusCode: 200,
        elapsedMs: Date.now() - startedAt,
        responseBodyText: JSON.stringify(vars, null, 2) || '脚本执行完成',
        responseSizeBytes: 0,
        responseHeaders: {},
        requestHeaders: {},
        requestBodySnippet: String(cfg.script || '')
      }
    } catch (err: any) {
      return {
        pass: false,
        name,
        method: 'SCRIPT',
        url: 'script://local',
        statusCode: 500,
        elapsedMs: Date.now() - startedAt,
        error: String(err?.message || err),
        requestHeaders: {},
        requestBodySnippet: String(cfg.script || '')
      }
    }
  }
  return {
    pass: false,
    name,
    method: 'DB',
    url: 'db://pending',
    statusCode: 501,
    elapsedMs: 0,
    error: '数据库步骤编辑已开放，执行引擎暂未接入'
  }
}

const runScenarioSteps = async (mode: 'all' | 'current' | 'failed') => {
  const scenario = detailScenario.value
  if (!scenario?.id) return
  const envId = detailEnvId.value ?? scenario.env_id ?? null
  let steps = [...detailStepsOrdered.value]
  if (mode === 'current') {
    if (selectedStepIndex.value == null) {
      message.warning('请先选择当前步骤')
      return
    }
    steps = steps.slice(selectedStepIndex.value)
  } else if (mode === 'failed') {
    const failedNames = new Set(currentScenarioSendLogs.value.filter((log) => !log.pass).map((log) => log.name))
    steps = steps.filter((step: any) => failedNames.has(String(step?.name || '').trim()))
    if (!steps.length) {
      message.info('当前没有失败步骤')
      return
    }
  }
  if (!steps.length) {
    message.warning('当前没有可执行步骤')
    return
  }

  stepScenarioRunning.value = true
  stopStepScenarioRunFlag.value = false
  let pass = 0
  let fail = 0
  try {
    for (const step of steps) {
      if (stopStepScenarioRunFlag.value) break
      const idx = detailStepsOrdered.value.findIndex((item: any) => item.order === step.order && item.name === step.name)
      if (idx >= 0) {
        selectedStepIndex.value = idx
        await loadScenarioStepEditor()
      }
      if (utilityStepKinds.includes(String(step?.source || '') as any)) {
        const entry = await executeUtilityScenarioStep(step)
        if (entry.pass) pass++
        else fail++
        appendScenarioSendLog({
          pass: entry.pass,
          name: entry.name,
          method: entry.method,
          url: entry.url,
          statusCode: entry.statusCode ?? null,
          elapsedMs: entry.elapsedMs ?? null,
          error: entry.error,
          responseBodyText: entry.responseBodyText,
          responseSizeBytes: entry.responseSizeBytes,
          responseHeaders: entry.responseHeaders,
          requestHeaders: entry.requestHeaders,
          requestBodySnippet: entry.requestBodySnippet
        })
        stepEditorLastResponse.value = entry.error
          ? { error: entry.error, status_code: entry.statusCode }
          : {
              status_code: entry.statusCode,
              headers: entry.responseHeaders || {},
              data: entry.responseBodyText || '',
              elapsed: entry.elapsedMs
            }
        continue
      }
      const ctx = await loadStepExecContext(step, envId)
      if (!ctx) {
        fail++
        appendScenarioSendLog({
          pass: false,
          name: String(step?.name || '未命名步骤'),
          method: '—',
          url: '—',
          statusCode: null,
          elapsedMs: null,
          error: '步骤未绑定用例或接口，无法执行'
        })
        continue
      }
      const entry = await runStepExecContext(ctx)
      if (entry.pass) pass++
      else fail++
      appendScenarioSendLog({
        pass: entry.pass,
        name: entry.name,
        method: entry.method,
        url: entry.url,
        statusCode: entry.statusCode,
        elapsedMs: entry.elapsedMs,
        error: entry.error,
        responseBodyText: entry.responseBodyText,
        responseSizeBytes: entry.responseSizeBytes,
        responseHeaders: entry.responseHeaders,
        requestHeaders: entry.requestHeaders,
        requestBodySnippet: entry.requestBodySnippet,
        expectedStatusCode: entry.expectedStatusCode,
        validateResponseEnabled: entry.validateResponseEnabled,
        jsonBusinessCode: entry.jsonBusinessCode,
        jsonBusinessOk: entry.jsonBusinessOk
      })
      stepEditorLastResponse.value = entry.error
        ? { error: entry.error, status_code: entry.statusCode }
        : {
            status_code: entry.statusCode,
            headers: entry.responseHeaders || {},
            data: entry.responseBodyText || '',
            elapsed: entry.elapsedMs
          }
    }
    if (stopStepScenarioRunFlag.value) {
      message.warning('步骤执行已停止')
    } else {
      message.success(`步骤执行完成：通过 ${pass}，失败 ${fail}`)
    }
  } catch (err) {
    console.error(err)
    message.error('步骤执行异常中断')
  } finally {
    stepScenarioRunning.value = false
    stopStepScenarioRunFlag.value = false
  }
}

const stopScenarioStepRun = () => {
  stopStepScenarioRunFlag.value = true
}

const selectScenarioStep = (idx: number) => {
  selectedStepIndex.value = idx
  stepDetailDrawerOpened.value = true
  stepResponsePanelTab.value = 'body'
  loadScenarioStepEditor()
}

const toggleStepBulkCheck = (idx: number, checked: boolean) => {
  const s = new Set(stepBulkCheckedIndices.value)
  if (checked) s.add(idx)
  else s.delete(idx)
  stepBulkCheckedIndices.value = [...s].sort((a, b) => a - b)
}

const rebuildStepEditorUrl = async () => {
  let base = ''
  if (detailEnvId.value) {
    try {
      const envRaw: any = await execRequest.get(`/environments/${detailEnvId.value}`)
      const env = unwrapEntity(envRaw) || envRaw
      base = String(env?.base_url || '').replace(/\/$/, '')
    } catch {
      /* 忽略 */
    }
  }
  const path = stepEditorPath.value || ''
  const p = path.startsWith('/') ? path : path ? `/${path}` : ''
  stepEditorFullUrl.value = base ? `${base}${p}` : p || ''
}

const loadScenarioStepEditor = async () => {
  const idx = selectedStepIndex.value
  if (idx == null) return
  const step = detailStepsOrdered.value[idx]
  if (!step) return
  stepReqSettings.value = normalizeStepReqSettings(step.req_settings)
  stepEditorLastResponse.value = null
  stepEditorCaseId.value = step.case_id ?? null
  stepEditorInterfaceId.value = step.interface_id ?? null

  // ── source=http / curl：从步骤对象本身直接读取请求信息 ──
  if (step.source === 'http' || step.source === 'curl') {
    const m = String(step.method || 'GET').toUpperCase()
    stepEditorMethod.value = m
    stepEditorPath.value = ''
    stepEditorFullUrl.value = step.custom_url || step.url || ''
    stepEditorQueryParams.value = cloneParamRows(step.query_params || [])
    stepEditorHeaderParams.value = cloneParamRows(step.header_params || [])
    stepEditorPreOps.value = cloneParamRows(step.pre_operations || [])
    hydrateStepAuthState(step.auth_config, stepEditorHeaderParams.value)
    stepEditorBodyType.value = step.body_type || 'none'
    stepEditorBodyContent.value = step.body_content || ''
    stepEditorPostOps.value = mergePostOpsWithValidateResponse(cloneParamRows(step.post_operations || []))
    stepSidebarMethods.value = { ...stepSidebarMethods.value, [idx]: m }
    return
  }

  if (utilityStepKinds.includes(String(step.source || '') as any)) {
    stepEditorMethod.value = 'GET'
    stepEditorPath.value = ''
    stepEditorFullUrl.value = ''
    stepEditorQueryParams.value = []
    stepEditorHeaderParams.value = []
    stepEditorPreOps.value = cloneParamRows(step.pre_operations || [])
    stepEditorPostOps.value = mergePostOpsWithValidateResponse(cloneParamRows(step.post_operations || []))
    hydrateStepAuthState(step.auth_config, [])
    stepEditorBodyType.value = 'none'
    stepEditorBodyContent.value = ''
    stepUtilityConfig.value = { ...(step.utility_config || {}) }
    stepSidebarMethods.value = { ...stepSidebarMethods.value, [idx]: 'STEP' }
    return
  }

  // ── source=interface：只有 interface_id，无 case_id，从接口定义加载 ──
  if (step.source === 'interface' && step.interface_id) {
    stepEditorLoading.value = true
    try {
      const ifaceRaw: any = await execRequest.get(`/interfaces/${step.interface_id}`)
      const iface = unwrapEntity(ifaceRaw) ?? ifaceRaw
      if (!iface?.id) { message.error('无法加载接口定义'); return }
      const m = String(iface.method ?? 'GET').toUpperCase()
      stepEditorMethod.value = m
      stepEditorPath.value = iface.path || ''
      stepSidebarMethods.value = { ...stepSidebarMethods.value, [idx]: m }
      stepEditorQueryParams.value = cloneParamRows(iface.query_params)
      stepEditorHeaderParams.value = cloneParamRows(iface.header_params)
      stepEditorPreOps.value = cloneParamRows(step.pre_operations || [])
      hydrateStepAuthState(step.auth_config, stepEditorHeaderParams.value)
      const bd = iface.body_definition || { type: 'none', content: '' }
      stepEditorBodyType.value = bd.type || 'none'
      const c = bd.content
      stepEditorBodyContent.value = typeof c === 'string' ? c : c != null ? JSON.stringify(c, null, 2) : ''
      stepEditorPostOps.value = mergePostOpsWithValidateResponse(cloneParamRows(step.post_operations || []))
      await rebuildStepEditorUrl()
    } catch {
      message.error('加载接口定义失败')
    } finally {
      stepEditorLoading.value = false
    }
    return
  }

  // ── 无 case_id 或 interface_id：空白步骤 ──
  if (!step.case_id || !step.interface_id) {
    stepEditorMethod.value = 'GET'
    stepEditorPath.value = ''
    stepEditorQueryParams.value = []
    stepEditorHeaderParams.value = []
    stepEditorPreOps.value = cloneParamRows(step.pre_operations || [])
    hydrateStepAuthState(step.auth_config, [])
    stepEditorBodyType.value = 'none'
    stepEditorBodyContent.value = ''
    stepEditorPostOps.value = mergePostOpsWithValidateResponse(cloneParamRows(step.post_operations || []))
    stepEditorFullUrl.value = ''
    stepSidebarMethods.value = { ...stepSidebarMethods.value, [idx]: 'GET' }
    return
  }
  stepEditorLoading.value = true
  try {
    const [tcRaw, ifaceRaw] = await Promise.all([
      execRequest.get(`/test-cases/${step.case_id}`),
      execRequest.get(`/interfaces/${step.interface_id}`)
    ])
    const tc = unwrapEntity(tcRaw) ?? tcRaw
    const iface = unwrapEntity(ifaceRaw) ?? ifaceRaw
    if (!iface?.id) {
      message.error('无法加载接口定义')
      return
    }
    const m = String(iface.method ?? 'GET').toUpperCase()
    stepEditorMethod.value = m
    stepEditorPath.value = iface.path || ''
    stepSidebarMethods.value = { ...stepSidebarMethods.value, [idx]: m }
    const qpTc = cloneParamRows(tc?.query_params)
    const qpIface = cloneParamRows(iface.query_params)
    stepEditorQueryParams.value = qpTc.length ? qpTc : qpIface
    const hpTc = cloneParamRows(tc?.header_params)
    const hpIface = cloneParamRows(iface.header_params)
    stepEditorHeaderParams.value = hpTc.length ? hpTc : hpIface
    stepEditorPreOps.value = Array.isArray(tc?.pre_operations)
      ? cloneParamRows(tc.pre_operations)
      : cloneParamRows(step.pre_operations || [])
    hydrateStepAuthState(step.auth_config, stepEditorHeaderParams.value)
    const bd = tc?.body_definition || iface.body_definition || { type: 'none', content: '' }
    stepEditorBodyType.value = bd.type || 'none'
    const c = bd.content
    stepEditorBodyContent.value =
      typeof c === 'string' ? c : c != null ? JSON.stringify(c, null, 2) : ''
    const rawPost = Array.isArray(tc?.post_operations) ? cloneParamRows(tc.post_operations) : []
    const mergedPost = mergePostOpsWithValidateResponse(rawPost)
    stepEditorPostOps.value = mergedPost
    const hadValidate = rawPost.some((o: any) => o?.type === VALIDATE_RESPONSE_TYPE)
    if (!hadValidate && step.case_id) {
      void persistStepPostOperations().catch(() => {})
    }
    await rebuildStepEditorUrl()
  } catch (e) {
    console.error(e)
    message.error('加载步骤详情失败')
  } finally {
    stepEditorLoading.value = false
  }
}

const removeCheckedScenarioSteps = async () => {
  const scenario = detailScenario.value
  if (!scenario?.id || stepBulkSelectedCount.value === 0) return
  const del = new Set(stepBulkCheckedIndices.value)
  const ordered = detailStepsOrdered.value.filter((_, idx) => !del.has(idx))
  const newSteps = ordered.map((st: any, i: number) => ({ ...st, order: i + 1 }))
  try {
    await execRequest.patch(`/test-scenarios/${scenario.id}`, { steps: newSteps })
    message.success('已移除所选步骤')
    stepBulkCheckedIndices.value = []
    await fetchScenarios()
  } catch {
    message.error('移除失败')
  }
}

// ── 步骤拖拽排序 ──
const dragStepFromIndex = ref<number | null>(null)
const dragStepOverIndex = ref<number | null>(null)

const handleStepDragStart = (idx: number) => {
  dragStepFromIndex.value = idx
}

const handleStepDragOver = (_evt: DragEvent, idx: number) => {
  dragStepOverIndex.value = idx
}

const handleStepDragLeave = (evt: DragEvent) => {
  const related = evt.relatedTarget as HTMLElement | null
  if (!related || !related.closest?.('.step-list-item')) {
    dragStepOverIndex.value = null
  }
}

const handleStepDrop = async (toIdx: number) => {
  const fromIdx = dragStepFromIndex.value
  dragStepFromIndex.value = null
  dragStepOverIndex.value = null
  if (fromIdx === null || fromIdx === toIdx) return
  const scenario = detailScenario.value
  if (!scenario?.id) return
  const steps = [...(detailStepsOrdered.value as any[])]
  const [moved] = steps.splice(fromIdx, 1)
  steps.splice(toIdx, 0, moved)
  const newSteps = steps.map((s: any, i: number) => ({ ...s, order: i + 1 }))
  // 修正已选步骤 index
  if (selectedStepIndex.value === fromIdx) {
    selectedStepIndex.value = toIdx
  } else if (fromIdx < toIdx) {
    if (selectedStepIndex.value! > fromIdx && selectedStepIndex.value! <= toIdx) {
      selectedStepIndex.value = selectedStepIndex.value! - 1
    }
  } else {
    if (selectedStepIndex.value! < fromIdx && selectedStepIndex.value! >= toIdx) {
      selectedStepIndex.value = selectedStepIndex.value! + 1
    }
  }
  try {
    await execRequest.patch(`/test-scenarios/${scenario.id}`, { steps: newSteps })
    await fetchScenarios()
    message.success('顺序已调整')
  } catch {
    message.error('调整顺序失败')
    await fetchScenarios()
  }
}

const handleStepDragEnd = () => {
  dragStepFromIndex.value = null
  dragStepOverIndex.value = null
}

// ── 保存 source=http/curl 步骤的请求配置 ──
const httpStepSaving = ref(false)

const saveHttpStepConfig = async () => {
  const idx = selectedStepIndex.value
  if (idx == null) return
  const scenario = detailScenario.value
  if (!scenario?.id) return
  const steps = [...(detailStepsOrdered.value as any[])]
  const step = steps[idx]
  if (!step || (step.source !== 'http' && step.source !== 'curl')) return
  steps[idx] = {
    ...step,
    method: stepEditorMethod.value,
    custom_url: stepEditorFullUrl.value,
    query_params: stepEditorQueryParams.value,
    header_params: stepEditorHeaderParams.value,
    pre_operations: stepEditorPreOps.value,
    post_operations: stepEditorPostOps.value,
    auth_config: currentStepAuthConfig.value,
    body_type: stepEditorBodyType.value,
    body_content: stepEditorBodyContent.value,
    req_settings: { ...stepReqSettings.value }
  }
  httpStepSaving.value = true
  try {
    await execRequest.patch(`/test-scenarios/${scenario.id}`, { steps })
    message.success('请求配置已保存')
    await fetchScenarios()
  } catch {
    message.error('保存失败')
  } finally {
    httpStepSaving.value = false
  }
}

const saveUtilityStepConfig = async () => {
  const idx = selectedStepIndex.value
  const scenario = detailScenario.value
  if (idx == null || !scenario?.id) return
  const steps = [...(detailStepsOrdered.value as any[])]
  const step = steps[idx]
  if (!step || !utilityStepKinds.includes(String(step.source || '') as any)) return
  steps[idx] = {
    ...step,
    utility_config: { ...stepUtilityConfig.value },
    name:
      step.source === 'group_step'
        ? String(stepUtilityConfig.value.group_name || step.name || '步骤分组')
        : step.name
  }
  httpStepSaving.value = true
  try {
    await execRequest.patch(`/test-scenarios/${scenario.id}`, { steps })
    await fetchScenarios()
    message.success('步骤配置已保存')
  } catch {
    message.error('保存失败')
  } finally {
    httpStepSaving.value = false
  }
}

const isCurrentStepCustom = computed(() => {
  const idx = selectedStepIndex.value
  if (idx == null) return false
  const step = detailStepsOrdered.value[idx]
  return step?.source === 'http' || step?.source === 'curl'
})

const onCustomStepMethodChange = (v: string) => {
  stepEditorMethod.value = v
  if (selectedStepIndex.value != null) {
    stepSidebarMethods.value = { ...stepSidebarMethods.value, [selectedStepIndex.value]: v }
  }
}

// ── 直接添加空 HTTP 请求步骤 ──
const addHttpStep = async () => {
  const scenario = detailScenario.value
  if (!scenario?.id) { message.warning('请先打开场景'); return }
  const steps = [...(detailStepsOrdered.value as any[])]
  const maxOrder = steps.reduce((m: number, s: any) => Math.max(m, s.order ?? 0), 0)
  const newStep = {
    order: maxOrder + 1,
    name: '新建 HTTP 请求',
    source: 'http',
    method: 'GET',
    custom_url: '',
    query_params: [],
    header_params: [],
    pre_operations: [],
    post_operations: [],
    auth_config: { mode: 'none' },
    body_type: 'none',
    body_content: '',
    case_id: null,
    interface_id: null
  }
  steps.push(newStep)
  try {
    await execRequest.patch(`/test-scenarios/${scenario.id}`, { steps })
    await fetchScenarios()
    await nextTick()
    selectScenarioStep(steps.length - 1)
    message.success('已添加 HTTP 请求步骤，请在右侧填写请求信息')
  } catch {
    message.error('添加失败')
  }
}

const addUtilityStep = async (type: 'wait_step' | 'script_step' | 'group_step' | 'db_step') => {
  const scenario = detailScenario.value
  if (!scenario?.id) { message.warning('请先打开场景'); return }
  const steps = [...(detailStepsOrdered.value as any[])]
  const maxOrder = steps.reduce((m: number, s: any) => Math.max(m, s.order ?? 0), 0)
  steps.push({
    order: maxOrder + 1,
    ...createUtilityStep(type)
  })
  try {
    await execRequest.patch(`/test-scenarios/${scenario.id}`, { steps })
    await fetchScenarios()
    await nextTick()
    selectScenarioStep(steps.length - 1)
    message.success('已添加步骤')
  } catch {
    message.error('添加失败')
  }
}

// ── 从接口导入步骤 (import-api) ──
const showImportApiModal = ref(false)
const importApiSelectedMap = ref<Record<number, { id: number; name: string; method: string; path: string }>>({})
const importApiSaving = ref(false)

const importApiSelectedList = computed(() =>
  Object.values(importApiSelectedMap.value)
)

const openImportApiModal = () => {
  importApiSelectedMap.value = {}
  importTreePattern.value = ''
  showImportApiModal.value = true
  loadImportModalTreeData()
}

const onImportApiModalLeave = () => {
  importModalTreeData.value = []
  importInterfacesIndex.value = new Map()
  importApiSelectedMap.value = {}
  importTreePattern.value = ''
}

const onImportApiTreeSelect = (keys: Array<string | number>) => {
  const key = String(keys[0] ?? '')
  if (!key.startsWith('api-')) return
  const id = Number(key.slice(4))
  if (Number.isNaN(id)) return
  const iface = importInterfacesIndex.value.get(id)
  if (!iface) return
  const next = { ...importApiSelectedMap.value }
  if (next[id]) {
    delete next[id]
    message.info(`已取消选中「${iface.name}」`)
  } else {
    next[id] = iface
    message.success(`已选中「${iface.name}」`)
  }
  importApiSelectedMap.value = next
}

const removeImportApiSelected = (id: number) => {
  const next = { ...importApiSelectedMap.value }
  delete next[id]
  importApiSelectedMap.value = next
}

const confirmImportApi = async () => {
  const scenario = detailScenario.value
  if (!scenario?.id) { message.warning('请先打开场景'); return }
  const selected = importApiSelectedList.value
  if (!selected.length) return
  const steps = [...(Array.isArray(scenario.steps) ? scenario.steps : [])]
  const existingIfaceIds = new Set(steps.map((s: any) => s.interface_id).filter(Boolean))
  let maxOrder = steps.reduce((m: number, s: any) => Math.max(m, s.order ?? 0), 0)
  let added = 0
  for (const api of selected) {
    if (existingIfaceIds.has(api.id)) continue
    maxOrder += 1
    steps.push({
      order: maxOrder,
      interface_id: api.id,
      case_id: null,
      name: api.name,
      source: 'interface',
      method: api.method
    })
    existingIfaceIds.add(api.id)
    added++
  }
  if (!added) { message.warning('所选接口已在当前场景中，未添加新步骤'); return }
  importApiSaving.value = true
  try {
    await execRequest.patch(`/test-scenarios/${scenario.id}`, { steps })
    message.success(`已导入 ${added} 个接口步骤`)
    showImportApiModal.value = false
    await fetchScenarios()
  } catch {
    message.error('保存步骤失败')
  } finally {
    importApiSaving.value = false
  }
}

// ── 从 cURL 导入步骤 ──
const showCurlModal = ref(false)
const curlInput = ref('')
const curlStepName = ref('')
const curlInputPlaceholder = `粘贴 cURL 命令，例如：\ncurl -X POST 'https://api.example.com/users' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"name":"test"}'`
const curlParsed = ref<{ method: string; url: string; headers: Record<string, string>; body: string } | null>(null)
const curlSaving = ref(false)

const parseCurlCommand = () => {
  const raw = curlInput.value
  if (!raw.trim()) return
  const str = raw.trim().replace(/\\\n/g, ' ').replace(/\s+/g, ' ')
  // 提取 URL
  let url = ''
  const urlM = str.match(/(?:^|\s)['"]?(https?:\/\/[^'">\s]+)['"]?/i)
  if (urlM) url = urlM[1].replace(/['"]/g, '')
  // 提取 Method
  let method = 'GET'
  const mM = str.match(/-X\s+['"]?(\w+)['"]?/)
  if (mM) method = mM[1].toUpperCase()
  else if (/(?:--data(?:-raw|-binary|-urlencode)?|-d)\s/.test(str)) method = 'POST'
  // 提取 Headers
  const headers: Record<string, string> = {}
  const hRegex = /-H\s+['"]([^'"]+)['"]/g
  let hM: RegExpExecArray | null
  while ((hM = hRegex.exec(str)) !== null) {
    const sep = hM[1].indexOf(':')
    if (sep < 0) continue
    const k = hM[1].slice(0, sep).trim()
    const v = hM[1].slice(sep + 1).trim()
    headers[k] = v
  }
  // 提取 Body
  let body = ''
  const bM = str.match(/(?:--data(?:-raw|-binary|-urlencode)?|-d)\s+['"]([^'"]*)['"]/i)
  if (bM) body = bM[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
  curlParsed.value = { method, url, headers, body }
  curlStepName.value = url ? `${method} ${new URL(url).pathname}` : '从 cURL 导入'
}

const confirmImportCurl = async () => {
  if (!curlParsed.value) return
  const scenario = detailScenario.value
  if (!scenario?.id) { message.warning('请先打开场景'); return }
  const { method, url, headers, body } = curlParsed.value
  const steps = [...(Array.isArray(scenario.steps) ? scenario.steps : [])] as any[]
  const maxOrder = steps.reduce((m: number, s: any) => Math.max(m, s.order ?? 0), 0)
  let bodyType = 'none'
  let bodyContent = ''
  if (body) {
    const ct = headers['Content-Type'] || headers['content-type'] || ''
    if (ct.includes('json') || (body.trim().startsWith('{') || body.trim().startsWith('['))) {
      bodyType = 'json'
    } else if (ct.includes('form-urlencoded')) {
      bodyType = 'x-www-form-urlencoded'
    } else {
      bodyType = 'text'
    }
    bodyContent = body
  }
  const headerParams = Object.entries(headers).map(([name, example]) => ({ name, example }))
  steps.push({
    order: maxOrder + 1,
    name: curlStepName.value.trim() || 'cURL 导入步骤',
    source: 'curl',
    method,
    custom_url: url,
    query_params: [],
    header_params: headerParams,
    body_type: bodyType,
    body_content: bodyContent,
    case_id: null,
    interface_id: null
  })
  curlSaving.value = true
  try {
    await execRequest.patch(`/test-scenarios/${scenario.id}`, { steps })
    message.success('已从 cURL 导入步骤')
    showCurlModal.value = false
    curlParsed.value = null
    curlInput.value = ''
    await fetchScenarios()
    await nextTick()
    selectScenarioStep(steps.length - 1)
  } catch {
    message.error('导入失败')
  } finally {
    curlSaving.value = false
  }
}

const formatStepEditorJson = () => {
  if (stepEditorBodyType.value !== 'json') return
  try {
    const o = JSON.parse(stepEditorBodyContent.value || '{}')
    stepEditorBodyContent.value = JSON.stringify(o, null, 2)
    message.success('已格式化')
  } catch {
    message.error('JSON 格式无效')
  }
}

const buildProxyHeaders = (): Record<string, string> => {
  const h: Record<string, string> = {}
  for (const row of stepEditorHeaderParams.value) {
    const k = String(row.name || '').trim()
    if (!k) continue
    h[k] = String(row.example ?? row.value ?? '')
  }
  if (stepReqSettings.value.autoContentType && stepEditorBodyType.value === 'json') {
    if (!h['Content-Type'] && !h['content-type']) h['Content-Type'] = 'application/json'
  }
  return h
}

const currentStepNameForReport = () => {
  const idx = selectedStepIndex.value
  const step = idx != null ? detailStepsOrdered.value[idx] : null
  const n = String(step?.name || '').trim()
  return n || '未命名步骤'
}

const sendScenarioStepRequest = async () => {
  if (isUtilityStep.value && selectedStep.value) {
    const scenarioStep = {
      ...selectedStep.value,
      utility_config: { ...stepUtilityConfig.value }
    }
    const result = await executeUtilityScenarioStep(scenarioStep)
    stepEditorLastResponse.value = result.error
      ? { error: result.error, status_code: result.statusCode }
      : {
          status_code: result.statusCode,
          headers: result.responseHeaders || {},
          data: result.responseBodyText || '',
          elapsed: result.elapsedMs
        }
    appendScenarioSendLog({
      pass: result.pass,
      name: result.name,
      method: result.method,
      url: result.url,
      statusCode: result.statusCode ?? null,
      elapsedMs: result.elapsedMs ?? null,
      error: result.error,
      responseBodyText: result.responseBodyText,
      responseSizeBytes: result.responseSizeBytes,
      responseHeaders: result.responseHeaders,
      requestHeaders: result.requestHeaders,
      requestBodySnippet: result.requestBodySnippet
    })
    if (result.pass) message.success('步骤执行完成')
    else message.error(result.error || '步骤执行失败')
    return
  }
  let runtimeUrl = stepEditorFullUrl.value.trim()
  let runtimeMethod = String(stepEditorMethod.value || 'GET').toUpperCase()
  let runtimeBodyText = stepEditorBodyContent.value
  if (!runtimeUrl) {
    message.warning('请填写请求 URL')
    return
  }
  const stepVars: Record<string, string> = {}
  const upperMethodSeed = String(stepEditorMethod.value || 'GET').toUpperCase()
  const queryRows = cloneParamRows(stepEditorQueryParams.value)
  const headers: Record<string, string> = { ...buildProxyHeaders() }
  for (const op of stepEditorPreOps.value) {
    if (op?.enabled === false) continue
    if (op?.type === 'wait') {
      const waitMs = Math.max(0, Number(op?.config?.duration || 0))
      if (waitMs > 0) await new Promise((resolve) => window.setTimeout(resolve, waitMs))
      continue
    }
    if (op?.type === 'set_var') {
      const key = String(op?.config?.name || '').trim()
      if (!key) continue
      stepVars[key] = String(op?.config?.value || '')
      continue
    }
    if (op?.type === 'script') {
      try {
        await runStepPreScript(String(op?.config?.script || ''), {
          headers,
          queryRows,
          vars: stepVars,
          setBody: (value) => { runtimeBodyText = String(value) },
          setUrl: (value) => { runtimeUrl = String(value) },
          setMethod: (value) => { runtimeMethod = String(value || 'GET').toUpperCase() }
        })
      } catch (err: any) {
        message.error(`前置脚本执行失败：${err?.message || err}`)
        return
      }
      continue
    }
    if (op?.type === 'set_query') {
      const key = String(op?.config?.name || '').trim()
      if (!key) continue
      const existing = queryRows.find((row) => String(row?.name || '').trim() === key)
      const value = resolveStepTemplateText(String(op?.config?.value || ''), stepVars)
      if (existing) existing.example = value
      else queryRows.push({ name: key, example: value })
      continue
    }
  }
  Object.keys(headers).forEach((key) => {
    headers[key] = resolveStepTemplateText(headers[key], stepVars)
  })
  let rawUrl = resolveStepTemplateText(runtimeUrl, stepVars)
  if (!rawUrl) {
    message.warning('请填写请求 URL')
    return
  }
  const upper = runtimeMethod || upperMethodSeed
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(upper)
  const hasParamRows = queryRows.some((r) => String(r.name || '').trim())
  const baseUrl = rawUrl.split('?')[0]

  let finalUrl = rawUrl
  let body: any = null
  for (const op of stepEditorPreOps.value) {
    if (op?.enabled === false || op?.type !== 'set_header') continue
    const key = String(op?.config?.name || '').trim()
    if (!key) continue
    headers[key] = resolveStepTemplateText(String(op?.config?.value || ''), stepVars)
  }
  applyStepAuthToRequest(headers, queryRows)

  if (upper === 'GET' || upper === 'HEAD') {
    finalUrl = buildUrlWithQueryString(rawUrl, queryRows)
  } else if (
    isWrite &&
    stepEditorBodyType.value === 'none' &&
    hasParamRows
  ) {
    // POST/PUT 等仅有 Params、无 Body：按表单提交（OAuth 等常见场景）
    finalUrl = baseUrl
    body = buildFormBodyFromParamRows(queryRows)
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  } else if (isWrite && stepEditorBodyType.value === 'x-www-form-urlencoded') {
    finalUrl = baseUrl
    body = buildFormBodyFromParamRows(queryRows)
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  } else {
    finalUrl = buildUrlWithQueryString(rawUrl, queryRows)
    if (isWrite) {
      if (stepEditorBodyType.value === 'json' && stepEditorBodyContent.value.trim()) {
        try {
          body = JSON.parse(resolveStepTemplateText(runtimeBodyText, stepVars))
        } catch {
          message.error('Body JSON 无法解析')
          return
        }
      } else if (stepEditorBodyType.value === 'text') {
        body = resolveStepTemplateText(runtimeBodyText, stepVars)
      } else if (stepEditorBodyType.value === 'form-data') {
        message.warning('form-data 请暂用 JSON 或 x-www-form-urlencoded')
        return
      }
    }
  }

  const requestHeadersSnapshot = { ...headers }
  const requestBodySnippet = buildRequestBodySnippet(body)

  stepEditorSending.value = true
  stepEditorLastResponse.value = null
  try {
    const rs = stepReqSettings.value
    const res: any = await execRequest.post(
      '/proxy',
      {
        url: finalUrl,
        method: upper,
        headers,
        body,
        ...buildProxyExtraFields(rs)
      },
      { timeout: rs.timeout > 0 ? rs.timeout + 5000 : 35000 }
    )
    const env = normalizeExecProxyResponse(res)
    stepEditorLastResponse.value = env.error
      ? { error: env.error, msg: env.msg, status_code: env.status_code }
      : {
          status_code: env.status_code,
          headers: env.headers,
          data: env.data,
          elapsed: env.elapsed
        }
    const name = currentStepNameForReport()
    const elapsed = env.elapsed
    if (env.error) {
      const ev = evaluateValidateResponsePass(
        env.status_code ?? null,
        stepEditorPostOps.value,
        env.data
      )
      appendScenarioSendLog({
        pass: false,
        name,
        method: upper,
        url: finalUrl,
        statusCode: env.status_code != null ? Number(env.status_code) : null,
        elapsedMs: elapsed,
        error: String(env.error),
        requestHeaders: requestHeadersSnapshot,
        requestBodySnippet,
        expectedStatusCode: ev.expectedStatusCode,
        validateResponseEnabled: ev.validateResponseEnabled,
        jsonBusinessCode: ev.jsonBusinessCode,
        jsonBusinessOk: ev.jsonBusinessOk
      })
      message.error(String(env.error))
    } else {
      const code = Number(env.status_code ?? 0)
      const ev = evaluateValidateResponsePass(code, stepEditorPostOps.value, env.data)
      const rh = normalizeProxyHeaderMap(env.headers)
      const assertionEval = evaluatePostAssertions(code, rh, env.data, stepEditorPostOps.value)
      const { text, bytes } = stringifyResponseForLog(env.data)
      appendScenarioSendLog({
        pass: ev.pass && assertionEval.pass,
        name,
        method: upper,
        url: finalUrl,
        statusCode: code,
        elapsedMs: elapsed,
        responseBodyText: text,
        responseSizeBytes: bytes,
        responseHeaders: rh,
        requestHeaders: requestHeadersSnapshot,
        requestBodySnippet,
        expectedStatusCode: ev.expectedStatusCode,
        validateResponseEnabled: ev.validateResponseEnabled,
        jsonBusinessCode: ev.jsonBusinessCode,
        jsonBusinessOk: ev.jsonBusinessOk
      })
      if (ev.pass) {
        message.success('请求已完成')
      } else if (ev.jsonBusinessOk === false) {
        message.warning('HTTP 成功，但响应体业务状态未通过校验')
      } else {
        message.warning('请求已返回，但状态码未通过校验')
      }
    }
  } catch (err: any) {
    const status = err?.response?.status
    const data = err?.response?.data
    let text = '网络或执行引擎异常'
    if (typeof data?.detail === 'string') {
      text = data.detail
    } else if (Array.isArray(data?.detail)) {
      text = JSON.stringify(data.detail)
    } else if (typeof data === 'string' && data) {
      text = data.length > 800 ? data.slice(0, 800) + '…' : data
    } else if (err?.code === 'ERR_NETWORK' || !err?.response) {
      text =
        '无法连接执行引擎：请确认本机已启动 exec-engine（默认 http://127.0.0.1:8010），并使用 npm run dev 启动前端（已配置 /engine 代理）。若用局域网 IP 打开页面，勿再依赖浏览器直连 localhost:8010。'
    } else if (status != null) {
      const body =
        data && typeof data === 'object' ? JSON.stringify(data) : String(data ?? '')
      text = `HTTP ${status}${body ? `：${body.slice(0, 400)}` : ''}`
    }
    stepEditorLastResponse.value = { error: text }
    const evCatch = evaluateValidateResponsePass(status ?? null, stepEditorPostOps.value)
    appendScenarioSendLog({
      pass: false,
      name: currentStepNameForReport(),
      method: upper,
      url: finalUrl,
      statusCode: status != null ? Number(status) : null,
      elapsedMs: null,
      error: text,
      requestHeaders: requestHeadersSnapshot,
      requestBodySnippet,
      expectedStatusCode: evCatch.expectedStatusCode,
      validateResponseEnabled: evCatch.validateResponseEnabled
    })
    // 网络/HTTP 错误已由 execRequest 拦截器提示，此处只写入下方「响应结果」避免重复弹窗
  } finally {
    stepEditorSending.value = false
  }
}

watch(
  () => detailScenario.value,
  () => {
    const n = detailStepCount.value
    if (n === 0) {
      selectedStepIndex.value = null
      stepDetailDrawerOpened.value = false
      stepBulkCheckedIndices.value = []
      stepSidebarMethods.value = {}
      stepEditorPreOps.value = []
      stepEditorPostOps.value = []
      hydrateStepAuthState()
      return
    }
    if (selectedStepIndex.value == null || selectedStepIndex.value >= n) {
      selectedStepIndex.value = 0
    }
    /* 场景和步骤状态变化后重置为可见，避免左侧已选中但右侧详情缺失 */
    stepDetailDrawerOpened.value = false
    loadScenarioStepEditor()
  },
  { deep: true }
)

watch(detailEnvId, () => {
  if (selectedStepIndex.value != null && detailStepCount.value > 0) {
    rebuildStepEditorUrl()
  }
})

watch(detailMainTab, (tab) => {
  if (tab !== 'steps') {
    stepDetailDrawerOpened.value = false
  }
})

type ImportDebugCaseRow = {
  id: number
  interface_id: number
  name: string
  case_type: string
  interfaceName: string
  method: string
  path: string
  group: string
  groupLabel: string
}

type ImportModalTreeNode = {
  label: string
  key: string
  type: 'folder' | 'api'
  id?: number
  method?: string
  path?: string
  children?: ImportModalTreeNode[]
  count?: number
}

const showImportCaseModal = ref(false)
/** debug：仅调试用例；formal：单接口用例（排除 debug，含 test / AI 等） */
const importCaseModalKind = ref<'debug' | 'formal'>('debug')
const importTreeLoading = ref(false)
const importCasesLoading = ref(false)
const importDebugSaving = ref(false)
const importTreePattern = ref('')
const importModalTreeData = ref<ImportModalTreeNode[]>([])
const importModalTreeSelectedKeys = ref<string[]>([])
const importSelectedInterfaceId = ref<number | null>(null)
const importInterfaceDetail = ref<{ id: number; name: string; method: string; path: string } | null>(null)
const importInterfacesIndex = ref<Map<number, { id: number; name: string; method: string; path: string }>>(new Map())
const importModalCasesList = ref<ImportDebugCaseRow[]>([])
const importModalCategory = ref<string>('all')
const importCaseListSearch = ref('')
/** 跨接口多选：caseId -> 行快照（用于写入场景步骤） */
const importSelectedCaseRows = ref<Record<number, ImportDebugCaseRow>>({})

const importCaseModalTitle = computed(() =>
  importCaseModalKind.value === 'formal' ? '从单接口用例导入' : '从接口调试用例导入'
)
const importCaseModalSub = computed(() =>
  importCaseModalKind.value === 'formal'
    ? '选择「单接口测试」中已保存的用例（不含仅调试类型），导入为当前场景的步骤'
    : '列出该接口下全部已保存用例（含「调试」与「测试用例」页中的用例）；导入时按用例实际类型区分来源'
)
const importCaseEmptyHint = computed(() =>
  importCaseModalKind.value === 'formal'
    ? '暂无可导入用例。请在「单接口测试」中保存类型为测试的用例，或确认未全部为调试用例。'
    : '该接口下暂无用例。请在「单接口测试」中保存调试用例或在「测试用例」页添加用例。'
)

/** 添加步骤 下拉面板 */
const addStepPopoverShow = ref(false)

type AddStepMenuItem = { key: string; label: string; icon: Component; iconBg: string }

const addStepRequestItems: AddStepMenuItem[] = [
  { key: 'import-api', label: '从接口导入', icon: ApiOutlined, iconBg: 'step-icon-purple' },
  { key: 'import-single-case', label: '从单接口用例导入', icon: FileTextOutlined, iconBg: 'step-icon-amber' },
  { key: 'import-debug-case', label: '从接口调试用例导入', icon: CloudUploadOutlined, iconBg: 'step-icon-blue' },
  { key: 'http', label: '添加 HTTP 请求', icon: ThunderboltOutlined, iconBg: 'step-icon-slate' },
  { key: 'curl', label: '从 cURL 导入', icon: ImportOutlined, iconBg: 'step-icon-slate' }
]

const addStepOtherItems: AddStepMenuItem[] = [
  { key: 'group', label: '分组', icon: FolderOutlined, iconBg: 'step-icon-green' },
  { key: 'branch', label: '条件分支', icon: ApartmentOutlined, iconBg: 'step-icon-pink' },
  { key: 'foreach', label: 'ForEach 循环', icon: SyncOutlined, iconBg: 'step-icon-orange' },
  { key: 'for', label: 'For 循环', icon: SyncOutlined, iconBg: 'step-icon-orange' },
  { key: 'script', label: '脚本', icon: CodeOutlined, iconBg: 'step-icon-cyan' },
  { key: 'db', label: '数据库操作', icon: DatabaseOutlined, iconBg: 'step-icon-violet' },
  { key: 'wait', label: '等待时间', icon: ClockCircleOutlined, iconBg: 'step-icon-sky' }
]

const addStepScenarioItems: AddStepMenuItem[] = [
  { key: 'import-scenario', label: '从其它场景用例导入', icon: ImportOutlined, iconBg: 'step-icon-slate' },
  { key: 'ref-scenario', label: '引用其它场景用例', icon: LinkOutlined, iconBg: 'step-icon-slate' }
]

const utilityStepKinds = ['wait_step', 'script_step', 'group_step', 'db_step'] as const

const methodBadgeStyle = (method: string) => {
  const map: Record<string, string> = {
    GET: 'color:#389e0d;background:#f6ffed;border:1px solid #b7eb8f;',
    POST: 'color:#d46b08;background:#fff7e6;border:1px solid #ffd591;',
    PUT: 'color:#096dd9;background:#e6f7ff;border:1px solid #91d5ff;',
    DELETE: 'color:#cf1322;background:#fff1f0;border:1px solid #ffa39e;',
    PATCH: 'color:#531dab;background:#f9f0ff;border:1px solid #d3adf7;'
  }
  return map[method] || 'color:#595959;background:#f5f5f5;border:1px solid #d9d9d9;'
}

const normalizeCaseType = (raw: unknown) => String(raw ?? '').trim().toLowerCase()

const inferCaseGroup = (caseType: string | undefined): { group: string; groupLabel: string } => {
  const ct = normalizeCaseType(caseType)
  if (ct === 'positive') return { group: 'positive', groupLabel: '正向' }
  if (ct === 'negative') return { group: 'negative', groupLabel: '负向' }
  if (ct === 'boundary') return { group: 'boundary', groupLabel: '边界值' }
  if (ct === 'security') return { group: 'security', groupLabel: '安全性' }
  if (ct === 'debug') return { group: 'other', groupLabel: '调试' }
  if (ct === 'test') return { group: 'other', groupLabel: '测试' }
  return { group: 'other', groupLabel: '其他' }
}

/** 解析 GET /test-cases 的多种响应形态（拦截器已解包时多为数组） */
const unwrapTestCaseList = (res: any): any[] => {
  if (res == null) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.records)) return res.records
  return []
}

const importModalCounts = computed(() => {
  const list = importModalCasesList.value
  return {
    all: list.length,
    positive: list.filter((c) => c.group === 'positive').length,
    negative: list.filter((c) => c.group === 'negative').length,
    boundary: list.filter((c) => c.group === 'boundary').length,
    security: list.filter((c) => c.group === 'security').length,
    other: list.filter((c) => c.group === 'other').length
  }
})

const importModalFilteredCases = computed(() => {
  let list = importModalCasesList.value
  if (importModalCategory.value !== 'all') {
    list = list.filter((c) => c.group === importModalCategory.value)
  }
  const q = importCaseListSearch.value.trim().toLowerCase()
  if (q) list = list.filter((c) => c.name.toLowerCase().includes(q))
  return list
})

const importSelectedCaseCount = computed(() => Object.keys(importSelectedCaseRows.value).length)

const buildImportModalTree = (folders: any[], interfaces: any[]): ImportModalTreeNode[] => {
  const build = (parentId: number | null): ImportModalTreeNode[] => {
    const levelFolders = folders.filter((f: any) => f.parent_id === parentId)
    const nodes = levelFolders.map((f: any) => {
      const node: ImportModalTreeNode = {
        label: f.name,
        key: `f-${f.id}`,
        type: 'folder',
        id: f.id,
        children: [...build(f.id)]
      }
      const folderApis = interfaces
        .filter((api: any) => api.folder_id === f.id)
        .map((api: any) => ({
          label: api.name,
          key: `api-${api.id}`,
          type: 'api' as const,
          id: api.id,
          method: api.method != null ? String(api.method) : 'GET',
          path: api.path || ''
        }))
      const ch = node.children!
      ch.push(...folderApis)
      node.count = ch.length
      return node
    })
    if (parentId === null) {
      const rootApis = interfaces
        .filter((api: any) => api.folder_id == null || api.folder_id === 0)
        .map((api: any) => ({
          label: api.name,
          key: `api-${api.id}`,
          type: 'api' as const,
          id: api.id,
          method: api.method != null ? String(api.method) : 'GET',
          path: api.path || ''
        }))
      nodes.push(...rootApis)
    }
    return nodes
  }
  return build(null)
}

const loadImportModalTreeData = async () => {
  importTreeLoading.value = true
  try {
    const [foldersRaw, interfacesRaw] = (await Promise.all([
      execRequest.get('/folders'),
      execRequest.get('/interfaces')
    ])) as [any, any]
    const folders: any[] = Array.isArray(foldersRaw) ? foldersRaw : (foldersRaw?.data ?? [])
    const interfaces: any[] = Array.isArray(interfacesRaw) ? interfacesRaw : (interfacesRaw?.data ?? [])
    const idx = new Map<number, { id: number; name: string; method: string; path: string }>()
    for (const api of interfaces) {
      if (api?.id == null) continue
      idx.set(api.id, {
        id: api.id,
        name: api.name || `接口 #${api.id}`,
        method: api.method != null ? String(api.method) : 'GET',
        path: api.path || ''
      })
    }
    importInterfacesIndex.value = idx
    importModalTreeData.value = buildImportModalTree(folders, interfaces)
  } catch {
    importModalTreeData.value = []
    importInterfacesIndex.value = new Map()
    message.error('加载接口目录失败')
  } finally {
    importTreeLoading.value = false
  }
}

const loadCasesForImportInterface = async (interfaceId: number) => {
  importCasesLoading.value = true
  importModalCategory.value = 'all'
  importCaseListSearch.value = ''
  try {
    const res: any = await execRequest.get('/test-cases', {
      params: { interface_id: interfaceId }
    })
    const list: any[] = unwrapTestCaseList(res)
    const iface = importInterfacesIndex.value.get(interfaceId)
    const name = iface?.name ?? `接口 #${interfaceId}`
    const method = iface?.method ?? '—'
    const path = iface?.path ?? '—'
    // formal：与「从单接口用例导入」一致，排除调试用例；debug 入口：展示该接口全部用例（与「测试用例」页数据源一致，避免只有 test/AI 用例时列表为空）
    const filtered = list.filter((tc) => {
      if (importCaseModalKind.value === 'formal') {
        return normalizeCaseType(tc.case_type) !== 'debug'
      }
      return true
    })
    importModalCasesList.value = filtered.map((tc) => {
      const { group, groupLabel } = inferCaseGroup(tc.case_type)
      return {
        id: tc.id,
        interface_id: tc.interface_id,
        name: tc.name || `用例 #${tc.id}`,
        case_type: tc.case_type || '',
        interfaceName: name,
        method,
        path,
        group,
        groupLabel
      } as ImportDebugCaseRow
    })
  } catch {
    importModalCasesList.value = []
    message.error('加载用例失败')
  } finally {
    importCasesLoading.value = false
  }
}

const onImportModalTreeSelect = (keys: Array<string | number>) => {
  const sk = keys.map(String)
  importModalTreeSelectedKeys.value = sk
  const key = sk[0]
  if (!key || !key.startsWith('api-')) {
    importSelectedInterfaceId.value = null
    importInterfaceDetail.value = null
    importModalCasesList.value = []
    return
  }
  const id = Number(key.slice(4))
  if (Number.isNaN(id)) return
  importSelectedInterfaceId.value = id
  importInterfaceDetail.value = importInterfacesIndex.value.get(id) ?? {
    id,
    name: `接口 #${id}`,
    method: '—',
    path: ''
  }
  loadCasesForImportInterface(id)
}

const renderImportModalTreeLabel = ({ option }: { option: any }) => {
  const o = option as ImportModalTreeNode
  if (o.type === 'api' && o.method) {
    return h('div', { class: 'import-tree-label-row' }, [
      h(
        'span',
        { class: 'import-tree-method', style: methodBadgeStyle(String(o.method)) },
        String(o.method)
      ),
      h('span', { class: 'import-tree-name' }, o.label)
    ])
  }
  return h('span', { class: 'import-tree-folder-row' }, [
    o.label,
    o.count != null
      ? h('span', { class: 'import-tree-count' }, ` (${o.count})`)
      : null
  ])
}

const openImportCaseModal = (kind: 'debug' | 'formal') => {
  importCaseModalKind.value = kind
  importTreePattern.value = ''
  importCaseListSearch.value = ''
  importModalCategory.value = 'all'
  importModalTreeSelectedKeys.value = []
  importSelectedInterfaceId.value = null
  importInterfaceDetail.value = null
  importModalCasesList.value = []
  importSelectedCaseRows.value = {}
  showImportCaseModal.value = true
  loadImportModalTreeData()
}

const toggleImportCaseRow = (row: ImportDebugCaseRow, checked: boolean) => {
  const next = { ...importSelectedCaseRows.value }
  if (checked) next[row.id] = row
  else delete next[row.id]
  importSelectedCaseRows.value = next
}

const onImportCaseModalLeave = () => {
  importModalTreeData.value = []
  importModalTreeSelectedKeys.value = []
  importTreePattern.value = ''
  importSelectedInterfaceId.value = null
  importInterfaceDetail.value = null
  importModalCasesList.value = []
  importInterfacesIndex.value = new Map()
  importSelectedCaseRows.value = {}
  importCaseListSearch.value = ''
  importModalCategory.value = 'all'
}

const stepCaseMetaLabel = (step: { case_id?: number; source?: string }) => {
  if (step.source === 'interface_case') return `接口用例 #${step.case_id}`
  return `调试用例 #${step.case_id}`
}

const confirmImportCases = async () => {
  const scenario = detailScenario.value
  if (!scenario?.id) {
    message.warning('请先打开一个测试场景')
    return
  }
  const picked = Object.values(importSelectedCaseRows.value)
  if (!picked.length) return

  const existingCaseIds = new Set(
    (Array.isArray(scenario.steps) ? scenario.steps : [])
      .map((s: any) => s.case_id)
      .filter((cid: any) => cid != null)
  )

  const steps = [...(Array.isArray(scenario.steps) ? scenario.steps : [])]
  let maxOrder = steps.reduce((m, s: any) => Math.max(m, typeof s.order === 'number' ? s.order : 0), 0)

  let added = 0
  for (const row of picked) {
    if (existingCaseIds.has(row.id)) continue
    maxOrder += 1
    const stepSource =
      normalizeCaseType(row.case_type) === 'debug' ? 'debug_case' : 'interface_case'
    steps.push({
      order: maxOrder,
      interface_id: row.interface_id,
      case_id: row.id,
      name: row.name,
      source: stepSource
    })
    existingCaseIds.add(row.id)
    added++
  }

  if (!added) {
    message.warning('所选用例已在当前场景中，未添加新步骤')
    return
  }

  importDebugSaving.value = true
  try {
    await execRequest.patch(`/test-scenarios/${scenario.id}`, { steps })
    message.success(`已导入 ${added} 个步骤`)
    showImportCaseModal.value = false
    await fetchScenarios()
  } catch {
    message.error('保存步骤失败')
  } finally {
    importDebugSaving.value = false
  }
}

const handleAddStepItem = (item: AddStepMenuItem) => {
  addStepPopoverShow.value = false
  if (item.key === 'import-debug-case') {
    openImportCaseModal('debug')
    return
  }
  if (item.key === 'import-single-case') {
    openImportCaseModal('formal')
    return
  }
  if (item.key === 'import-api') {
    openImportApiModal()
    return
  }
  if (item.key === 'http') {
    addHttpStep()
    return
  }
  if (item.key === 'wait') {
    addUtilityStep('wait_step')
    return
  }
  if (item.key === 'script') {
    addUtilityStep('script_step')
    return
  }
  if (item.key === 'group') {
    addUtilityStep('group_step')
    return
  }
  if (item.key === 'db') {
    addUtilityStep('db_step')
    return
  }
  if (item.key === 'curl') {
    curlInput.value = ''
    curlParsed.value = null
    curlStepName.value = ''
    showCurlModal.value = true
    return
  }
  // 其余项目（group/branch/foreach/for/script/db/wait/import-scenario/ref-scenario）暂未实现
  message.info(`「${item.label}」功能开发中`)
}

const formatDetailTime = (t: string | undefined) => {
  if (!t) return '—'
  return t.length > 16 ? t.slice(0, 16).replace('T', ' ') : t
}

watch(detailScenario, (row) => {
  if (row) {
    detailEnvId.value = row.env_id ?? null
  }
}, { immediate: true })

const enterScenarioList = () => {
  activeView.value = 'all'
  scenarioPanelMode.value = 'list'
  selectedScenarioForDetail.value = null
  stepDetailDrawerOpened.value = false
  selectedSidebarKeys.value = [ROOT_KEY]
}

const openScenarioDetail = (row: any) => {
  activeView.value = 'all'
  scenarioPanelMode.value = 'detail'
  selectedScenarioForDetail.value = row
  stepDetailDrawerOpened.value = false
  selectedSidebarKeys.value = [`scenario-${row.id}`]
}

const onDetailPriorityChange = async (v: string) => {
  const row = detailScenario.value
  if (!row) return
  try {
    await execRequest.patch(`/test-scenarios/${row.id}`, { priority: v })
    message.success('优先级已更新')
    await fetchScenarios()
  } catch {
    message.error('更新失败')
  }
}

// ── + 下拉菜单选项 ──
const addDropdownOptions = [
  {
    key: 'scenario',
    label: '新建场景用例',
    icon: () => h(NIcon, null, { default: () => h(FileOutlined) })
  },
  {
    key: 'folder',
    label: '新建目录',
    icon: () => h(NIcon, null, { default: () => h(FolderOutlined) })
  }
]

const handleAddOption = (key: string) => {
  enterScenarioList()
  if (key === 'scenario') openCreateModal()
  else if (key === 'folder') openFolderModal()
}

// ── 左侧树数据 ──
const sidebarTreeData = computed(() => {
  const folderMap = scenarioFolderMap.value
  const children: any[] = []

  // 子目录节点
  for (const folder of localFolders.value) {
    const folderChildren = scenarios.value
      .filter(s => String(folderMap[s.id]) === folder.id)
      .map(s => ({
        key: `scenario-${s.id}`,
        label: s.name,
        type: 'scenario',
        scenarioData: s,
        isLeaf: true,
      }))
    children.push({
      key: `folder-${folder.id}`,
      label: folder.name,
      type: 'folder',
      folderId: folder.id,
      children: folderChildren,
    })
  }

  // 未归入目录的场景（直接挂在根节点下）
  const assignedIds = new Set(
    Object.entries(folderMap)
      .filter(([, fid]) => !!fid)
      .map(([sid]) => Number(sid))
  )
  for (const s of scenarios.value) {
    if (!assignedIds.has(s.id)) {
      children.push({
        key: `scenario-${s.id}`,
        label: s.name,
        type: 'scenario',
        scenarioData: s,
        isLeaf: true,
      })
    }
  }

  // 以"测试场景"为根节点
  return [{
    key: ROOT_KEY,
    label: '测试场景',
    type: 'root',
    children,
  }]
})

const renderSidebarPrefix = ({ option }: { option: any }) => {
  if (option.type === 'root') {
    const isExpanded = expandedFolderKeys.value.includes(option.key)
    return h(NIcon, { style: 'color:#7d33ff;margin-right:2px' }, {
      default: () => h(isExpanded ? FolderOpenOutlined : FolderOutlined)
    })
  }
  if (option.type === 'folder') {
    const isExpanded = expandedFolderKeys.value.includes(option.key)
    return h(NIcon, { style: 'color:#f5a623;margin-right:2px' }, {
      default: () => h(isExpanded ? FolderOpenOutlined : FolderOutlined)
    })
  }
  return h(NIcon, { style: 'color:#7d33ff;margin-right:2px' }, { default: () => h(FileOutlined) })
}

const renderSidebarSuffix = ({ option }: { option: any }) => {
  if (option.type === 'root') {
    return h(NDropdown, {
      options: addDropdownOptions,
      trigger: 'click',
      placement: 'bottom-start',
      onSelect: (key: string) => handleAddOption(key)
    }, {
      default: () => h('span', {
        class: 'tree-root-add-btn',
        title: '新建',
        onClick: (e: MouseEvent) => e.stopPropagation()
      }, [
        h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.8, 'stroke-linecap': 'round' }, [
          h('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
          h('line', { x1: 5, y1: 12, x2: 19, y2: 12 })
        ])
      ])
    })
  }
  if (option.type === 'folder') {
    return h(NButton, {
      quaternary: true, circle: true, size: 'tiny',
      style: 'color:#d9534f',
      onClick: (e: MouseEvent) => { e.stopPropagation(); deleteFolder(option.folderId) }
    }, { icon: () => h(NIcon, null, { default: () => h(DeleteOutlined) }) })
  }
  if (option.type === 'scenario') {
    return h(NButton, {
      quaternary: true, circle: true, size: 'tiny',
      style: 'color:#d9534f',
      onClick: (e: MouseEvent) => { e.stopPropagation(); deleteScenario(option.scenarioData.id) }
    }, { icon: () => h(NIcon, null, { default: () => h(DeleteOutlined) }) })
  }
  return null
}

const handleSidebarSelect = (keys: string[], options: any[]) => {
  selectedSidebarKeys.value = keys.length ? keys : [ROOT_KEY]
  const node = options[0]
  activeView.value = 'all'

  if (!node || node.type === 'root') {
    scenarioPanelMode.value = 'list'
    selectedScenarioForDetail.value = null
    return
  }
  if (node.type === 'folder') {
    scenarioPanelMode.value = 'list'
    selectedScenarioForDetail.value = null
    return
  }
  if (node.type === 'scenario') {
    const data = node.scenarioData
    const fresh = scenarios.value.find(s => s.id === data?.id) || data
    scenarioPanelMode.value = 'detail'
    selectedScenarioForDetail.value = fresh
  }
}

// ── 目录操作 ──
const openFolderModal = () => {
  folderForm.value = { name: '' }
  showFolderModal.value = true
}

const saveFolder = () => {
  const name = folderForm.value.name.trim()
  if (!name) { message.warning('请输入目录名称'); return }
  const id = `f-${Date.now()}`
  const updated = [...localFolders.value, { id, name }]
  localFolders.value = updated
  saveFolders(updated)
  expandedFolderKeys.value = [...new Set([ROOT_KEY, ...expandedFolderKeys.value, `folder-${id}`])]
  message.success(`目录「${name}」已创建`)
  showFolderModal.value = false
}

const deleteFolder = (folderId: string) => {
  const updated = localFolders.value.filter(f => f.id !== folderId)
  localFolders.value = updated
  saveFolders(updated)
  // 解除该目录下场景的归属
  const map = { ...scenarioFolderMap.value }
  for (const sid of Object.keys(map)) {
    if (map[Number(sid)] === folderId) delete map[Number(sid)]
  }
  scenarioFolderMap.value = map
  saveFolderMap(map)
  message.success('目录已删除')
}

// ── 场景弹窗操作 ──
const filteredScenarios = computed(() => {
  if (!tableSearch.value) return scenarios.value
  return scenarios.value.filter(s =>
    s.name.toLowerCase().includes(tableSearch.value.toLowerCase())
  )
})

const allFilteredChecked = computed(() => {
  const ids = filteredScenarios.value.map(s => s.id)
  if (!ids.length) return false
  return ids.every(id => checkedIds.value.has(id))
})
const someFilteredChecked = computed(() => {
  const ids = filteredScenarios.value.map(s => s.id)
  const n = ids.filter(id => checkedIds.value.has(id)).length
  return n > 0 && n < ids.length
})

const batchMoveFolderOptions = computed(() => [
  { label: '根目录（不归属任何目录）', value: '__root__' },
  ...localFolders.value.map(f => ({ label: f.name, value: f.id }))
])

const fetchScenarios = async () => {
  loading.value = true
  try {
    const res: any = await execRequest.get('/test-scenarios')
    scenarios.value = Array.isArray(res) ? res : (res?.data || [])
  } catch {
    message.error('加载测试场景失败')
  } finally {
    loading.value = false
  }
}

const fetchEnvs = async () => {
  try {
    const res: any = await execRequest.get('/environments')
    environments.value = Array.isArray(res) ? res : (res?.data || [])
  } catch {}
}

const toggleAll = (checked: boolean) => {
  const ids = filteredScenarios.value.map(s => s.id)
  const s = new Set(checkedIds.value)
  if (checked) {
    ids.forEach(id => s.add(id))
  } else {
    ids.forEach(id => s.delete(id))
  }
  checkedIds.value = s
}

const toggleCheck = (id: number) => {
  const s = new Set(checkedIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  checkedIds.value = s
}

const clearSelection = () => {
  checkedIds.value = new Set()
}

const openBatchPriorityModal = () => {
  batchPriorityValue.value = 'P0'
  showBatchPriorityModal.value = true
}

const applyBatchPriority = async () => {
  batchLoading.value = true
  try {
    for (const id of [...checkedIds.value]) {
      await execRequest.patch(`/test-scenarios/${id}`, { priority: batchPriorityValue.value }).catch(() => {})
    }
    message.success('优先级已更新')
    showBatchPriorityModal.value = false
    await fetchScenarios()
  } finally {
    batchLoading.value = false
  }
}

const openBatchAddTagModal = () => {
  batchTagInput.value = ''
  showBatchAddTagModal.value = true
}

const applyBatchAddTag = async () => {
  const add = batchTagInput.value.trim()
  if (!add) {
    message.warning('请输入标签')
    return
  }
  batchLoading.value = true
  try {
    for (const id of [...checkedIds.value]) {
      const row = scenarios.value.find(s => s.id === id)
      if (!row) continue
      const cur = (row.tags || '').trim()
      const next = cur ? `${cur},${add}` : add
      await execRequest.patch(`/test-scenarios/${id}`, { tags: next }).catch(() => {})
    }
    message.success('标签已追加')
    showBatchAddTagModal.value = false
    await fetchScenarios()
  } finally {
    batchLoading.value = false
  }
}

const openBatchRemoveTagModal = () => {
  batchTagRemoveInput.value = ''
  showBatchRemoveTagModal.value = true
}

const applyBatchRemoveTag = async () => {
  const key = batchTagRemoveInput.value.trim()
  if (!key) {
    message.warning('请输入要移除的标签关键字')
    return
  }
  batchLoading.value = true
  try {
    for (const id of [...checkedIds.value]) {
      const row = scenarios.value.find(s => s.id === id)
      if (!row) continue
      const cur = (row.tags || '').trim()
      if (!cur) continue
      const parts = cur.split(/[,，]/).map((t: string) => t.trim()).filter(Boolean)
      const next = parts.filter((t: string) => !t.includes(key)).join(',')
      await execRequest.patch(`/test-scenarios/${id}`, { tags: next }).catch(() => {})
    }
    message.success('已处理标签')
    showBatchRemoveTagModal.value = false
    await fetchScenarios()
  } finally {
    batchLoading.value = false
  }
}

const openBatchMoveModal = () => {
  batchMoveFolderId.value = null
  showBatchMoveModal.value = true
}

const applyBatchMove = async () => {
  if (batchMoveFolderId.value == null || batchMoveFolderId.value === '') {
    message.warning('请选择目标目录或根目录')
    return
  }
  const map = { ...scenarioFolderMap.value }
  for (const id of [...checkedIds.value]) {
    if (batchMoveFolderId.value === '__root__') {
      delete map[id]
    } else {
      map[id] = batchMoveFolderId.value
    }
  }
  scenarioFolderMap.value = map
  saveFolderMap(map)
  message.success('已移动')
  showBatchMoveModal.value = false
}

const doBatchDelete = async () => {
  const ids = [...checkedIds.value]
  for (const id of ids) {
    try {
      await execRequest.delete(`/test-scenarios/${id}`)
      const map = { ...scenarioFolderMap.value }
      delete map[id]
      scenarioFolderMap.value = map
    } catch {
      /* 单条失败继续 */
    }
  }
  saveFolderMap(scenarioFolderMap.value)
  message.success('已删除所选场景')
  clearSelection()
  await fetchScenarios()
}

const confirmBatchDelete = () => {
  dialog.warning({
    title: '批量删除',
    content: `确定删除已选 ${checkedIds.value.size} 个场景？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => doBatchDelete()
  })
}

const openCreateModal = () => {
  scenarioPanelMode.value = 'list'
  editingId.value = null
  form.value = { name: '', priority: 'P0', tags: '', env_id: null, description: '', folder_id: null }
  showModal.value = true
}

const openEdit = (row: any) => {
  editingId.value = row.id
  const currentFolderId = scenarioFolderMap.value[row.id] || null
  form.value = {
    name: row.name,
    priority: row.priority || 'P0',
    tags: row.tags || '',
    env_id: row.env_id || null,
    description: row.description || '',
    folder_id: currentFolderId as string | null,
  }
  showModal.value = true
}

const saveScenario = async () => {
  if (!form.value.name.trim()) {
    message.warning('请输入场景名称')
    return
  }
  saving.value = true
  try {
    const { folder_id, ...payload } = form.value
    if (editingId.value) {
      await execRequest.patch(`/test-scenarios/${editingId.value}`, payload)
      // 更新目录映射
      const map = { ...scenarioFolderMap.value }
      if (folder_id) map[editingId.value] = folder_id
      else delete map[editingId.value]
      scenarioFolderMap.value = map
      saveFolderMap(map)
      message.success('更新成功')
    } else {
      const res: any = await execRequest.post('/test-scenarios', { ...payload, creator: userStore.username || 'anonymous' })
      // 新建后记录目录归属
      const newId = res?.id || res?.data?.id
      if (newId && folder_id) {
        const map = { ...scenarioFolderMap.value, [newId]: folder_id }
        scenarioFolderMap.value = map
        saveFolderMap(map)
      }
      message.success('创建成功')
    }
    showModal.value = false
    await fetchScenarios()
    activeView.value = 'all'
  } catch {
    message.error('操作失败')
  } finally {
    saving.value = false
  }
}

const deleteScenario = async (id: number) => {
  try {
    await execRequest.delete(`/test-scenarios/${id}`)
    const map = { ...scenarioFolderMap.value }
    delete map[id]
    scenarioFolderMap.value = map
    saveFolderMap(map)
    if (selectedScenarioForDetail.value?.id === id) {
      scenarioPanelMode.value = 'list'
      selectedScenarioForDetail.value = null
      selectedSidebarKeys.value = [ROOT_KEY]
    }
    message.success('删除成功')
    fetchScenarios()
  } catch {
    message.error('删除失败')
  }
}

const runAll = async () => {
  const ids =
    checkedIds.value.size > 0 ? [...checkedIds.value] : scenarios.value.map((s) => s.id)
  if (!ids.length) {
    message.warning('暂无场景可运行')
    return
  }
  batchRunning.value = true
  batchRunModalVisible.value = true
  batchRunProgress.value = 0
  batchRunPhase.value = '准备中…'
  batchRunDetail.value = ''
  batchRunSummary.value = null
  let aggPass = 0
  let aggFail = 0
  let done = 0
  const total = ids.length
  try {
    for (const sid of ids) {
      const sc = scenarios.value.find((s) => s.id === sid)
      if (!sc) {
        done++
        batchRunProgress.value = Math.round((done / total) * 100)
        continue
      }
      batchRunPhase.value = sc.name || `场景 #${sid}`
      const envId = sc.env_id ?? null
      const steps = [...(sc.steps || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
      if (!steps.length) {
        message.warning(`「${batchRunPhase.value}」暂无步骤，已跳过`)
        done++
        batchRunProgress.value = Math.round((done / total) * 100)
        continue
      }
      const entries: ExecScenarioLogEntry[] = []
      let si = 0
      for (const step of steps) {
        si++
        batchRunDetail.value = `步骤 ${si} / ${steps.length}`
        const ctx = await loadStepExecContext(step, envId)
        if (!ctx) {
          const nm = String(step?.name || '').trim() || '未命名步骤'
          entries.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
            at: Date.now(),
            pass: false,
            name: nm,
            method: '—',
            url: '—',
            statusCode: null,
            elapsedMs: null,
            error: '步骤未绑定用例或接口，无法执行'
          })
        } else {
          entries.push(await runStepExecContext(ctx))
        }
      }
      const summary = computeSummaryForLogEntries(entries)
      aggPass += summary.pass
      aggFail += summary.fail
      const prev = scenarioSendLogs.value[sid] ?? []
      scenarioSendLogs.value = { ...scenarioSendLogs.value, [sid]: [...entries, ...prev] }
      persistScenarioSendLogs()
      try {
        await execRequest.post(`/test-scenarios/${sid}/reports`, {
          entries,
          summary,
          env_id: envId,
          creator: userStore.username || 'anonymous',
          trigger_type: 'batch',
          title: `${sc.name || '场景'} · 批量运行 · ${new Date().toLocaleString()}`
        })
      } catch {
        /* 报告落库失败不阻断 */
      }
      try {
        await execRequest.patch(`/test-scenarios/${sid}`, {
          last_result: {
            status: summary.fail > 0 ? 'failed' : 'passed',
            passed: summary.pass,
            failed: summary.fail,
            duration: (summary.sumMs || 0) / 1000
          }
        })
      } catch {
        /* ignore */
      }
      done++
      batchRunProgress.value = Math.round((done / total) * 100)
    }
    batchRunSummary.value = {
      scenarios: total,
      passSteps: aggPass,
      failSteps: aggFail
    }
    batchRunPhase.value = '全部完成'
    batchRunDetail.value = `共 ${aggPass} 步通过 · ${aggFail} 步失败`
    message.success('批量运行已完成')
    await fetchScenarios()
  } catch (e) {
    console.error(e)
    message.error('批量运行异常中断')
    batchRunPhase.value = '已中断'
  } finally {
    batchRunning.value = false
  }
}

const closeBatchRunModal = () => {
  if (batchRunning.value) return
  batchRunModalVisible.value = false
  batchRunSummary.value = null
}

const onBatchRunModalAfterLeave = () => {
  batchRunSummary.value = null
  batchRunProgress.value = 0
  batchRunPhase.value = ''
  batchRunDetail.value = ''
}

onMounted(() => {
  loadScenarioSendLogs()
  window.addEventListener('resize', onReportWindowResize)
  fetchScenarios()
  fetchEnvs()
})

onUnmounted(() => {
  window.removeEventListener('resize', onReportWindowResize)
  window.removeEventListener('keydown', handleStepDetailDrawerEscape)
  disposeReportDonut()
})
</script>

<style scoped>
/* ════════════════════════════════════════
   整体布局
   父容器 .view-content > * 已经 absolute 撑满
   这里只需要 display:flex 横向排列即可
════════════════════════════════════════ */
.scenarios-layout {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #f5f7fa;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

/* ════════════════════════════════════════
   左侧边栏 — 覆盖旧白色背景，确保暗色主题
   实际布局/背景已由 common.css .page-sidebar 控制
════════════════════════════════════════ */
.sidebar {
  width: 300px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #eef1f6;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-top {
  padding: 14px 12px 10px;
  border-bottom: 1px solid #f0f2f7;
  flex-shrink: 0;
  background: transparent;
}

.sidebar-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

/* 搜索框 */
.sb-search-box {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 10px;
  background: #f8f9fc;
  border: 1px solid #e4e8f0;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.sb-search-box:focus-within {
  background: #fff;
  border-color: var(--color-primary-400);
  box-shadow: 0 0 0 2px rgba(129,140,248,0.18);
}

.sb-search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: #374151;
  caret-color: var(--color-primary-500);
  line-height: 1;
}
.sb-search-input::placeholder {
  color: #b0b7c3;
}

.sidebar-tool-btn {
  width: 32px; height: 32px;
  border: 1px solid #e4e7f0;
  border-radius: 7px;
  background: #f8f9fc;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #8792a2;
  flex-shrink: 0;
  transition: all 0.15s;
}
.sidebar-tool-btn:hover {
  border-color: var(--color-primary-400);
  color: var(--color-primary-500);
  background: rgba(var(--color-primary-rgb),0.06);
}

.sidebar-add-btn {
  flex-shrink: 0;
  width: 32px; height: 32px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400));
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb),0.35);
  transition: all 0.2s ease;
}
.sidebar-add-btn:hover {
  box-shadow: 0 4px 14px rgba(var(--color-primary-rgb),0.5);
  transform: rotate(90deg);
}

/* 导航区 */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 8px 8px 0;
  background: transparent;
}
.sidebar-nav::-webkit-scrollbar { width: 4px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: #e4e8f0; border-radius: 2px; }

/* 导航项 */
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
  margin-bottom: 2px;
}
.nav-item:hover { background: #f5f6fb; }
.nav-item.active { background: rgba(var(--color-primary-rgb),0.08); }
.nav-item.active .nav-label { color: var(--color-primary-500); font-weight: 600; }

.nav-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.nav-label {
  flex: 1;
  font-size: 13px;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  background: rgba(var(--color-primary-rgb),0.12);
  color: var(--color-primary-500);
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 8px;
  min-width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.nav-count {
  font-size: 11px;
  color: #c0c8d8;
  flex-shrink: 0;
}

/* 分组标题 */
.nav-section-title {
  font-size: 11px;
  color: #a0aab8;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 10px 10px 4px;
}

/* 子项 */
.nav-item.sub {
  padding-left: 14px;
}
.sub-icon {
  font-size: 13px;
  color: #c0c8d8;
  flex-shrink: 0;
}

.nav-divider {
  height: 1px;
  background: #f0f2f7;
  margin: 8px 4px;
}

.beta-pill {
  background: linear-gradient(135deg, #fff7e6, #ffe7ba);
  color: #d46b08;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 6px;
  border: 1px solid #ffd591;
  flex-shrink: 0;
}

/* 场景树 */
.scenario-tree {
  font-size: 13px;
  padding: 0 4px;
  background: transparent;
  --n-node-border-radius: 8px;
  --n-node-content-height: 34px;
}
:deep(.scenario-tree .n-tree-node-wrapper) {
  padding: 2px 0;
}
:deep(.scenario-tree .n-tree-node-content) {
  border-radius: 8px;
  transition: background 0.15s ease;
}
:deep(.scenario-tree .n-tree-node--selected) {
  background: transparent !important;
}
:deep(.scenario-tree .n-tree-node--selected > .n-tree-node-content) {
  background: rgba(var(--color-primary-rgb),0.1) !important;
  color: var(--color-primary-500);
  font-weight: 500;
}
:deep(.scenario-tree .n-tree-node:not(.n-tree-node--disabled):hover) {
  background: transparent !important;
}
:deep(.scenario-tree .n-tree-node:not(.n-tree-node--disabled):hover .n-tree-node-content) {
  background: #f5f6fb;
}

/* 树根部「新建」按钮 */
.tree-root-add-btn {
  color: var(--color-primary-500);
  background: rgba(var(--color-primary-rgb),0.1);
  transition: background 0.15s, transform 0.15s;
}
.tree-root-add-btn:hover {
  background: rgba(var(--color-primary-rgb),0.2);
  transform: scale(1.08);
}

.tree-root-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  cursor: pointer;
  flex-shrink: 0;
}

/* 弹窗标题 */
.modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal-icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  color: #fff;
}
.modal-icon.create { background: linear-gradient(135deg, #7d33ff, #a855f7); }
.modal-icon.edit   { background: linear-gradient(135deg, #0ea5e9, #38bdf8); }

/* 底部新建按钮 */
.sidebar-footer {
  padding: 12px 14px 16px;
  border-top: 1px solid #f0f2f7;
  background: transparent;
}
.new-btn {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400)) !important;
  border: none !important;
  border-radius: 9px !important;
  font-size: 13px !important;
  height: 36px !important;
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb),0.3) !important;
}

/* ═══ 渐变顶栏 ═══ */
.ts-topbar {
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #f8f7ff 60%, #f0f0ff 100%);
  border-bottom: 1px solid #e4e4f0;
}
.ts-topbar-deco {
  position: absolute;
  top: -40px; right: -40px;
  width: 140px; height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--color-primary-rgb),0.10) 0%, transparent 70%);
  pointer-events: none;
}
.ts-topbar-inner {
  position: relative;
  z-index: 1;
  height: 72px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.ts-topbar-left { display: flex; flex-direction: column; gap: 5px; }
.ts-topbar-breadcrumb {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; color: #9ca3af;
}
.ts-topbar-breadcrumb svg { flex-shrink: 0; color: #d1d5db; }
.ts-topbar-title-row { display: flex; align-items: center; gap: 10px; }
.ts-topbar-title-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400));
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 10px rgba(var(--color-primary-rgb),0.3); flex-shrink: 0;
}
.ts-topbar-title {
  margin: 0; font-size: 18px; font-weight: 700; color: #111827;
  letter-spacing: -0.02em; line-height: 1;
}
.ts-topbar-right { display: flex; align-items: center; gap: 8px; }
.ts-topbar-pill {
  display: inline-flex; align-items: center; gap: 5px;
  height: 26px; padding: 0 10px; border-radius: 13px;
  font-size: 12px; font-weight: 500;
  background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb;
}
.ts-topbar-pill--green {
  background: rgba(34,197,94,0.08); color: #16a34a; border-color: rgba(34,197,94,0.2);
}
.ts-pill-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #22c55e; box-shadow: 0 0 5px rgba(34,197,94,0.6);
  animation: ts-dot-blink 2s ease-in-out infinite;
}
@keyframes ts-dot-blink {
  0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
}

/* 白色内容面板（let common.css handle base, just override background） */
.content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
}

/* 顶部 header — 让 common.css 渐变样式生效，此处只做最小补充 */
.main-header {
  min-height: 52px;
}

.header-tabs {
  display: flex;
  height: 100%;
  gap: 4px;
}

.htab {
  position: relative;
  padding: 0 16px;
  height: 100%;
  font-size: 14px;
  color: #8792a2;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
  display: flex;
  align-items: center;
}
.htab:hover { color: #3c4257; }
.htab.active { color: #7d33ff; font-weight: 600; }
.htab-underline {
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  background: #7d33ff;
  border-radius: 2px 2px 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.batch-run-btn {
  background: rgba(125,51,255,0.08) !important;
  color: #7d33ff !important;
  border-color: rgba(125,51,255,0.2) !important;
  border-radius: 7px !important;
  font-size: 13px !important;
}

.run-all-btn {
  background: linear-gradient(135deg, #7d33ff, #5b21b6) !important;
  color: #fff !important;
  border: none !important;
  border-radius: 7px !important;
  font-size: 13px !important;
  box-shadow: 0 3px 10px rgba(125,51,255,0.3) !important;
}

/* ── 统计卡片 ── */
.stats-row {
  display: flex;
  gap: 14px;
  padding: 16px 24px 0;
  flex-shrink: 0;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  padding: 14px 18px;
  border: 1px solid #eaecf4;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: box-shadow 0.15s;
}
.stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1f36;
  line-height: 1;
}
.stat-label {
  font-size: 12px;
  color: #a0aab8;
}

.stat-card.green .stat-value { color: #389e0d; }
.stat-card.red   .stat-value { color: #cf1322; }
.stat-card.blue  .stat-value { color: #096dd9; }

/* ── 单场景详情页 ── */
.scenario-detail-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #fff;
  overflow: hidden;
}
.detail-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 48px;
  border-bottom: 1px solid #eaecf4;
  flex-shrink: 0;
}
.detail-page-tabs {
  display: flex;
  gap: 4px;
  height: 100%;
}
.dpt-btn {
  position: relative;
  padding: 0 14px;
  height: 100%;
  border: none;
  background: none;
  font-size: 14px;
  color: #8792a2;
  cursor: pointer;
}
.dpt-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  margin-left: 8px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(125, 51, 255, 0.1);
  color: #7d33ff;
  font-size: 11px;
  font-weight: 700;
}
.dpt-btn:hover { color: #3c4257; }
.dpt-btn.active { color: #7d33ff; font-weight: 600; }
.dpt-underline {
  position: absolute;
  bottom: 0;
  left: 14px;
  right: 14px;
  height: 2px;
  background: #7d33ff;
  border-radius: 2px 2px 0 0;
}
.detail-page-header-right {
  display: flex;
  gap: 4px;
}
.scenario-detail-body {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}
.scenario-detail-main {
  flex: 1;
  min-width: 0;
  padding: 20px 24px;
  overflow-y: auto;
}
.scenario-detail-main.detail-main-flex {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
/* ── 单场景 · 测试报告（步骤「发送」记录） ── */
.detail-report-root {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: min(480px, 52vh);
  margin-top: 0;
  overflow: hidden;
}

/* 测试报告 · 汇总（环形图 + 状态 + 耗时 + 循环/断言） */
.detail-report-summary-card {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px 32px;
  padding: 22px 26px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #eaecf4;
  border-radius: 12px;
}
.drr-chart-wrap {
  width: 168px;
  height: 168px;
  flex-shrink: 0;
  position: relative;
}
.drr-chart {
  width: 168px;
  height: 168px;
}
.drr-chart-empty {
  width: 168px;
  height: 168px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.drr-empty-ring {
  position: absolute;
  width: 132px;
  height: 132px;
  border-radius: 50%;
  box-sizing: border-box;
  border: 14px solid #ffc2d4;
  opacity: 0.85;
}
.drr-empty-text {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #8792a2;
}
.drr-empty-text strong {
  font-size: 28px;
  font-weight: 700;
  color: #1a1f36;
  line-height: 1.1;
}
.drr-status-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 160px;
}
.drr-status-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 8px;
  font-size: 13px;
  color: #3c4257;
}
.drr-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.drr-dot.pass {
  background: #52c41a;
}
.drr-dot.fail {
  background: #ff6b9d;
}
.drr-dot.idle {
  background: #d9d9d9;
}
.drr-status-label {
  min-width: 2em;
}
.drr-status-val {
  font-weight: 600;
  color: #1a1f36;
}
.drr-status-val.drr-em-fail {
  color: #ff4d4f;
}
.drr-status-pct {
  color: #8792a2;
  font-size: 12px;
}
.drr-vdivider {
  width: 1px;
  align-self: stretch;
  min-height: 120px;
  background: #e8eaed;
  flex-shrink: 0;
}
.drr-metrics-wrap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 28px 40px;
  flex: 1;
  min-width: 0;
}
.drr-metric-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 140px;
}
.drr-metric-col-right {
  padding-left: 4px;
}
.drr-metric-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.drr-metric-label {
  font-size: 12px;
  color: #8792a2;
}
.drr-metric-val.green {
  font-size: 15px;
  font-weight: 600;
  color: #52c41a;
}
.drr-metric-sub {
  font-size: 13px;
  color: #3c4257;
  line-height: 1.5;
}
.drr-loop-fail {
  color: #ff4d4f;
  font-weight: 700;
}
@media (max-width: 900px) {
  .drr-vdivider {
    display: none;
  }
  .detail-report-summary-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

.detail-report-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 0;
  margin-bottom: 10px;
  flex-shrink: 0;
}
.detail-report-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.drt-pill {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid #e0e4ef;
  background: #fff;
  font-size: 13px;
  color: #5c6676;
  cursor: pointer;
}
.drt-pill.active {
  border-color: #7d33ff;
  color: #7d33ff;
  font-weight: 600;
  background: rgba(125, 51, 255, 0.06);
}
.detail-report-toolbar-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}
.detail-report-search {
  width: 200px;
}
.detail-report-list-scroll {
  flex: 1;
  min-height: 200px;
  border: 1px solid #eaecf4;
  border-radius: 12px;
  background: #fafbfc;
  padding: 8px 0;
}
.detail-report-list-empty {
  padding: 32px;
  text-align: center;
  color: #a0aab8;
  font-size: 13px;
}
.detail-report-row {
  display: grid;
  grid-template-columns: 56px minmax(100px, 1.1fr) 52px minmax(140px, 1.8fr) auto;
  gap: 10px 12px;
  align-items: center;
  padding: 12px 16px;
  margin: 6px 10px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #f0f2f7;
  font-size: 13px;
  cursor: pointer;
  outline: none;
}
.detail-report-row:focus-visible {
  box-shadow: 0 0 0 2px rgba(125, 51, 255, 0.45);
}
.detail-report-row.active {
  box-shadow: 0 0 0 2px rgba(125, 51, 255, 0.35);
}
.detail-report-row.fail {
  background: #fff5f5;
  border-color: #ffccc7;
}
.detail-report-row.pass {
  background: #f6ffed;
  border-color: #b7eb8f;
}
.detail-report-status {
  font-size: 12px;
  font-weight: 600;
}
.detail-report-status.ok {
  color: #52c41a;
}
.detail-report-status.bad {
  color: #ff4d4f;
}
.detail-report-step-name {
  color: #1a1f36;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-report-method {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  justify-self: start;
}
.detail-report-url {
  font-size: 11px;
  color: #8792a2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-report-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
}
.detail-report-code {
  font-weight: 600;
  font-size: 13px;
}
.detail-report-code.ok {
  color: #52c41a;
}
.detail-report-code.bad {
  color: #ff4d4f;
}
.detail-report-time {
  font-size: 12px;
  color: #8792a2;
  min-width: 72px;
  text-align: right;
}

.detail-report-body-split {
  display: flex;
  flex: 1 1 auto;
  min-height: 200px;
  gap: 12px;
  align-items: stretch;
  overflow: hidden;
}
.detail-report-list-col {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.detail-report-body-split.with-detail .detail-report-list-col {
  flex: 1 1 50%;
  max-width: calc(100% - 320px);
}

.detail-report-detail-pane {
  flex: 0 0 min(480px, 45%);
  min-width: 280px;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  border: 1px solid #eaecf4;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}
.drp-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid #f0f2f7;
}
.drp-summary-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  font-size: 13px;
  color: #3c4257;
}
.drp-sum-label {
  color: #8792a2;
}
.drp-sum-code {
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  font-variant-numeric: tabular-nums;
}
.drp-sum-code.ok {
  color: #52c41a;
  background: #f6ffed;
}
.drp-sum-code.warn {
  color: #d48806;
  background: #fffbe6;
}
.drp-sum-code.bad {
  color: #ff4d4f;
  background: #fff2f0;
}
.drp-sum-code.na {
  color: #8792a2;
  background: #f5f5f5;
}
.drp-sum-sep {
  color: #c0c8d4;
  font-size: 12px;
}
.drp-sum-val {
  font-weight: 600;
  color: #1a1f36;
}
.drp-validate-block {
  padding: 10px 14px 12px;
  border-bottom: 1px solid #f0f2f7;
}
.drp-validate-title {
  font-size: 12px;
  font-weight: 600;
  color: #8792a2;
  margin-bottom: 8px;
}
.drp-validate-msg {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
}
.drp-validate-msg.is-ok {
  color: #389e0d;
}
.drp-validate-msg.is-fail {
  color: #ff4d4f;
}
.drp-validate-icon {
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 16px;
}
.drp-pane-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 10px;
  border-bottom: 1px solid #f0f2f7;
  background: #fafbfc;
}
.drp-pane-tab-btns {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}
.drp-pt {
  border: none;
  background: transparent;
  padding: 6px 10px;
  font-size: 13px;
  color: #5c6676;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.drp-pt:hover {
  color: #1a1f36;
  background: rgba(0, 0, 0, 0.04);
}
.drp-pt.active {
  color: #7d33ff;
  font-weight: 600;
  background: rgba(125, 51, 255, 0.08);
}
.drp-pt-badge {
  margin-left: 2px;
  transform: scale(0.85);
}
.drp-debug-btn {
  flex-shrink: 0;
  color: #7d33ff !important;
  border-color: rgba(125, 51, 255, 0.35) !important;
}
.drp-pane-scroll {
  flex: 1;
  min-height: 0;
  max-height: min(52vh, 560px);
}
.drp-tab-panel {
  padding: 10px 12px 14px;
}
.drp-legacy-hint {
  margin-bottom: 10px;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.5;
  color: #ad6800;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
}
.drp-body-subbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-bottom: 10px;
}
.drp-body-modes {
  display: inline-flex;
  border: 1px solid #e8eaed;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}
.drp-bm {
  border: none;
  background: #fff;
  padding: 4px 12px;
  font-size: 12px;
  color: #5c6676;
  cursor: pointer;
}
.drp-bm + .drp-bm {
  border-left: 1px solid #e8eaed;
}
.drp-bm.active {
  background: rgba(125, 51, 255, 0.08);
  color: #7d33ff;
  font-weight: 600;
}
.drp-body-tag {
  font-size: 12px;
  color: #1a1f36;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f0f2f7;
}
.drp-body-tag.muted {
  color: #8792a2;
  background: #f5f6fa;
}
.drp-body-actions {
  margin-left: auto;
  display: flex;
  gap: 2px;
}
.drp-code-frame {
  display: flex;
  align-items: stretch;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  background: #282c34;
  overflow: hidden;
  min-height: 120px;
  max-height: min(40vh, 420px);
}
.drp-code-gutter {
  flex-shrink: 0;
  padding: 10px 0 10px 10px;
  text-align: right;
  user-select: none;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.2);
}
.drp-gutter-line {
  display: block;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 12px;
  line-height: 1.55;
  color: #636d83;
  min-height: 1.55em;
}
.drp-code-pre {
  flex: 1;
  margin: 0;
  padding: 10px 12px;
  overflow: auto;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 12px;
  line-height: 1.55;
  color: #abb2bf;
  white-space: pre;
  word-break: break-all;
}
.drp-empty-hint {
  padding: 24px 8px;
  text-align: center;
  color: #a0aab8;
  font-size: 13px;
}
.drp-kv-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.drp-kv-row {
  display: grid;
  grid-template-columns: minmax(100px, 28%) 1fr;
  gap: 10px;
  font-size: 12px;
  padding: 8px 10px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #f0f2f7;
}
.drp-k {
  color: #7d33ff;
  font-weight: 600;
  word-break: break-all;
}
.drp-v {
  color: #3c4257;
  word-break: break-all;
}
.drp-console-pre {
  margin: 0;
  padding: 12px;
  background: #1e1e1e;
  color: #f48771;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.drp-req-line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
}
.drp-req-url {
  font-size: 12px;
  color: #5c6676;
  word-break: break-all;
  line-height: 1.45;
}
.drp-subtitle {
  font-size: 12px;
  font-weight: 600;
  color: #8792a2;
  margin: 12px 0 8px;
}
.drp-req-body-pre {
  margin: 0;
  padding: 12px;
  background: #fafbfc;
  border: 1px solid #eaecf4;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow: auto;
}

/* ── 测试步骤：左侧平铺 + 右侧抽屉详情 ── */
.detail-steps-workspace {
  flex: 1;
  display: flex;
  height: clamp(620px, calc(100vh - 220px), 860px);
  max-height: clamp(620px, calc(100vh - 220px), 860px);
  min-height: 0;
  margin-top: 0;
  border: 1px solid #e8edf6;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.05);
  overflow: hidden;
  position: relative;
}
/* 空状态：sidebar 固定宽度 + 右侧展示引导 */
.detail-steps-workspace.workspace-empty .step-editor-panel {
  background: linear-gradient(180deg, #fafcff 0%, #f5f8fd 100%);
}
.step-list-sidebar {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 46%);
  grid-template-rows: auto auto auto auto minmax(0, 1fr);
  column-gap: 14px;
  row-gap: 12px;
  align-items: start;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 251, 255, 0.98) 100%);
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
/* 空状态下 sidebar 固定 286px */
.detail-steps-workspace.workspace-empty .step-list-sidebar {
  flex: 0 0 286px;
  width: 286px;
  border-right: 1px solid #eaecf4;
}
.step-list-sidebar .step-list-scrollbar {
  min-height: 360px;
}
.step-list-toolbar {
  display: none;
}
.step-toolbar-title-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.step-toolbar-eyebrow {
  font-size: 11px;
  font-weight: 700;
  color: #7d33ff;
}
.step-toolbar-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}
.step-toolbar-caption {
  font-size: 11px;
  color: #94a3b8;
}
.step-toolbar-env {
  width: 170px;
}
.step-toolbar-action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px;
  grid-column: 1;
  grid-row: 1;
  position: relative;
  z-index: 1;
  align-self: stretch;
  align-content: flex-start;
  margin: 12px 0 0 14px;
  border: 1px solid #e8edf6;
  background:
    linear-gradient(135deg, rgba(124, 58, 237, 0.07), transparent 32%),
    linear-gradient(225deg, rgba(59, 130, 246, 0.06), transparent 38%),
    linear-gradient(180deg, rgba(253, 254, 255, 0.96) 0%, rgba(246, 250, 255, 0.92) 100%);
  box-shadow:
    0 12px 28px rgba(15, 23, 42, 0.045),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
}
.step-toolbar-action-row::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(124, 58, 237, 0), rgba(124, 58, 237, 0.28), rgba(59, 130, 246, 0));
  opacity: 0.9;
  pointer-events: none;
}
.step-toolbar-action-row:not(.secondary) {
  overflow: hidden;
}
.step-toolbar-action-row:not(.secondary)::after {
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
}
.step-toolbar-action-row:not(.secondary)::before {
  content: '快捷操作';
  flex-basis: 100%;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #596780;
  text-transform: uppercase;
  text-shadow: 0 0 12px rgba(124, 58, 237, 0.08);
}
.step-toolbar-action-row.secondary {
  grid-row: 2;
  padding-top: 10px;
  padding-bottom: 14px;
  margin-top: -1px;
  border-top: none;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  box-shadow:
    0 12px 28px rgba(15, 23, 42, 0.045),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
}
.step-toolbar-action-row:not(.secondary) {
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}
.step-link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid rgba(206, 216, 232, 0.95);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(245, 249, 255, 0.88) 100%);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  color: #4338ca;
  text-align: center;
  cursor: pointer;
  box-shadow:
    0 4px 12px rgba(15, 23, 42, 0.035),
    inset 0 1px 0 rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}
.step-link-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(120deg, rgba(124, 58, 237, 0.08), transparent 38%, rgba(59, 130, 246, 0.08));
  opacity: 0;
  transition: opacity 0.18s ease;
  pointer-events: none;
}
.step-link-btn:hover {
  border-color: rgba(99, 102, 241, 0.3);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 245, 255, 0.94) 100%);
  box-shadow:
    0 10px 22px rgba(99, 102, 241, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.94);
  transform: translateY(-1px) scale(1.01);
}
.step-link-btn:hover::before {
  opacity: 1;
}
.step-link-btn.primary {
  border-color: rgba(109, 40, 217, 0.42);
  background:
    linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(59, 130, 246, 0.12)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(243, 247, 255, 0.96) 100%);
  color: #5b21b6;
  box-shadow:
    0 12px 26px rgba(109, 40, 217, 0.15),
    0 0 0 1px rgba(124, 58, 237, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
.step-link-btn.muted {
  color: #64748b;
}
.step-toolbar-action-row .step-link-btn:nth-child(2) {
  order: 4;
}
.step-toolbar-action-row .step-link-btn:nth-child(3) {
  order: 3;
}
.step-toolbar-action-row .step-link-btn:nth-child(4) {
  order: 2;
}
.step-link-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}
.step-toolbar-action-row .step-link-btn.muted:not(:disabled) {
  color: #a16207;
  border-color: rgba(245, 158, 11, 0.28);
  background: linear-gradient(180deg, rgba(255, 251, 235, 0.96) 0%, rgba(255, 247, 237, 0.92) 100%);
}
.step-toolbar-action-row .step-link-btn.muted:not(:disabled):hover {
  border-color: rgba(245, 158, 11, 0.42);
  background: linear-gradient(180deg, rgba(255, 247, 237, 1) 0%, rgba(255, 243, 224, 0.98) 100%);
  box-shadow: 0 10px 20px rgba(245, 158, 11, 0.12);
}
.step-toolbar-action-row.secondary .step-link-btn:last-child:not(:disabled) {
  color: #b91c1c;
  border-color: rgba(239, 68, 68, 0.26);
  background: linear-gradient(180deg, rgba(254, 242, 242, 0.96) 0%, rgba(255, 236, 236, 0.92) 100%);
}
.step-toolbar-action-row.secondary .step-link-btn:last-child:not(:disabled):hover {
  border-color: rgba(239, 68, 68, 0.42);
  background: linear-gradient(180deg, rgba(254, 242, 242, 1) 0%, rgba(255, 232, 232, 0.98) 100%);
  box-shadow: 0 10px 20px rgba(239, 68, 68, 0.12);
}
.step-toolbar-spotlight {
  display: none;
}
.step-toolbar-action-row.secondary .step-link-btn:first-child {
  display: none;
}
.step-spotlight-card {
  border: 1px solid #e6ebf5;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.18s ease;
}
.step-spotlight-card:hover {
  border-color: rgba(125, 51, 255, 0.28);
  box-shadow: 0 10px 24px rgba(125, 51, 255, 0.1);
  transform: translateY(-1px);
}
.step-spotlight-title {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #1f2937;
}
.step-spotlight-desc {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.45;
  color: #64748b;
}
.step-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid rgba(232, 237, 246, 0.7);
  border-bottom: 1px solid rgba(232, 237, 246, 0.95);
  background:
    linear-gradient(90deg, rgba(124, 58, 237, 0.03), transparent 28%, rgba(59, 130, 246, 0.03)),
    linear-gradient(180deg, rgba(250, 252, 255, 0.9) 0%, rgba(255, 255, 255, 0.88) 100%);
  grid-column: 1 / -1;
  grid-row: 3;
  margin-top: 4px;
}
.step-filter-search {
  flex: 0 1 560px;
  max-width: 560px;
  margin-right: auto;
}
.step-filter-search :deep(.n-input) {
  --n-height: 32px !important;
}
.step-filter-search :deep(.n-input-wrapper) {
  border-radius: 999px !important;
  box-shadow:
    0 6px 16px rgba(15, 23, 42, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.88) !important;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 255, 0.94) 100%) !important;
}
.step-filter-search :deep(.n-input__border),
.step-filter-search :deep(.n-input__state-border) {
  border-radius: 999px !important;
}
.step-filter-search :deep(.n-input__input-el) {
  font-size: 11px;
  letter-spacing: 0.01em;
}
.step-filter-method {
  width: 128px;
  flex: 0 0 128px;
}
.step-filter-method :deep(.n-base-selection) {
  min-height: 32px !important;
  border-radius: 999px !important;
  border-color: rgba(125, 51, 255, 0.12) !important;
  box-shadow:
    0 6px 16px rgba(15, 23, 42, 0.035),
    inset 0 1px 0 rgba(255, 255, 255, 0.86) !important;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 255, 0.94) 100%) !important;
}
.step-filter-method :deep(.n-base-selection:hover) {
  border-color: rgba(125, 51, 255, 0.22) !important;
}
.step-filter-method :deep(.n-base-selection-label) {
  padding-left: 12px !important;
  padding-right: 28px !important;
  font-size: 11px !important;
  color: #667085 !important;
}
.step-filter-method :deep(.n-base-selection-arrow) {
  color: #98a2b3 !important;
}
.step-filter-add-btn {
  height: 32px;
  min-width: 112px;
  padding: 0 16px;
  border: 1px solid rgba(109, 40, 217, 0.24) !important;
  border-radius: 999px !important;
  background:
    linear-gradient(135deg, rgba(124, 58, 237, 0.18), rgba(59, 130, 246, 0.12)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 247, 255, 0.96) 100%) !important;
  color: #4c1d95 !important;
  box-shadow:
    0 12px 24px rgba(109, 40, 217, 0.12),
    0 0 0 1px rgba(124, 58, 237, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.86) !important;
  white-space: nowrap;
}
.step-filter-add-btn:hover {
  border-color: rgba(109, 40, 217, 0.36) !important;
  background:
    linear-gradient(135deg, rgba(124, 58, 237, 0.24), rgba(59, 130, 246, 0.16)),
    linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(243, 247, 255, 0.98) 100%) !important;
  box-shadow:
    0 16px 30px rgba(109, 40, 217, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.92) !important;
}
.step-filter-add-btn:active {
  transform: translateY(0);
}
.step-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 12px 14px 0 0;
  border-bottom: none;
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: stretch;
  align-content: center;
  min-height: 0;
}
.step-stat-card {
  border: 1px solid #e8edf6;
  border-radius: 14px;
  padding: 12px 14px;
  background:
    radial-gradient(circle at right top, rgba(255, 255, 255, 0.96), transparent 42%),
    linear-gradient(135deg, rgba(124, 58, 237, 0.04), transparent 30%),
    linear-gradient(180deg, rgba(252, 253, 255, 0.94) 0%, rgba(255, 255, 255, 0.98) 100%);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  min-height: 84px;
  box-shadow:
    0 12px 26px rgba(15, 23, 42, 0.045),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}
.step-stat-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 14px;
  bottom: 14px;
  width: 4px;
  border-radius: 999px;
  background: #dde4f0;
}
.step-stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 12px;
  right: 12px;
  height: 1px;
  background: linear-gradient(90deg, rgba(124, 58, 237, 0), rgba(124, 58, 237, 0.18), rgba(59, 130, 246, 0));
  pointer-events: none;
}
.step-stat-card:hover {
  border-color: rgba(99, 102, 241, 0.18);
  box-shadow:
    0 16px 32px rgba(30, 41, 59, 0.07),
    0 0 0 1px rgba(99, 102, 241, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.94);
}
.step-stat-card.ok {
  background:
    radial-gradient(circle at right top, rgba(255, 255, 255, 0.96), transparent 42%),
    linear-gradient(135deg, rgba(34, 197, 94, 0.06), transparent 28%),
    linear-gradient(180deg, rgba(248, 252, 249, 0.94) 0%, rgba(255, 255, 255, 0.98) 100%);
}
.step-stat-card.ok::before {
  background: linear-gradient(180deg, #4ade80, #22c55e);
}
.step-stat-card.fail {
  background:
    radial-gradient(circle at right top, rgba(255, 255, 255, 0.96), transparent 42%),
    linear-gradient(135deg, rgba(239, 68, 68, 0.06), transparent 28%),
    linear-gradient(180deg, rgba(253, 249, 250, 0.94) 0%, rgba(255, 255, 255, 0.98) 100%);
}
.step-stat-card.fail::before {
  background: linear-gradient(180deg, #fb7185, #ef4444);
}
.step-stat-card.pending {
  background:
    radial-gradient(circle at right top, rgba(255, 255, 255, 0.96), transparent 42%),
    linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent 28%),
    linear-gradient(180deg, rgba(249, 251, 254, 0.94) 0%, rgba(255, 255, 255, 0.98) 100%);
}
.step-stat-card.pending::before {
  background: linear-gradient(180deg, #93c5fd, #60a5fa);
}
.step-stat-label {
  font-size: 12px;
  color: #667085;
  white-space: nowrap;
  padding-left: 4px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.step-stat-value {
  font-size: 28px;
  line-height: 1;
  color: #111827;
  letter-spacing: -0.04em;
  padding-left: 4px;
  font-weight: 700;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.75);
  font-variant-numeric: tabular-nums;
}
.step-recent-fail {
  padding: 0 14px 14px;
  font-size: 12px;
  color: #64748b;
  grid-column: 1 / -1;
  grid-row: 4;
  min-height: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.step-recent-label {
  color: #f97316;
  font-weight: 600;
}
.step-recent-label::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 999px;
  display: inline-block;
  margin-right: 6px;
  background: radial-gradient(circle, #fb923c 0%, #f97316 68%);
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.3);
}
.step-recent-value {
  color: #334155;
}
.step-toolbar-count {
  font-weight: 600;
  color: #3c4257;
  margin-right: 4px;
}
.step-toolbar-count.muted {
  font-weight: 500;
  color: #8792a2;
}
.step-list-scrollbar {
  min-height: 0;
  height: 100%;
  padding-bottom: 8px;
  grid-column: 1 / -1;
  grid-row: 5;
  align-self: stretch;
  overflow: hidden;
}
.step-list-zero {
  padding: 24px 12px;
  text-align: center;
  color: #a0aab8;
  font-size: 12px;
  line-height: 1.5;
}
.step-list-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  margin: 4px 8px;
  border-radius: 14px;
  cursor: pointer;
  border: 1px solid #eceff6;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  position: relative;
  background: #fff;
}
.step-list-item:hover {
  background: #f3f0ff;
}
.step-list-item.active {
  background: #f5f0ff;
  border-color: rgba(125, 51, 255, 0.28);
  box-shadow: inset 3px 0 0 #7d33ff;
}
/* 拖拽排序样式 */
.step-list-item.drag-over {
  border-color: #7d33ff;
  background: #f0ebff;
  box-shadow: inset 3px 0 0 #7d33ff, 0 0 0 2px rgba(125,51,255,0.15);
}
.step-list-item.dragging {
  opacity: 0.45;
  background: #f8f0ff;
}
.step-drag-handle {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-top: 3px;
  color: #c0c8d8;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.15s;
  padding: 0 2px;
}
.step-list-item:hover .step-drag-handle {
  opacity: 1;
}
.step-drag-handle:active {
  cursor: grabbing;
}
.step-li-method {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 4px;
  flex-shrink: 0;
  line-height: 1.35;
  margin-top: 2px;
}
.step-li-order {
  min-width: 24px;
  font-size: 12px;
  font-weight: 700;
  color: #6b4eff;
  line-height: 24px;
}
.step-li-main {
  flex: 1;
  min-width: 0;
}
.step-li-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.step-li-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a1f36;
  line-height: 1.35;
  word-break: break-word;
}
.step-li-meta {
  font-size: 11px;
  color: #a0aab8;
  margin-top: 4px;
}
.step-li-submeta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  font-size: 11px;
  color: #94a3b8;
}
.step-li-status {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.step-li-status.passed {
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
}
.step-li-status.failed {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}
.step-li-status.pending {
  background: rgba(148, 163, 184, 0.12);
  color: #475569;
}
.step-li-meta--iface {
  color: #7d33ff;
}
.step-li-meta--http {
  color: #0ea5e9;
}
.step-list-footer {
  padding: 10px;
  border-top: 1px solid #eaecf4;
  flex-shrink: 0;
}
.step-add-footer-btn {
  border-color: #7d33ff !important;
  color: #7d33ff !important;
}
.step-workspace-empty-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
  justify-content: center;
}
/* 空状态右侧占位 */
.step-editor-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f7faff 0%, #f2f6fc 100%);
  position: relative;
  overflow: hidden;
}
.step-editor-panel :deep(.n-spin-content) {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
/* 有默认插槽时 NSpin 根节点是 n-spin-container（不是 n-spin-body），必须参与 flex 伸展，否则子节点 height:100% / grid 1fr 无法解析，上下区会变成 0 高度 */
.step-editor-panel.is-drawer :deep(.n-spin-container) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-self: stretch;
  width: 100%;
  height: 100%;
}
.step-editor-panel.is-drawer :deep(.n-spin-body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
/* 勿对 :deep(.n-spin) 泛匹配：加载中会命中内部 Loading 图标，误设 flex:1 破坏布局 */
.step-editor-panel.is-drawer :deep(.n-spin-content) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
.step-detail-panel-enter-active,
.step-detail-panel-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.28s ease;
}
.step-detail-panel-enter-from,
.step-detail-panel-leave-to {
  transform: translateX(100%);
  opacity: 1;
}
.step-detail-fixed-drawer {
  position: fixed;
  top: calc(var(--header-height, 56px) + 8px);
  right: 16px;
  bottom: 16px;
  /* 只占视口右侧一条，不用 100vw，避免盖住中间步骤列表 */
  width: min(980px, 58vw);
  max-width: calc(100vw - 220px);
  min-width: 420px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  box-sizing: border-box;
  padding: 0;
  filter: drop-shadow(-12px 0 32px rgba(15, 23, 42, 0.14));
}
.step-detail-fixed-drawer > .step-editor-panel {
  pointer-events: auto;
  flex: 1;
  min-height: 0;
}
.step-editor-panel.is-drawer {
  height: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%);
  overflow: hidden;
  border: 1px solid var(--color-border-subtle, #e7edf6);
  border-radius: 20px;
}
/* 步骤编辑内容卡片：填满右侧抽屉（grid 第二行 minmax 保证下方分栏必有高度，避免 flex 链上高度为 0） */
.step-editor-shell {
  position: relative;
  flex: 1;
  min-height: 0;
  height: 100%;
  align-self: stretch;
  margin: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  border: none;
  border-radius: 0;
  background:
    linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
  box-shadow: none;
  overflow: hidden;
}
.step-editor-panel.is-drawer .step-editor-shell {
  margin: 0;
  border-radius: 0;
  box-shadow: none;
}
/* 右侧抽屉：请求区 / 响应区 分栏 + 可拖拽比例 */
.step-drawer-region--top {
  flex-shrink: 0;
}
.step-drawer-split {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 12px 18px 18px;
  overflow: hidden;
}
.step-drawer-region--upper {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.step-drawer-region-heading {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 2px 10px;
  margin-bottom: 2px;
  border-bottom: 1px solid #eef2f7;
}
.step-drawer-region-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.02em;
}
.step-drawer-resize-handle {
  flex: 0 0 10px;
  margin: 6px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ns-resize;
  border-radius: 8px;
  background: linear-gradient(180deg, #eef2f7 0%, #e2e8f0 100%);
  border: 1px solid #dbe4f3;
  user-select: none;
  touch-action: none;
}
.step-drawer-resize-handle:hover {
  background: linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%);
}
.step-drawer-resize-grip {
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.5);
}
/* 步骤「设置」Tab：与单接口调试 ApiDebugView 一致 */
.step-settings-pane {
  padding-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 100%;
  overflow: auto;
}
.step-settings-pane .settings-section {
  background: #fafbff;
  border: 1px solid #eef1f8;
  border-radius: 10px;
  padding: 16px 20px;
}
.step-settings-pane .settings-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eef1f8;
}
.step-settings-pane .settings-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 14px;
}
.step-settings-pane .settings-row:last-child {
  margin-bottom: 0;
}
.step-settings-pane .settings-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}
.step-settings-pane .settings-item--switch {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  min-width: 260px;
  background: #fff;
  border: 1px solid #e8eaef;
  border-radius: 8px;
  padding: 10px 14px;
  gap: 14px;
}
.step-settings-pane .settings-item--wide {
  flex: 1;
  min-width: 300px;
}
.step-settings-pane .settings-switch-info {
  flex: 1;
}
.step-settings-pane .settings-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}
.step-settings-pane .settings-hint {
  font-size: 11px;
  color: #b0b7c3;
  font-weight: 400;
}
.step-settings-pane .settings-desc {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}
.step-settings-pane .settings-proxy-fields {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 14px;
}
.step-settings-pane .settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}
.step-drawer-region--lower {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.step-editor-main {
  min-width: 0;
  min-height: 0;
  flex: 1 1 0%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
  overflow: hidden;
  position: relative;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 100%);
}
.step-editor-bottom {
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  height: 100%;
  padding: 0;
  background: linear-gradient(180deg, #f8fbff 0%, #f3f7fd 100%);
  display: flex;
  overflow: hidden;
  align-content: stretch;
  position: relative;
}
.step-editor-bottom::before {
  content: '';
  position: absolute;
  top: 0;
  left: 18px;
  right: 18px;
  height: 18px;
  background: linear-gradient(180deg, rgba(248, 251, 255, 0.98) 0%, rgba(248, 251, 255, 0) 100%);
  pointer-events: none;
  z-index: 0;
}
.step-response-side {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex: 1 1 auto;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  align-items: stretch;
  position: relative;
  z-index: 1;
  padding: 12px 18px 18px;
}
.step-editor-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  color: #8792a2;
  font-size: 14px;
  text-align: center;
}
.step-ph-sub {
  font-size: 12px;
  margin-top: 10px;
  color: #a0aab8;
  line-height: 1.5;
}
.step-overview-card {
  border: 1px solid #e6ebf5;
  background: linear-gradient(135deg, #f6f8ff 0%, #eff4ff 100%);
  border-radius: 16px;
  padding: 16px 18px;
  margin-bottom: 0;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.step-overview-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(125, 51, 255, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent 54%);
  pointer-events: none;
}
.step-detail-drawer-backbar {
  flex-shrink: 0;
  padding: 14px 18px 0;
}
.step-drawer-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 8px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: #334155;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    color 0.15s ease;
}
.step-drawer-back-btn:hover {
  background: #ffffff;
  border-color: #c4b5fd;
  color: #5b21b6;
  box-shadow: 0 4px 16px rgba(125, 51, 255, 0.15);
}
.step-drawer-back-btn:active {
  transform: translateY(0.5px);
}
.step-overview-card--top {
  margin: 10px 18px 0;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}
.step-overview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  z-index: 1;
}
.step-overview-title-group {
  min-width: 0;
}
.step-overview-eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: #7d33ff;
  margin-bottom: 6px;
}
.step-overview-title-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.step-overview-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.step-overview-method {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
}
.step-overview-env {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}
.step-overview-env-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.step-overview-env-label {
  font-size: 12px;
  color: #64748b;
}
.step-overview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  position: relative;
  z-index: 1;
}
.step-overview-chip {
  padding: 6px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid #dbe4f3;
  font-size: 12px;
  color: #475569;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}
.step-overview-chip--ok {
  color: #0f766e;
  background: rgba(236, 253, 245, 0.9);
  border-color: #bbf7d0;
}
.step-link-summary {
  border: 1px solid #e6ebf5;
  border-radius: 14px;
  padding: 14px 16px;
  background: linear-gradient(180deg, #fcfdff 0%, #f7faff 100%);
  margin-bottom: 0;
  flex-shrink: 0;
}
.step-link-summary-title {
  font-size: 13px;
  font-weight: 700;
  color: #3b4360;
  margin-bottom: 12px;
}
.step-link-summary-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.step-link-summary-label {
  width: 70px;
  flex-shrink: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 28px;
}
.step-link-summary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.step-link-tag {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.24);
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
}
.step-link-summary-empty {
  font-size: 12px;
  color: #94a3b8;
  line-height: 28px;
}
.step-response-panel {
  margin: 0;
  border: 1px solid #eaecf4;
  border-radius: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.98) 100%);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  flex: 1;
  min-height: 0;
  height: 100%;
}
.step-response-panel.always-visible {
  border: 1px solid #e6ebf5;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(246, 249, 253, 0.98) 100%);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
.step-response-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 14px 16px 12px;
  border-bottom: 1px solid #eaecf4;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}
.step-response-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2a44;
  margin-right: 4px;
}
.step-response-meta {
  font-size: 12px;
  color: #64748b;
}
.step-response-err {
  font-size: 12px;
  color: #dc2626;
}
.step-response-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px 12px;
  padding: 12px 16px 0;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.step-response-view-switch {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
}
.step-view-btn,
.step-mini-tab,
.step-auth-card {
  border: 1px solid #d9e0ec;
  background: #fff;
  cursor: pointer;
}
.step-view-btn {
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  color: #475569;
}
.step-view-btn.active {
  border-color: #7d33ff;
  color: #7d33ff;
  background: rgba(125, 51, 255, 0.08);
}
.step-response-tabs-mini {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}
.step-mini-tab {
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  color: #475569;
}
.step-mini-tab.active {
  border-color: #7d33ff;
  color: #7d33ff;
  background: rgba(125, 51, 255, 0.08);
}
.step-response-body-shell {
  flex: 1;
  min-height: 0;
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(244, 247, 252, 0.92) 100%);
  overflow: hidden;
}
.step-response-body-shell > * {
  min-height: 0;
}
.step-response-pre {
  margin: 0;
  padding: 14px 16px;
  flex: 1;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  color: #1e293b;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
.step-response-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 12px;
  text-align: left;
  padding: 22px;
  border: 1px dashed #dbe4f3;
  border-radius: 18px;
  color: #94a3b8;
  background:
    radial-gradient(circle at top right, rgba(125, 51, 255, 0.08), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(247, 250, 255, 0.96) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
.step-response-empty--compact {
  padding-top: 28px;
  padding-bottom: 28px;
}
.step-response-empty-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 84px;
  height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(125, 51, 255, 0.18);
  background: rgba(125, 51, 255, 0.08);
  color: #7d33ff;
  font-size: 12px;
  font-weight: 700;
}
.step-response-empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}
.step-response-empty-desc {
  font-size: 13px;
  line-height: 1.7;
  color: #64748b;
}
.step-response-empty-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.step-response-empty-metric {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #e6ebf5;
  background: rgba(255, 255, 255, 0.9);
}
.step-response-empty-metric span {
  font-size: 12px;
  color: #64748b;
}
.step-response-empty-metric strong {
  font-size: 18px;
  font-weight: 700;
  color: #1f2a44;
}
.step-response-empty-tip {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.12);
  font-size: 12px;
  line-height: 1.7;
  color: #47607d;
}
.step-response-kv-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 8px;
  overflow: auto;
}
.step-response-kv-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
}
.step-response-k {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  word-break: break-word;
}
.step-response-v {
  font-size: 12px;
  color: #475569;
  word-break: break-word;
}
.step-assert-card {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
}
.step-assert-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.step-assert-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}
.step-assert-pill {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.step-assert-pill.is-pass {
  color: #15803d;
  background: rgba(34, 197, 94, 0.12);
}
.step-assert-pill.is-fail {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.1);
}
.step-assert-help {
  margin-top: 10px;
  font-size: 12px;
  color: #64748b;
}
.step-assert-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 8px;
  margin-top: 12px;
  overflow: auto;
}
.step-assert-empty {
  flex: 1;
  min-height: 0;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 18px;
  border-radius: 14px;
  border: 1px dashed #dbe4f3;
  background: linear-gradient(180deg, #fbfdff 0%, #f7faff 100%);
}
.step-assert-list-item {
  display: grid;
  grid-template-columns: 120px 60px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
}
.step-assert-item-name {
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
}
.step-assert-item-msg {
  min-width: 0;
  font-size: 12px;
  color: #64748b;
  word-break: break-all;
}
.step-purple-btn {
  background: #7d33ff !important;
  border-color: #7d33ff !important;
}
.step-req-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 0;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e6ebf5;
  background: rgba(255, 255, 255, 0.92);
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  position: sticky;
  top: 0;
  z-index: 2;
  backdrop-filter: blur(8px);
}
.step-req-method-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}
.step-req-url-input {
  flex: 1;
  min-width: 200px;
}
.step-config-tabs {
  flex: 1;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e6ebf5;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.04);
  position: relative;
}
.step-config-tabs :deep(.n-tabs-nav) {
  margin-bottom: 0;
  padding: 0 16px;
  border-bottom: 1px solid #eef2f7;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(251, 252, 255, 0.96) 0%, rgba(247, 250, 255, 0.9) 100%);
}
.step-config-tabs :deep(.n-tabs-nav-scroll-wrapper) {
  min-width: 0;
}
.step-config-tabs :deep(.n-tabs-wrapper) {
  flex: 1;
  min-height: 0;
}
.step-config-tabs :deep(.n-tabs-pane-wrapper) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.step-config-tabs :deep(.n-tab-pane) {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.step-config-tabs :deep(.n-tabs-content) {
  height: 100%;
  min-height: 0;
}
.step-tab-pane-inner {
  height: 100%;
  min-height: 0;
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  overflow: auto;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(250, 252, 255, 0.96) 100%);
}
.step-tab-pane-inner :deep(.n-empty) {
  margin: 0;
  flex: 1;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px 20px;
  border: 1px dashed #dbe4f3;
  border-radius: 16px;
  background: linear-gradient(180deg, #fbfcff 0%, #f7faff 100%);
}
.step-tab-pane-inner :deep(.n-empty .n-empty__description) {
  color: #64748b;
  line-height: 1.7;
}
.step-tab-pane-inner > .step-mini-table,
.step-tab-pane-inner > .step-auth-pane,
.step-tab-pane-inner > .step-inline-op-list,
.step-tab-pane-inner > .step-post-other-table,
.step-tab-pane-inner > .step-utility-panel {
  width: 100%;
}
.step-utility-panel--scroll {
  min-height: 0;
  overflow: auto;
  border: 1px solid #e6ebf5;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.04);
  padding: 16px;
}
.step-auth-pane {
  border: 1px solid #e6ebf5;
  border-radius: 14px;
  background: #fbfcff;
  padding: 14px;
}
.step-auth-head {
  margin-bottom: 14px;
}
.step-auth-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}
.step-auth-desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.6;
}
.step-auth-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.step-auth-card {
  border-radius: 14px;
  padding: 14px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.18s ease;
}
.step-auth-card strong {
  font-size: 14px;
  color: #1f2937;
}
.step-auth-card span {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
}
.step-auth-card.active {
  border-color: #8b5cf6;
  box-shadow: inset 0 0 0 1px rgba(139, 92, 246, 0.12);
  background: linear-gradient(180deg, #f7f3ff 0%, #ffffff 100%);
}
.step-auth-note {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed #dbe4f3;
  font-size: 12px;
  color: #64748b;
  line-height: 1.6;
}
.step-auth-form {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}
.step-pre-pane,
.step-post-pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  overflow: hidden;
}
.step-panel-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #e6ebf5;
  border-radius: 14px;
  background: linear-gradient(180deg, #fbfcff 0%, #ffffff 100%);
}
.step-panel-section-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}
.step-panel-section-desc {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.55;
  color: #64748b;
}
.step-panel-section-count,
.step-panel-mini-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(125, 51, 255, 0.08);
  border: 1px solid rgba(125, 51, 255, 0.16);
  color: #7d33ff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.step-panel-section-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
.step-pre-quick-add,
.step-post-add-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.step-inline-op-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}
.step-inline-op-card {
  border: 1px solid #e6ebf5;
  border-radius: 12px;
  padding: 12px;
  background: #fbfcff;
}
.step-inline-op-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.step-inline-op-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.step-inline-op-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
}
.step-inline-op-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.step-inline-op-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.step-inline-op-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.step-inline-op-grid.two-cols {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.step-inline-op-grid.three-cols {
  grid-template-columns: 160px 140px minmax(0, 1fr);
}
.step-inline-op-hint {
  display: flex;
  align-items: center;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
}
.step-wizard-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.step-wizard-headline {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.step-wizard-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}
.step-wizard-subtitle,
.step-wizard-footer-tip {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
}
.step-wizard-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.step-wizard-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  text-align: left;
  transition: all 0.2s ease;
}
.step-wizard-card:hover {
  border-color: #8b5cf6;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(139, 92, 246, 0.12);
}
.step-wizard-card strong {
  font-size: 14px;
  color: #1f2937;
}
.step-wizard-card span {
  font-size: 12px;
  color: #64748b;
  line-height: 1.6;
}
.step-utility-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  border: 1px solid #e6ebf5;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}
.step-utility-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.step-utility-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}
.step-utility-grid {
  display: grid;
  gap: 12px;
}
.step-utility-grid.two-cols {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.step-utility-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.step-post-pane .step-post-other-empty {
  margin-top: 12px;
}
.step-post-pane .step-post-other-table {
  margin-top: 12px;
}
.step-validate-response-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px 16px;
  padding: 12px 14px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 10px;
}
.step-vr-left {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.step-vr-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1f36;
}
.step-vr-help-wrap {
  display: inline-flex;
  cursor: help;
  color: #8c8c8c;
  line-height: 1;
}
.step-vr-help {
  font-size: 15px;
}
.step-vr-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.step-vr-select-enable {
  width: 100px;
}
.step-vr-select-status {
  width: 148px;
}
.step-body-type-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-bottom: 10px;
}
.step-body-editor-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.step-body-textarea {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}
.step-mini-table {
  font-size: 12px;
}
.step-cell-muted {
  color: #8792a2;
  font-size: 11px;
  word-break: break-all;
}
@media (max-width: 1680px) {
  .step-drawer-split {
    padding-top: 10px;
  }
}
@media (max-width: 1360px) {
  .step-list-sidebar {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto auto minmax(0, 1fr);
    row-gap: 0;
  }
  .step-toolbar-action-row,
  .step-toolbar-action-row.secondary {
    grid-column: 1;
    margin-left: 12px;
    padding-left: 12px;
    padding-right: 12px;
  }
  .step-stat-grid {
    grid-column: 1;
    grid-row: 4;
    padding: 12px;
    border-bottom: 1px solid #eaecf4;
  }
  .step-recent-fail {
    grid-row: 5;
  }
  .step-list-scrollbar {
    grid-row: 6;
  }
  .step-stat-card {
    min-height: 72px;
  }
  .step-detail-fixed-drawer {
    top: var(--header-height, 56px);
    left: auto;
    right: 8px;
    bottom: 0;
    width: min(100%, 520px);
    max-width: calc(100vw - 16px);
    min-width: 0;
    padding: 0;
  }
  .step-toolbar-spotlight {
    grid-template-columns: 1fr;
  }
  .step-editor-shell {
    margin: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
  }
  .step-editor-bottom {
    min-height: 0;
  }
  .step-response-side {
    min-height: 0;
    padding: 12px 18px 18px;
  }
  .step-response-toolbar {
    align-items: flex-start;
  }
  .step-response-tabs-mini {
    justify-content: flex-start;
  }
  .step-editor-main {
    min-height: 0;
  }
  .step-req-toolbar {
    position: static;
    backdrop-filter: none;
  }
  .step-detail-drawer-backbar {
    padding: 12px 14px 0;
  }
  .step-overview-card--top {
    margin: 8px 14px 12px;
  }
  .step-overview-head {
    flex-direction: column;
    align-items: stretch;
  }
  .step-overview-env {
    align-items: stretch;
  }
  .step-overview-env-actions {
    width: 100%;
  }
  .step-overview-env-actions :deep(.n-base-selection) {
    flex: 1;
  }
  .step-panel-section-head {
    flex-direction: column;
  }
  .step-panel-section-tags {
    justify-content: flex-start;
  }
}
.detail-steps-head {
  margin-top: 28px;
  margin-bottom: 12px;
}
.detail-steps-count {
  font-size: 14px;
  font-weight: 600;
  color: #3c4257;
}
.detail-steps-empty {
  border: 2px dashed #e0e4ef;
  border-radius: 12px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #fafbfc;
}
.detail-steps-empty-inner {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}
.detail-steps-panel {
  border: 1px solid #e8eaef;
  border-radius: 12px;
  background: #fafbfc;
  padding: 12px 12px 14px;
}
.detail-steps-list {
  margin-bottom: 12px;
  max-height: 320px;
  overflow-y: auto;
}
.detail-step-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #eaecf4;
  border-radius: 8px;
  margin-bottom: 8px;
}
.detail-step-row:last-child {
  margin-bottom: 0;
}
.detail-step-order {
  font-size: 13px;
  font-weight: 600;
  color: #7d33ff;
  min-width: 22px;
  line-height: 1.4;
}
.detail-step-main {
  flex: 1;
  min-width: 0;
}
.detail-step-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a1f36;
  line-height: 1.4;
  word-break: break-word;
}
.detail-step-meta {
  display: block;
  font-size: 12px;
  color: #a0aab8;
  margin-top: 4px;
}
.detail-steps-add-wrap {
  display: flex;
  justify-content: flex-start;
  padding-top: 4px;
}

.import-debug-modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1f36;
}
.import-debug-modal-sub {
  font-size: 12px;
  color: #a0aab8;
  margin-top: 4px;
  font-weight: normal;
}
.import-debug-search {
  margin-bottom: 12px;
}
.import-debug-spin {
  min-height: 200px;
}
.import-case-modal-spin {
  min-height: 400px;
}
.import-case-modal-body {
  display: flex;
  gap: 14px;
  min-height: 420px;
  align-items: stretch;
}
.import-case-tree-pane {
  width: 268px;
  flex-shrink: 0;
  border: 1px solid #eaecf4;
  border-radius: 10px;
  padding: 10px 10px 8px;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.import-pane-head {
  font-size: 13px;
  font-weight: 600;
  color: #3c4257;
  margin-bottom: 8px;
}
.import-tree-search {
  margin-bottom: 8px;
}
.import-tree-scroll {
  flex: 1;
  min-height: 280px;
  max-height: 440px;
}
.import-modal-tree {
  font-size: 13px;
}
.import-tree-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  width: 100%;
}
.import-tree-method {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  flex-shrink: 0;
  line-height: 1.35;
}
.import-tree-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}
.import-tree-folder-row {
  font-size: 13px;
  font-weight: 500;
}
.import-tree-count {
  color: #a0aab8;
  font-weight: 400;
}
.import-case-list-pane {
  flex: 1;
  min-width: 0;
  border: 1px solid #eaecf4;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
  display: flex;
  flex-direction: column;
  min-height: 420px;
}
.import-case-pane-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0aab8;
  font-size: 13px;
  padding: 28px 20px;
  text-align: center;
  line-height: 1.65;
}
.import-interface-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f2f6;
}
.import-if-method {
  flex-shrink: 0;
}
.import-if-title {
  font-weight: 600;
  color: #1a1f36;
  font-size: 14px;
}
.import-if-path {
  font-size: 12px;
  color: #64748b;
  word-break: break-all;
}
.import-cat-tabs {
  margin-bottom: 8px;
}
.import-cat-tabs :deep(.n-tabs-nav) {
  margin-bottom: 0;
}
.import-case-list-search {
  margin-bottom: 10px;
}
.import-cases-inner-spin {
  flex: 1;
  min-height: 180px;
}
.import-case-list-empty {
  padding: 36px 16px;
}
.import-case-table-wrap {
  overflow: auto;
  max-height: 340px;
  border: 1px solid #eaecf4;
  border-radius: 8px;
}
.import-case-n-table {
  width: 100%;
}
.import-case-n-table .ict-col-check {
  width: 44px;
  text-align: center;
}
.import-case-n-table .ict-col-idx {
  width: 40px;
  color: #8792a2;
  font-size: 12px;
}
.import-case-n-table .ict-col-name {
  max-width: 280px;
  word-break: break-word;
}
.import-case-n-table .ict-col-group {
  width: 72px;
  color: #64748b;
  font-size: 12px;
}
.import-case-n-table .ict-col-result {
  width: 88px;
  color: #a0aab8;
  font-size: 12px;
}
.import-case-tr:hover {
  background: #faf8ff;
}
.ict-result-dash {
  color: #c0c8d8;
}
.import-debug-empty {
  padding: 48px 16px;
  text-align: center;
  color: #a0aab8;
  font-size: 13px;
}
.import-debug-table-wrap {
  border: 1px solid #eaecf4;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.import-debug-thead {
  display: grid;
  grid-template-columns: 40px 72px 1fr 1.2fr 1.4fr;
  gap: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #a0aab8;
  background: #f6f7fa;
  border-bottom: 1px solid #eaecf4;
}
.import-debug-tbody {
  max-height: 360px;
  overflow-y: auto;
}
.import-debug-tr {
  display: grid;
  grid-template-columns: 40px 72px 1fr 1.2fr 1.4fr;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  font-size: 13px;
  color: #3c4257;
  border-bottom: 1px solid #f0f2f6;
  cursor: pointer;
  margin: 0;
}
.import-debug-tr:last-child {
  border-bottom: none;
}
.import-debug-tr:hover {
  background: #faf8ff;
}
.idc-col-check {
  display: flex;
  align-items: center;
  justify-content: center;
}
.idc-col-method,
.idc-col-api,
.idc-col-path,
.idc-col-case {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.idc-method {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1.3;
}
.import-debug-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}
.import-debug-hint {
  font-size: 13px;
  color: #64748b;
}
.import-debug-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
.add-step-btn {
  border-color: #7d33ff !important;
  color: #7d33ff !important;
}

/* 从接口导入：选中列表行 */
.import-api-selected-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f2f8;
}
.import-api-selected-row:last-child {
  border-bottom: none;
}
.import-api-sel-info {
  flex: 1;
  min-width: 0;
}
.import-api-sel-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a1f36;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.import-api-sel-path {
  font-size: 11px;
  color: #a0aab8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* cURL 解析预览 */
.curl-preview-box {
  padding: 14px;
  background: #f8f9ff;
  border: 1px solid #e8eaf0;
  border-radius: 8px;
}
.curl-preview-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 13px;
}
.curl-preview-row:last-child {
  margin-bottom: 0;
}
.curl-preview-label {
  width: 56px;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: #a0aab8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.curl-preview-val {
  color: #1a1f36;
  font-size: 12px;
  font-family: monospace;
  word-break: break-all;
}

/* HTTP 步骤保存按钮 */
.step-save-cfg-btn {
  flex-shrink: 0;
  border-color: #7d33ff !important;
  color: #7d33ff !important;
  background: transparent !important;
}

:deep(.add-step-popover-trigger) {
  display: inline-flex;
}

.add-step-menu {
  width: 400px;
  max-width: calc(100vw - 48px);
  max-height: min(72vh, 560px);
  overflow-y: auto;
  padding: 14px 14px 10px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.12), 0 0 1px rgba(15, 23, 42, 0.08);
}
.add-step-section {
  margin-bottom: 4px;
}
.add-step-section:last-child {
  margin-bottom: 0;
}
.add-step-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #a0aab8;
  letter-spacing: 0.3px;
  margin: 0 0 10px 2px;
}
.add-step-section:first-child .add-step-section-title {
  margin-top: 0;
}
.add-step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #e8eaef;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  margin-bottom: 8px;
  min-height: 44px;
  box-sizing: border-box;
}
.add-step-item:hover {
  border-color: rgba(125, 51, 255, 0.45);
  background: #faf8ff;
  box-shadow: 0 2px 8px rgba(125, 51, 255, 0.08);
}
.add-step-item-full {
  width: 100%;
}
.add-step-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.add-step-grid .add-step-item {
  margin-bottom: 0;
}
.add-step-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
.add-step-label {
  font-size: 13px;
  font-weight: 500;
  color: #1a1f36;
  line-height: 1.35;
  text-align: left;
}
.step-icon-purple { background: linear-gradient(135deg, #7d33ff, #a855f7); }
.step-icon-amber { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.step-icon-blue { background: linear-gradient(135deg, #0ea5e9, #38bdf8); }
.step-icon-slate { background: linear-gradient(135deg, #64748b, #94a3b8); }
.step-icon-green { background: linear-gradient(135deg, #22c55e, #4ade80); }
.step-icon-pink { background: linear-gradient(135deg, #ec4899, #f472b6); }
.step-icon-orange { background: linear-gradient(135deg, #f97316, #fb923c); }
.step-icon-cyan { background: linear-gradient(135deg, #0891b2, #22d3ee); }
.step-icon-violet { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
.step-icon-sky { background: linear-gradient(135deg, #0284c7, #38bdf8); }
/* ── 表格区域 ── */
.table-wrap {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 16px 24px 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eaecf4;
  box-shadow: 0 2px 16px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.table-title-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 20px 12px;
  border-bottom: 1px solid #f0f2f7;
  flex-shrink: 0;
}
.table-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.table-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1f36;
}
.table-count {
  font-size: 12px;
  color: #a0aab8;
}
.table-count b { color: #7d33ff; }

.batch-select-line {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #3c4257;
}
.batch-select-text b {
  color: #7d33ff;
  font-weight: 700;
}

.batch-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  padding: 8px 12px;
  background: #faf8ff;
  border: 1px solid #ede7fc;
  border-radius: 8px;
}
.batch-tool-btn {
  font-size: 13px !important;
  color: #3c4257 !important;
}
.batch-tool-danger {
  color: #cf1322 !important;
}
.batch-toolbar-close {
  margin-left: auto;
  color: #a0aab8 !important;
}

/* 表格列定义 */
/* 表格列定义 */
.t-head, .t-row {
  display: grid;
  grid-template-columns: 44px 1fr 72px 90px 120px 100px 110px 100px;
  align-items: center;
  padding: 0 16px;
  gap: 6px;
}

.tc-check {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 44px;
  flex-shrink: 0;
}

.t-head {
  background: #fafbfc;
  border-bottom: 1px solid #f0f2f7;
  font-size: 12px;
  color: #8792a2;
  font-weight: 600;
  min-height: 42px;
  flex-shrink: 0;
  letter-spacing: 0.2px;
}

.t-row {
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer;
  transition: background 0.12s;
  min-height: 56px;
  font-size: 13px;
  color: #3c4257;
}
.t-row:last-child { border-bottom: none; }
.t-row:hover { background: #faf8ff; }
.t-row.selected { background: rgba(125,51,255,0.04); }

/* 场景名称列 */
.row-name-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.row-name {
  font-weight: 600;
  color: #1a1f36;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  transition: color 0.15s;
}
.row-desc {
  font-size: 11px;
  color: #a0aab8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 优先级 badge */
.p-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
}
.p-badge::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.p-badge.p0 { background: #fff1f0; color: #cf1322; }
.p-badge.p0::before { background: #ff4d4f; box-shadow: 0 0 4px rgba(255,77,79,0.5); }
.p-badge.p1 { background: #fff7e6; color: #d46b08; }
.p-badge.p1::before { background: #fa8c16; box-shadow: 0 0 4px rgba(250,140,22,0.5); }
.p-badge.p2 { background: #feffe6; color: #7c6e00; }
.p-badge.p2::before { background: #fadb14; box-shadow: 0 0 4px rgba(250,219,20,0.5); }
.p-badge.p3 { background: #f6ffed; color: #389e0d; }
.p-badge.p3::before { background: #52c41a; box-shadow: 0 0 4px rgba(82,196,26,0.5); }

/* 标签 */
.tag-chip {
  background: #f0f2f7;
  color: #5c6676;
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 10px;
  white-space: nowrap;
}

/* 环境 */
.env-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #e6f7ff;
  color: #096dd9;
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 10px;
  border: 1px solid #bae7ff;
  white-space: nowrap;
}

/* 运行结果 */
.r-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 10px;
  white-space: nowrap;
}
.r-badge.passed  { background: #f6ffed; color: #389e0d; border: 1px solid #b7eb8f; }
.r-badge.failed  { background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e; }
.r-badge.running { background: #e6f7ff; color: #096dd9; border: 1px solid #91d5ff; }

/* 创建人 */
.creator-wrap {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: #5c6676;
}
.creator-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7d33ff, #5b21b6);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dash { color: #d0d5e0; font-size: 14px; }

.tc-name {
  cursor: pointer;
}
.tc-name:hover .row-name {
  color: #7d33ff;
}

/* 空状态 */
.t-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 12px;
}
.empty-illustration { margin-bottom: 4px; }
.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #3c4257;
}
.empty-desc {
  font-size: 13px;
  color: #a0aab8;
}
.new-btn-inline {
  margin-top: 4px;
  background: linear-gradient(135deg, #7d33ff, #5b21b6) !important;
  border: none !important;
  border-radius: 7px !important;
  box-shadow: 0 3px 10px rgba(125,51,255,0.3) !important;
}

/* ════════════════════════════════════════
   欢迎页 — 与 InterfaceTest 欢迎页同构（布局 / 动效）
════════════════════════════════════════ */
.it-fade-enter-active,
.it-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.it-fade-enter-from,
.it-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.welcome-container {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  background: #f0f2f5;
  overflow: auto;
  padding: 20px;
  box-sizing: border-box;
}

.it-welcome-wrap {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

/* Hero（同心环 + 浮动图标，与 InterfaceTest 一致） */
.it-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  text-align: center;
}

.it-hero-glow-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: it-ring-pulse 3s ease-in-out infinite;
}

.it-hero-ring-1 {
  width: 120px;
  height: 120px;
  animation-delay: 0s;
}

.it-hero-ring-2 {
  width: 180px;
  height: 180px;
  animation-delay: 0.5s;
  border-color: rgba(var(--color-primary-rgb), 0.1);
}

.it-hero-ring-3 {
  width: 240px;
  height: 240px;
  animation-delay: 1s;
  border-color: rgba(var(--color-primary-rgb), 0.06);
}

@keyframes it-ring-pulse {
  0%,
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1.06);
  }
}

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
  box-shadow:
    0 8px 24px rgba(var(--color-primary-rgb), 0.35),
    0 0 0 8px rgba(var(--color-primary-rgb), 0.1);
  animation: it-icon-float 3.5s ease-in-out infinite;
}

@keyframes it-icon-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.it-hero-icon {
  animation: it-icon-spin 8s linear infinite;
}

@keyframes it-icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
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
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.it-hero-btn :deep(.n-icon) {
  display: inline-flex;
  align-items: center;
}

.it-hero-btn--primary {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400));
  color: #fff;
  box-shadow: 0 4px 14px rgba(var(--color-primary-rgb), 0.35);
}

.it-hero-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(var(--color-primary-rgb), 0.45);
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

/* 统计行 */
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
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: default;
}

.it-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.09);
}

.it-stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 12px 12px 0 0;
}

.it-stat-card--blue {
  --accent: rgba(59, 130, 246, 0.12);
  --ico: #2563eb;
}
.it-stat-card--green {
  --accent: rgba(34, 197, 94, 0.12);
  --ico: #16a34a;
}
.it-stat-card--amber {
  --accent: rgba(251, 191, 36, 0.14);
  --ico: #d97706;
}
.it-stat-card--purple {
  --accent: rgba(139, 92, 246, 0.12);
  --ico: #7c3aed;
}
.it-stat-card--rose {
  --accent: rgba(244, 63, 94, 0.12);
  --ico: #e11d48;
}

.it-stat-card--blue::before {
  background: #3b82f6;
}
.it-stat-card--green::before {
  background: #22c55e;
}
.it-stat-card--amber::before {
  background: #f59e0b;
}
.it-stat-card--purple::before {
  background: #8b5cf6;
}
.it-stat-card--rose::before {
  background: #f43f5e;
}

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

.it-stat-trend--up {
  color: #16a34a;
}
.it-stat-trend--down {
  color: #dc2626;
}

/* 功能卡片区 */
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
  cursor: default;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  border: 1px solid transparent;
}

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
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb), 0.07) 0%,
    rgba(139, 92, 246, 0.04) 100%
  );
}

.it-feat-card--mock .it-feat-card-bg {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.07) 0%, rgba(59, 130, 246, 0.04) 100%);
}

.it-feat-card--env .it-feat-card-bg {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.07) 0%, rgba(5, 150, 105, 0.04) 100%);
}

.it-feat-card--debug:hover {
  border-color: rgba(var(--color-primary-rgb), 0.2);
}
.it-feat-card--mock:hover {
  border-color: rgba(6, 182, 212, 0.2);
}
.it-feat-card--env:hover {
  border-color: rgba(16, 185, 129, 0.2);
}

.it-feat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

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

.it-feat-card--debug .it-feat-icon-wrap {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary-500);
}
.it-feat-card--mock .it-feat-icon-wrap {
  background: rgba(6, 182, 212, 0.1);
  color: #0891b2;
}
.it-feat-card--env .it-feat-icon-wrap {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

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
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.it-feat-card:hover .it-feat-arrow {
  color: #9ca3af;
  transform: translateX(3px);
}

@media (max-width: 860px) {
  .it-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .it-feature-row {
    grid-template-columns: 1fr;
  }
}

/* ════════════════════════════════════════
   测试报告视图
════════════════════════════════════════ */
.rpt-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rpt-scope-tabs {
  display: flex;
  background: #f0f2f7;
  border-radius: 7px;
  padding: 3px;
  gap: 2px;
}
.rpt-scope-btn {
  padding: 4px 14px;
  border: none;
  background: none;
  border-radius: 5px;
  font-size: 13px;
  color: #8792a2;
  cursor: pointer;
  transition: all 0.15s;
  font-weight: 500;
}
.rpt-scope-btn.active {
  background: #fff;
  color: #1a1f36;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.rpt-spin-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.arc-root { padding: 0 4px 8px; }
.arc-summary-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.arc-meta { font-size: 12px; color: #8792a2; margin-left: 4px; }
.arc-entry {
  border: 1px solid #eaecf4;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
  background: #fafbff;
}
.arc-entry-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.arc-pass { font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }
.arc-pass.ok { color: #16a34a; background: #f0fdf4; }
.arc-pass.bad { color: #dc2626; background: #fef2f2; }
.arc-name { font-weight: 600; color: #1a1f36; flex: 1; min-width: 0; }
.arc-code { font-family: ui-monospace, monospace; font-size: 12px; color: #4f5b76; }
.arc-ms { font-size: 12px; color: #8792a2; }
.arc-url {
  font-size: 12px;
  color: #697386;
  margin-top: 6px;
  word-break: break-all;
}
.arc-body-snippet {
  margin: 8px 0 0;
  padding: 8px 10px;
  background: #1a1f36;
  color: #e8eaef;
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.45;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}
.arc-err { margin-top: 8px; font-size: 12px; color: #dc2626; }

.batch-run-body { padding: 4px 0 8px; }
.batch-run-hint {
  font-size: 13px;
  color: #697386;
  line-height: 1.55;
  margin-bottom: 16px;
}
.batch-run-phase {
  font-size: 15px;
  font-weight: 600;
  color: #1a1f36;
  margin-bottom: 4px;
}
.batch-run-detail {
  font-size: 12px;
  color: #8792a2;
  margin-bottom: 12px;
}
.batch-run-result {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.batch-run-sc-count { font-size: 12px; color: #a0aab8; }

.rpt-table-wrap {
  flex: 1;
  margin: 0 24px 20px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #eaecf4;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.rpt-head {
  display: grid;
  grid-template-columns: 1fr 140px 220px 80px;
  padding: 0 20px;
  min-height: 42px;
  align-items: center;
  background: #fafbfc;
  border-bottom: 1px solid #f0f2f7;
  font-size: 12px;
  color: #8792a2;
  font-weight: 600;
  flex-shrink: 0;
}
.rpt-col-status { display: flex; align-items: center; }
.rpt-row {
  display: grid;
  grid-template-columns: 1fr 140px 220px 80px;
  padding: 12px 20px;
  align-items: center;
  border-bottom: 1px solid #f5f7fa;
  transition: background 0.12s;
  min-height: 60px;
}
.rpt-row:hover { background: #fafbff; }
.rpt-row:last-child { border-bottom: none; }

.rpt-name-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.rpt-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1f36;
}
.rpt-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #a0aab8;
  flex-wrap: wrap;
}
.rpt-meta span::after { content: ''; }

.rpt-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}
.rpt-status-badge.done { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.rpt-status-badge.running { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
.rpt-status-badge.failed { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

.rpt-result-line {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.8;
}
.rpt-success { color: #16a34a; font-weight: 600; }
.rpt-fail    { color: #dc2626; font-weight: 600; }
.rpt-skip    { color: #a0aab8; font-weight: 600; }

.rpt-col-op {
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.15s;
}
.rpt-row:hover .rpt-col-op { opacity: 1; }

.rpt-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 0;
}
.rpt-empty-icon {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: #f5f6fb;
  display: flex; align-items: center; justify-content: center;
}
.rpt-empty-text { font-size: 14px; color: #a0aab8; }

/* ════════════════════════════════════════
   定时任务视图
════════════════════════════════════════ */
.runner-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 24px;
  padding: 10px 16px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  font-size: 13px;
  color: #7c5800;
  flex-shrink: 0;
}
.runner-link {
  color: #7d33ff;
  text-decoration: none;
  font-weight: 500;
}
.runner-link:hover { text-decoration: underline; }

.scheduled-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px 10px;
  flex-shrink: 0;
}
.new-btn-scheduled {
  background: #7d33ff !important;
  border-color: #7d33ff !important;
  border-radius: 7px !important;
}

.scheduled-table {
  flex: 1;
  margin: 0 24px 20px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #eaecf4;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.st-head {
  display: grid;
  grid-template-columns: 1fr 120px 200px;
  padding: 0 20px;
  min-height: 42px;
  align-items: center;
  background: #fafbfc;
  border-bottom: 1px solid #f0f2f7;
  font-size: 12px;
  color: #8792a2;
  font-weight: 600;
  flex-shrink: 0;
}
.st-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 0;
}
.st-empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f5f6fb;
  display: flex;
  align-items: center;
  justify-content: center;
}
.st-empty-text {
  font-size: 14px;
  color: #a0aab8;
}
.st-empty-link {
  font-size: 13px;
  color: #7d33ff;
  text-decoration: none;
}
.st-empty-link:hover { text-decoration: underline; }

/* 弹窗 header */
.modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1f36;
}
.modal-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}
.modal-icon.create { background: rgba(125,51,255,0.1); color: #7d33ff; }
.modal-icon.edit   { background: rgba(22,119,255,0.1); color: #1677ff; }
</style>
