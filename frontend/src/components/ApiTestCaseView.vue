<template>
  <div class="api-test-case-container">
    <!-- 1. 顶部分类 Tabs -->
    <div class="test-case-header">
      <div class="category-tabs-wrapper">
        <n-tabs type="line" class="category-tabs" v-model:value="activeCategory">
          <n-tab-pane name="all" :tab="`全部 (${counts.all})`" />
          <n-tab-pane name="positive" :tab="`正向 (${counts.positive})`" />
          <n-tab-pane name="negative" :tab="`负向 (${counts.negative})`" />
          <n-tab-pane name="boundary" :tab="`边界值 (${counts.boundary})`" />
          <n-tab-pane name="security" :tab="`安全性 (${counts.security})`" />
          <n-tab-pane name="other" :tab="`其他 (${counts.other})`" />
        </n-tabs>
        <n-button quaternary circle size="small" class="settings-btn">
          <template #icon><n-icon :component="SettingOutlined" /></template>
        </n-button>
      </div>
      <div class="history-link">
        <n-button text size="small" class="test-report-btn">
          <template #icon><n-icon :component="HistoryOutlined" /></template>
          测试报告
        </n-button>
      </div>
    </div>

    <!-- 2. 操作栏 -->
    <div class="action-toolbar">
      <div class="search-group">
        <n-input v-model:value="searchPattern" placeholder="搜索" size="small" class="search-input">
          <template #prefix><n-icon :component="SearchOutlined" /></template>
        </n-input>
        <n-button quaternary size="small">
          <template #icon><n-icon :component="FilterOutlined" /></template>
        </n-button>
      </div>
      <n-space :size="12">
        <n-button secondary size="small" class="ai-gen-btn" @click="openAiModal">
          <template #icon><n-icon :component="ThunderboltOutlined" /></template>
          AI 生成用例
        </n-button>
        <n-button-group size="small">
          <n-button secondary @click="openAddModal">
            <template #icon><n-icon :component="PlusOutlined" /></template>
            添加用例
          </n-button>
          <n-button secondary style="padding: 0 4px">
            <template #icon><n-icon :component="DownOutlined" /></template>
          </n-button>
        </n-button-group>
        <n-button type="primary" color="#1a1f36" size="small" class="run-all-btn">
          <template #icon><n-icon :component="CaretRightOutlined" /></template>
          全部运行
        </n-button>
      </n-space>
    </div>

    <!-- 3. 用例列表 -->
    <div class="test-case-list">
      <n-table :single-line="false" size="small" class="case-table">
        <thead>
          <tr>
            <th class="col-check"><n-checkbox /></th>
            <th class="col-index">#</th>
            <th class="col-name">名称</th>
            <th class="col-group">分组</th>
            <th class="col-result">运行结果</th>
            <th class="col-action"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(item, index) in filteredCases" :key="item.id">
            <tr 
              :class="['case-row', { expanded: expandedId === item.id }]"
              @click="toggleExpand(item.id)"
            >
              <td class="col-check" @click.stop><n-checkbox /></td>
              <td class="col-index">{{ index + 1 }}</td>
              <td class="col-name">
                <div class="name-content">
                  <span class="case-title">{{ item.name }}</span>
                  <div class="case-right-actions">
                    <n-button 
                      v-if="item.id"
                      size="tiny" 
                      type="primary" 
                      color="#1a1f36" 
                      class="row-run-btn"
                      @click.stop="handleRun(item)"
                      :loading="item.running"
                    >
                      <template #icon><n-icon :component="CaretRightOutlined" /></template>
                      运行
                    </n-button>
                  </div>
                </div>
              </td>
              <td class="col-group">
                <span class="group-text">{{ item.groupLabel }}</span>
              </td>
              <td class="col-result">
                <div v-if="item.result === 'fail'" class="result-badge fail">
                  失败 {{ item.responseStatus || 401 }}
                </div>
                <div v-else-if="item.result === 'pass'" class="result-badge pass">
                  成功 {{ item.responseStatus || 200 }}
                </div>
                <span v-else class="result-placeholder">-</span>
              </td>
              <td class="col-action" @click.stop>
                <div class="row-hover-actions">
                  <n-icon :component="ShareAltOutlined" class="hover-icon" />
                  <n-icon :component="DeleteOutlined" class="hover-icon delete" @click="handleDelete(item)" />
                  <n-icon :component="EllipsisOutlined" class="hover-icon" />
                </div>
              </td>
            </tr>
            
            <!-- 展开详情区域 -->
            <tr v-if="expandedId === item.id" class="detail-row">
              <td colspan="6" class="detail-td">
                <div class="case-detail-container">
                  <!-- 详情头部 -->
                  <div class="detail-header">
                    <div class="header-left">
                      <span class="method-tag post">POST</span>
                      <n-icon :component="SyncOutlined" class="link-icon" />
                      <span class="path-text">/auth/oauth/token</span>
                      <div class="header-tags">
                        <n-tag size="tiny" :bordered="false" class="gray-tag">仅传必要字段</n-tag>
                        <n-tag size="tiny" :bordered="false" class="gray-tag">
                          <template #icon><n-icon :component="DatabaseOutlined" /></template>
                          测试数据
                        </n-tag>
                      </div>
                    </div>
                    <div class="header-right">
                      <n-button text size="tiny">
                        <template #icon><n-icon :component="SyncOutlined" /></template>
                        同步
                      </n-button>
                    </div>
                  </div>

                  <!-- 主体内容：左右分栏 -->
                  <div class="detail-body">
                    <!-- 左侧：请求参数 -->
                    <div class="request-panel">
                      <n-tabs type="line" size="small" class="detail-tabs">
                        <n-tab-pane name="params" :tab="`Params ${item.query_params?.length || 0}`">
                          <div class="params-content">
                            <div class="param-group-title">Query 参数</div>
                            <div class="param-table-simple">
                              <div class="param-row-header">
                                <div class="col-status"></div>
                                <div class="col-key">参数名</div>
                                <div class="col-val">参数值</div>
                                <div class="col-op"></div>
                              </div>
                              <div v-for="(p, pIdx) in (item.query_params || [])" :key="pIdx" class="param-row">
                                <div class="col-status"><n-icon :component="CheckCircleFilled" style="color: #52c41a" /></div>
                                <div class="col-key">{{ p.name }}</div>
                                <div class="col-val">= {{ p.example || p.value || '' }}</div>
                                <div class="col-op">
                                  <n-icon :component="MinusCircleOutlined" class="op-icon" />
                                  <n-icon :component="RightOutlined" class="op-icon" />
                                </div>
                              </div>
                              <div class="add-param-link">添加参数</div>
                            </div>
                          </div>
                        </n-tab-pane>
                        <n-tab-pane name="body" tab="Body">
                          <div class="params-content">
                            <div class="param-group-title">Request Body ({{ item.body_definition?.type || 'none' }})</div>
                            <div v-if="item.body_definition?.type === 'json'" class="body-json-view">
                              <pre class="json-pre">{{ item.body_definition?.content || '' }}</pre>
                            </div>
                            <n-empty v-else size="small" description="无 Body 内容" />
                          </div>
                        </n-tab-pane>
                        <n-tab-pane name="headers" :tab="`Headers ${item.header_params?.length || 0}`">
                          <div class="params-content">
                            <div class="param-group-title">Headers 参数</div>
                            <div class="param-table-simple">
                              <div class="param-row-header">
                                <div class="col-status"></div>
                                <div class="col-key">参数名</div>
                                <div class="col-val">参数值</div>
                                <div class="col-op"></div>
                              </div>
                              <div v-for="(p, pIdx) in (item.header_params || [])" :key="pIdx" class="param-row">
                                <div class="col-status"><n-icon :component="CheckCircleFilled" style="color: #52c41a" /></div>
                                <div class="col-key">{{ p.name }}</div>
                                <div class="col-val">= {{ p.example || p.value || '' }}</div>
                                <div class="col-op">
                                  <n-icon :component="MinusCircleOutlined" class="op-icon" />
                                  <n-icon :component="RightOutlined" class="op-icon" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </n-tab-pane>
                        <n-tab-pane name="cookies" tab="Cookies" />
                        <n-tab-pane name="auth" tab="Auth" />
                        <n-tab-pane name="pre" tab="前置操作" />
                        <n-tab-pane name="post" :tab="`后置操作 ${item.post_operations?.length || 0}`">
                          <div class="params-content">
                            <div v-for="(op, opIdx) in (item.post_operations || [])" :key="opIdx" class="post-op-item compact">
                              <div class="op-header">
                                <div class="op-title">
                                  <n-icon :component="CheckCircleFilled" class="op-status-icon" />
                                  <span class="op-type-text">提取变量</span>
                                  <span class="op-summary">
                                    <span class="op-name">{{ op.name }}</span>
                                    <span class="op-source">{{ op.expression }}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <n-empty v-if="!item.post_operations?.length" size="small" description="无后置操作" />
                          </div>
                        </n-tab-pane>
                        <n-tab-pane name="settings" tab="设置" />
                        <template #suffix>
                          <n-icon :component="CodeOutlined" class="tabs-extra-icon" />
                        </template>
                      </n-tabs>
                    </div>

                    <!-- 右侧：运行结果 -->
                    <div class="response-panel">
                      <div class="res-tabs-wrapper">
                        <n-tabs type="line" size="small" class="res-tabs">
                          <n-tab-pane name="body" tab="Body" />
                          <n-tab-pane name="cookie" tab="Cookie" />
                          <n-tab-pane name="header" :tab="`Header ${item.responseResult?.headers ? Object.keys(item.responseResult.headers).length : 0}`" />
                          <n-tab-pane name="assert" tab="断言" />
                        </n-tabs>
                        <div class="res-status-info">
                          <span class="status-code" :class="{ 'status-success': String(item.responseStatus).startsWith('2') }">
                            {{ item.responseStatus || '-' }}
                          </span>
                          <span class="res-time">{{ Math.round(item.responseTime || 0) }}ms</span>
                          <span class="res-size">0B</span>
                          <n-icon :component="ShareAltOutlined" class="share-icon" />
                          <div v-if="item.responseStatus && String(item.responseStatus).startsWith('2')" class="pass-tag">
                            <n-icon :component="CheckCircleFilled" />
                            成功
                          </div>
                          <div v-else-if="item.responseStatus" class="fail-tag">
                            <n-icon :component="CloseCircleFilled" />
                            失败
                          </div>
                        </div>
                      </div>
                      <div class="res-body-editor">
                        <div class="editor-toolbar">
                          <n-space :size="12">
                            <span class="toolbar-item">Pretty <n-icon :component="DownOutlined" /></span>
                            <span class="toolbar-item">Text <n-icon :component="DownOutlined" /></span>
                            <span class="toolbar-item">utf8 <n-icon :component="DownOutlined" /></span>
                            <n-icon :component="FilterOutlined" class="toolbar-icon" />
                          </n-space>
                          <n-space :size="12">
                            <n-icon :component="ArrowUpOutlined" class="toolbar-icon" />
                            <n-icon :component="DownloadOutlined" class="toolbar-icon" />
                            <n-icon :component="CopyOutlined" class="toolbar-icon" />
                            <n-icon :component="SearchOutlined" class="toolbar-icon" />
                          </n-space>
                        </div>
                        <div class="editor-content-area">
                          <div class="line-number">1</div>
                          <div class="editor-text">
                            <pre class="json-pre">{{ item.responseResult?.data ? JSON.stringify(item.responseResult.data, null, 2) : (item.responseResult ? JSON.stringify(item.responseResult, null, 2) : '') }}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </n-table>
    </div>

    <!-- AI 生成用例弹窗 -->
    <n-modal
      v-model:show="showAiModal"
      :mask-closable="true"
      :show-icon="false"
      :style="{ width: '560px', borderRadius: '12px', padding: '0' }"
      :bordered="false"
      class="ai-gen-modal"
      transform-origin="center"
    >
      <div class="ai-modal-wrap">
        <!-- 标题栏 -->
        <div class="ai-modal-titlebar">
          <n-icon :component="CloseOutlined" class="ai-close-btn" @click="showAiModal = false" />
          <span class="ai-modal-title-text">AI 生成测试用例</span>
        </div>

        <!-- 配置区（生成前） -->
        <div v-if="!aiGenerating && !aiCases.length" class="ai-config-body">
          <div class="ai-section-label">选择生成的用例类型</div>

          <!-- 正向 -->
          <div class="ai-category-block">
            <div class="ai-category-header">
              <span class="ai-category-name">正向</span>
              <div class="ai-select-all" @click="toggleCategoryAll('positive')">
                <n-icon :component="CheckCircleFilled" :class="['ai-check-icon', { checked: isCategoryAllSelected('positive') }]" />
                <span>全选</span>
              </div>
            </div>
            <div class="ai-tag-list">
              <div
                v-for="tag in scenarioMap.positive"
                :key="tag.key"
                :class="['ai-tag-item', { checked: selectedScenarios.has(tag.key) }]"
                @click="toggleScenario(tag.key)"
              >
                <n-icon :component="CheckCircleFilled" class="ai-tag-check" />
                <span>{{ tag.label }}</span>
              </div>
            </div>
          </div>

          <!-- 负向 -->
          <div class="ai-category-block">
            <div class="ai-category-header">
              <span class="ai-category-name">负向</span>
              <div class="ai-select-all" @click="toggleCategoryAll('negative')">
                <n-icon :component="CheckCircleFilled" :class="['ai-check-icon', { checked: isCategoryAllSelected('negative') }]" />
                <span>全选</span>
              </div>
            </div>
            <div class="ai-tag-list">
              <div
                v-for="tag in scenarioMap.negative"
                :key="tag.key"
                :class="['ai-tag-item', { checked: selectedScenarios.has(tag.key) }]"
                @click="toggleScenario(tag.key)"
              >
                <n-icon :component="CheckCircleFilled" class="ai-tag-check" />
                <span>{{ tag.label }}</span>
              </div>
            </div>
          </div>

          <!-- 边界值 -->
          <div class="ai-category-block">
            <div class="ai-category-header">
              <span class="ai-category-name">边界值</span>
              <div class="ai-select-all" @click="toggleCategoryAll('boundary')">
                <n-icon :component="CheckCircleFilled" :class="['ai-check-icon', { checked: isCategoryAllSelected('boundary') }]" />
                <span>全选</span>
              </div>
            </div>
            <div class="ai-tag-list">
              <div
                v-for="tag in scenarioMap.boundary"
                :key="tag.key"
                :class="['ai-tag-item', { checked: selectedScenarios.has(tag.key) }]"
                @click="toggleScenario(tag.key)"
              >
                <n-icon :component="CheckCircleFilled" class="ai-tag-check" />
                <span>{{ tag.label }}</span>
              </div>
            </div>
          </div>

          <!-- 安全性 -->
          <div class="ai-category-block">
            <div class="ai-category-header">
              <span class="ai-category-name">安全性</span>
              <div class="ai-select-all" @click="toggleCategoryAll('security')">
                <n-icon :component="CheckCircleFilled" :class="['ai-check-icon', { checked: isCategoryAllSelected('security') }]" />
                <span>全选</span>
              </div>
            </div>
            <div class="ai-tag-list">
              <div
                v-for="tag in scenarioMap.security"
                :key="tag.key"
                :class="['ai-tag-item', { checked: selectedScenarios.has(tag.key) }]"
                @click="toggleScenario(tag.key)"
              >
                <n-icon :component="CheckCircleFilled" class="ai-tag-check" />
                <span>{{ tag.label }}</span>
              </div>
            </div>
          </div>

          <!-- 额外要求 -->
          <div class="ai-extra-input">
            <n-input
              v-model:value="aiExtraRequirement"
              type="textarea"
              placeholder="输入更多要求"
              :autosize="{ minRows: 2, maxRows: 4 }"
              :bordered="true"
              class="ai-textarea"
            />
          </div>

          <!-- 生成按钮 -->
          <div class="ai-generate-btn-wrap">
            <n-button
              type="primary"
              block
              size="large"
              class="ai-generate-btn"
              :disabled="selectedScenarios.size === 0"
              @click="handleAiGenerate"
            >
              <template #icon><n-icon :component="ThunderboltOutlined" /></template>
              生成
            </n-button>
          </div>

          <!-- 底部信息栏 -->
          <div class="ai-modal-footer-bar">
            <span class="ai-footer-link">高级设置 1 <n-icon :component="RightOutlined" /></span>
            <div class="ai-footer-meta">
              <span>用例数：自动</span>
              <span>简体中文</span>
              <span>DeepSeek V3.2 T...</span>
            </div>
          </div>
        </div>

        <!-- 生成中 -->
        <div v-if="aiGenerating" class="ai-loading-area">
          <n-spin size="large" />
          <div class="ai-loading-text">DeepSeek 正在分析接口并生成用例...</div>
          <div class="ai-loading-sub">通常需要 10~30 秒，请稍候</div>
        </div>

        <!-- 生成完成：预览列表 -->
        <div v-if="!aiGenerating && aiCases.length" class="ai-result-area">
          <div class="ai-result-header">
            <span class="ai-result-count">已生成 <b>{{ aiCases.length }}</b> 条用例</span>
            <n-button text size="small" @click="aiCases = []">← 重新配置</n-button>
          </div>
          <div class="ai-case-list">
            <div
              v-for="(c, idx) in aiCases"
              :key="idx"
              :class="['ai-case-item', { selected: aiSelectedIds.has(idx) }]"
              @click="toggleAiSelect(idx)"
            >
              <div class="ai-case-check">
                <n-checkbox :checked="aiSelectedIds.has(idx)" @update:checked="toggleAiSelect(idx)" @click.stop />
              </div>
              <div class="ai-case-body">
                <div class="ai-case-name">{{ c.name }}</div>
                <div class="ai-case-meta">
                  <span :class="['ai-type-tag', c.case_type]">{{ caseTypeLabel(c.case_type) }}</span>
                  <span v-if="c.assertions?.length" class="ai-assert-hint">{{ c.assertions.length }} 个断言</span>
                </div>
              </div>
            </div>
          </div>
          <div class="ai-result-footer">
            <span class="ai-select-hint">已选 {{ aiSelectedIds.size }} / {{ aiCases.length }}</span>
            <n-space>
              <n-button size="small" @click="aiSelectAll">全选</n-button>
              <n-button
                type="primary"
                size="small"
                :disabled="!aiSelectedIds.size"
                :loading="aiSaving"
                @click="handleAiSave"
              >
                保存选中用例
              </n-button>
            </n-space>
          </div>
        </div>
      </div>
    </n-modal>

    <!-- 4. 添加/编辑用例大弹窗 -->
    <n-modal
      v-model:show="showAddModal"
      :mask-closable="false"
      class="test-case-edit-modal"
      :style="{ width: '90vw', height: '90vh', maxWidth: '1200px' }"
    >
      <div class="modal-full-content">
        <!-- 头部：名称 + 保存 -->
        <div class="edit-modal-header">
          <div class="header-left">
            <n-icon :component="CloseOutlined" class="close-icon" @click="showAddModal = false" />
            <n-input 
              v-model:value="newCaseName" 
              placeholder="用例名称" 
              class="case-name-input"
              :bordered="false"
            />
          </div>
          <n-button type="primary" color="#7D33FF" class="save-btn" @click="handleSaveNewCase" :loading="saving">
            保存
          </n-button>
        </div>

        <!-- 副头部：分组 + 标签 -->
        <div class="edit-modal-sub-header">
          <n-dropdown :options="groupOptions" @select="handleGroupSelect">
            <div class="group-selector">
              <n-icon :component="FolderOpenOutlined" />
              <span>{{ selectedGroupLabel }}</span>
              <n-icon :component="DownOutlined" size="12" />
            </div>
          </n-dropdown>
          <div class="divider">|</div>
          <div class="tags-adder">
            <n-icon :component="TagOutlined" />
            <span>添加标签</span>
          </div>
        </div>

        <div class="edit-modal-body-container">
          <div class="debug-interface-replica">
            <!-- 接口地址栏 -->
            <div class="url-bar">
              <div class="method-tag post">POST</div>
              <n-icon :component="LinkOutlined" class="link-icon" />
              <div class="url-input-box">
                {{ data?.path || '/auth/oauth/token' }}
              </div>
              <n-button-group>
                <n-button type="primary" color="#7D33FF" class="send-btn" @click="handleEditRun" :loading="saving">发送</n-button>
                <n-button type="primary" color="#7D33FF" class="send-arrow" style="padding: 0 8px">
                  <template #icon><n-icon :component="DownOutlined" /></template>
                </n-button>
              </n-button-group>
            </div>

            <!-- 参数配置区 -->
            <div class="detail-body replica-body">
              <!-- 左侧：请求参数 -->
              <div class="request-panel">
                <n-tabs type="line" animated v-model:value="editActiveTab">
                  <n-tab-pane name="params" :tab="`Params ${editQueryParams.length}`">
                    <div class="pane-padding">
                      <div class="param-group-title">Query 参数</div>
                      <n-table :single-line="false" size="small">
                        <thead>
                          <tr><th>参数名</th><th>示例值</th><th>说明</th></tr>
                        </thead>
                        <tbody>
                          <tr v-for="(p, idx) in editQueryParams" :key="idx">
                            <td><n-input v-model:value="p.name" ghost size="small" /></td>
                            <td><n-input v-model:value="p.example" ghost size="small" /></td>
                            <td><n-input v-model:value="p.desc" ghost size="small" /></td>
                          </tr>
                        </tbody>
                      </n-table>
                    </div>
                  </n-tab-pane>
                  <n-tab-pane name="body" tab="Body">
                    <div class="pane-padding">
                      <div class="body-type-selector">
                        <span 
                          v-for="bt in ['none', 'form-data', 'x-www-form-urlencoded', 'json', 'xml', 'text']" 
                          :key="bt"
                          :class="['type-item', { active: editBodyType === bt }]"
                          @click="editBodyType = bt"
                        >
                          {{ bt === 'json' ? 'JSON' : bt.toUpperCase() }}
                        </span>
                      </div>
                      <div v-if="editBodyType === 'json'" class="replica-json-editor">
                        <div class="editor-toolbar">
                          <n-button size="tiny" secondary><template #icon><n-icon :component="ThunderboltOutlined" /></template>动态值</n-button>
                          <n-space>
                            <n-button text size="tiny"><template #icon><n-icon :component="SearchOutlined" /></template>提取</n-button>
                            <n-button text size="tiny"><template #icon><n-icon :component="FormatPainterOutlined" /></template>格式化</n-button>
                            <n-icon :component="MenuOutlined" />
                          </n-space>
                        </div>
                        <div class="editor-content">
                          <div class="ln">1</div>
                          <textarea v-model="editBodyContent" spellcheck="false"></textarea>
                        </div>
                      </div>
                    </div>
                  </n-tab-pane>
                  <n-tab-pane name="headers" tab="Headers 1" />
                  <n-tab-pane name="cookies" tab="Cookies" />
                  <n-tab-pane name="auth" tab="Auth" />
                  <n-tab-pane name="pre" tab="前置操作" />
                  <n-tab-pane name="post" :tab="`后置操作 ${editPostOperations.length > 0 ? editPostOperations.length : ''}`">
                    <div class="pane-padding">
                      <!-- 已添加的后置操作列表 -->
                      <div class="post-ops-list">
                        <div v-for="(op, index) in editPostOperations" :key="index" class="post-op-item-wrapper">
                          <div :class="['post-op-item', { 'is-editing': editingEditOpIndex === index }]">
                            <div class="op-drag-handle"><n-icon :component="MenuOutlined" /></div>
                            <div class="op-main-content" @click="editingEditOpIndex = editingEditOpIndex === index ? null : index">
                              <n-icon :component="CheckCircleFilled" class="op-status-icon" />
                              <span class="op-type-label">{{ op.type === 'extract' ? '提取变量' : '断言' }}</span>
                              <template v-if="editingEditOpIndex !== index">
                                <template v-if="op.type === 'extract'">
                                  <span class="op-name-tag">{{ op.config?.name || op.name }}</span>
                                  <span class="op-var-scope">环境变量</span>
                                  <span class="op-details">Response JSON ({{ op.config?.expression || op.expression }})</span>
                                </template>
                                <template v-else>
                                  <span class="op-summary-text">
                                    {{ op.config?.target_label || 'Response JSON' }} 
                                    {{ assertOperators.find(o => o.value === op.config?.operator)?.label || '等于' }}
                                    {{ op.config?.value || '' }}
                                  </span>
                                </template>
                              </template>
                              <template v-else>
                                <span class="editing-text">正在编辑...</span>
                              </template>
                            </div>
                            <div class="op-right-actions">
                              <n-switch v-model:value="op.enabled" size="small" @click.stop />
                              <n-icon :component="DeleteOutlined" class="action-icon delete" @click.stop="editPostOperations.splice(index, 1)" />
                              <n-icon :component="editingEditOpIndex === index ? UpOutlined : RightOutlined" class="action-icon" @click="editingEditOpIndex = editingEditOpIndex === index ? null : index" />
                            </div>
                          </div>

                          <!-- 编辑面板 -->
                          <div v-if="editingEditOpIndex === index" class="op-edit-panel">
                            <div v-if="op.type === 'extract'" class="extract-editor">
                              <div class="edit-row">
                                <div class="edit-col">
                                  <div class="edit-label">变量名</div>
                                  <n-input v-model:value="op.config.name" size="small" placeholder="变量名" />
                                </div>
                                <div class="edit-col">
                                  <div class="edit-label">作用域</div>
                                  <n-select v-model:value="op.config.target" size="small" :options="[{label:'环境变量', value:'environment'}]" />
                                </div>
                              </div>
                              <div class="edit-row mt-12">
                                <div class="edit-col">
                                  <div class="edit-label">提取源</div>
                                  <n-select v-model:value="op.config.source" size="small" :options="[{label:'Response JSON', value:'json'}]" />
                                </div>
                                <div class="edit-col flex-2">
                                  <div class="edit-label">JSONPath 表达式</div>
                                  <n-input v-model:value="op.config.expression" size="small" placeholder="例如：$.data.id" />
                                </div>
                              </div>
                            </div>
                            <div v-else-if="op.type === 'assertion'" class="assertion-editor">
                              <div class="edit-form">
                                <div class="edit-form-row">
                                  <div class="edit-form-label">断言名称</div>
                                  <div class="edit-form-content">
                                    <n-input v-model:value="op.config.name" size="small" placeholder="可不填" />
                                  </div>
                                </div>
                                
                                <div class="edit-form-row">
                                  <div class="edit-form-label">断言对象</div>
                                  <div class="edit-form-content">
                                    <n-select v-model:value="op.config.target" size="small" :options="assertTargets" @update:value="(val) => {
                                      op.config.target_label = assertTargets.find(t => t.value === val)?.label
                                    }" />
                                  </div>
                                </div>

                                <div v-if="op.config.target === 'response_json'" class="edit-form-row">
                                  <div class="edit-form-label">JSONPath 表达式 <n-icon :component="QuestionCircleOutlined" class="label-icon" /></div>
                                  <div class="edit-form-content flex-row">
                                    <n-input v-model:value="op.config.expression" size="small" placeholder="JSONPath 表达式，如：$.store.book[0].title">
                                      <template #suffix>
                                        <n-icon :component="ThunderboltOutlined" class="wand-icon" />
                                      </template>
                                    </n-input>
                                    <div class="flex-row-append">
                                      <span class="append-text">继续提取</span>
                                      <n-switch size="small" />
                                      <span class="append-text ml-12">index</span>
                                      <n-input size="small" class="index-input" placeholder="" />
                                    </div>
                                  </div>
                                </div>

                                <div class="edit-form-row">
                                  <div class="edit-form-label">断言</div>
                                  <div class="edit-form-content flex-row">
                                    <n-select v-model:value="op.config.operator" size="small" :options="assertOperators" class="operator-select" />
                                    <n-input v-model:value="op.config.value" size="small" placeholder="期望值" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="add-post-op-container add-op-dashed-box">
                        <n-dropdown trigger="click" :options="addOpOptions" @select="handleAddOp">
                          <div class="add-op-btn add-op-trigger">
                            添加后置操作 <n-icon :component="DownOutlined" />
                          </div>
                        </n-dropdown>
                      </div>

                      <!-- 选项面板 -->
                      <div class="quick-op-panel">
                        <div class="quick-section">
                          <span class="section-label">新增</span>
                          <div class="quick-items">
                            <div class="quick-item" @click="handleAddOp('assertion')">
                              <n-icon :component="CheckCircleFilled" color="#ff4d4f" />
                              <span>断言</span>
                            </div>
                            <div class="quick-item" @click="handleAddOp('extract')">
                              <n-icon :component="ThunderboltOutlined" color="#faad14" />
                              <span>提取变量</span>
                            </div>
                            <div class="quick-item" @click="handleAddOp('db')">
                              <n-icon :component="DatabaseOutlined" color="#722ed1" />
                              <span>数据库操作</span>
                            </div>
                            <div class="quick-item" @click="handleAddOp('script')">
                              <n-icon :component="CodeOutlined" color="#1890ff" />
                              <span>自定义脚本</span>
                            </div>
                            <div class="quick-item" @click="handleAddOp('public_script')">
                              <n-icon :component="ShareAltOutlined" color="#fa8c16" />
                              <span>公共脚本</span>
                            </div>
                            <div class="quick-item" @click="handleAddOp('wait')">
                              <n-icon :component="ReloadOutlined" color="#13c2c2" />
                              <span>等待时间</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </n-tab-pane>
                  <n-tab-pane name="settings" tab="设置" />
                </n-tabs>
              </div>

              <!-- 右侧：运行结果 -->
              <div class="response-panel">
                <div class="res-tabs-wrapper">
                  <n-tabs type="line" size="small" class="res-tabs">
                    <n-tab-pane name="body" tab="Body" />
                    <n-tab-pane name="cookie" tab="Cookie" />
                    <n-tab-pane name="header" :tab="`Header ${editResponseResult?.headers ? Object.keys(editResponseResult.headers).length : 0}`" />
                    <n-tab-pane name="assert" tab="断言" />
                  </n-tabs>
                  <div class="res-status-info">
                    <span class="status-code" :class="{ 'status-success': String(editResponseStatus).startsWith('2') }">
                      {{ editResponseStatus || '-' }}
                    </span>
                    <span class="res-time">{{ Math.round(editResponseTime || 0) }}ms</span>
                    <span class="res-size">0B</span>
                    <n-icon :component="ShareAltOutlined" class="share-icon" />
                    <div v-if="editResponseStatus && String(editResponseStatus).startsWith('2')" class="pass-tag">
                      <n-icon :component="CheckCircleFilled" />
                      成功
                    </div>
                    <div v-else-if="editResponseStatus" class="fail-tag">
                      <n-icon :component="CloseCircleFilled" />
                      失败
                    </div>
                  </div>
                </div>
                <div class="res-body-editor">
                  <div class="editor-toolbar">
                    <n-space :size="12">
                      <span class="toolbar-item">Pretty <n-icon :component="DownOutlined" /></span>
                      <span class="toolbar-item">Text <n-icon :component="DownOutlined" /></span>
                      <span class="toolbar-item">utf8 <n-icon :component="DownOutlined" /></span>
                      <n-icon :component="FilterOutlined" class="toolbar-icon" />
                    </n-space>
                    <n-space :size="12">
                      <n-icon :component="ArrowUpOutlined" class="toolbar-icon" />
                      <n-icon :component="DownloadOutlined" class="toolbar-icon" />
                      <n-icon :component="CopyOutlined" class="toolbar-icon" />
                      <n-icon :component="SearchOutlined" class="toolbar-icon" />
                    </n-space>
                  </div>
                  <div class="editor-content-area">
                    <div class="line-number">1</div>
                    <div class="editor-text">
                      <pre class="json-pre">{{ editResponseResult?.data ? JSON.stringify(editResponseResult.data, null, 2) : (editResponseResult ? JSON.stringify(editResponseResult, null, 2) : '') }}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部响应栏 -->
        <div class="edit-modal-footer">
          <div class="footer-left">返回响应</div>
          <div class="footer-right">
            <n-space align="center">
              <span>校验响应</span>
              <n-switch size="small" />
              <n-select size="small" :options="[{label:'成功 (200)', value:200}]" :default-value="200" style="width:120px" />
            </n-space>
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  NTabs, NTabPane, NButton, NIcon, NInput, NSpace, NButtonGroup, 
  NTable, NCheckbox, NTag, NEmpty, NScrollbar, NModal, NDropdown,
  NSwitch, NSelect, useMessage, useDialog
} from 'naive-ui'
import { 
  SettingOutlined, HistoryOutlined, SearchOutlined, FilterOutlined,
  ThunderboltOutlined, PlusOutlined, DownOutlined, CaretRightOutlined,
  EllipsisOutlined, DatabaseOutlined, SyncOutlined, CodeOutlined,
  ShareAltOutlined, CheckCircleFilled, MinusCircleOutlined,
  RightOutlined, ArrowUpOutlined, DownloadOutlined, CopyOutlined,
  CloseOutlined, FolderOpenOutlined, TagOutlined, LinkOutlined,
  FormatPainterOutlined, MenuOutlined, CloseCircleFilled, DeleteOutlined, UpOutlined,
  QuestionCircleOutlined
} from '@vicons/antd'
import execRequest from '../api/exec-request'
import {
  ASSERTION_OPERATOR_OPTIONS,
  ASSERTION_TARGET_OPTIONS,
  evaluateAssertionRule,
  normalizeAssertionConfig,
  readAssertionExpression
} from '../utils/http-assertion-contract'

const props = defineProps<{
  data: any
  envBaseUrl?: string
  envId?: number | string | null
}>()

const message = useMessage()
const dialog = useDialog()

const activeCategory = ref('all')
const searchPattern = ref('')
const testCases = ref<any[]>([])
const expandedId = ref<number | null>(null)

// 添加用例相关状态
const showAddModal = ref(false)
const newCaseName = ref('')
const selectedGroup = ref('positive')
const selectedGroupLabel = ref('正向')
const editActiveTab = ref('params')
const editBodyType = ref('json')
const editBodyContent = ref('{}')
const editQueryParams = ref<any[]>([{ name: '', example: '', desc: '' }])
const editPostOperations = ref<any[]>([])
const editingEditOpIndex = ref<number | null>(null)
const saving = ref(false)

const assertTargets = ASSERTION_TARGET_OPTIONS

const assertOperators = ASSERTION_OPERATOR_OPTIONS

const groupOptions = [
  { label: '正向', key: 'positive' },
  { label: '负向', key: 'negative' },
  { label: '边界值', key: 'boundary' },
  { label: '安全性', key: 'security' },
  { label: '其他', key: 'other' }
]

const addOpOptions = [
  { label: '提取变量', key: 'extract' },
  { label: '断言', key: 'assertion' },
  { label: '数据库操作', key: 'db' },
  { label: '自定义脚本', key: 'script' },
  { label: '等待时间', key: 'wait' }
]

const handleAddOp = (key: string) => {
  const newOp = {
    id: Date.now().toString(),
    type: key,
    name: key === 'extract' ? 'new_variable' : '',
    enabled: true,
    config: key === 'extract' ? {
      source: 'json',
      expression: '$.data.id',
      target: 'environment'
    } : {
      name: '',
      target: 'response_json',
      target_label: 'Response JSON',
      expression: '$.data.id',
      operator: 'equals',
      value: '200'
    }
  }
  editPostOperations.value.push(newOp)
  editingEditOpIndex.value = editPostOperations.value.length - 1
}

const handlePostOperations = async (response: any, postOps: any[]) => {
  if (!response || !postOps) return
  const responseData = response.data || {}

  for (const op of postOps) {
    if (!op.enabled) continue
    
    try {
      if (op.type === 'extract' && (op.config?.expression || op.expression)) {
        const { expression, name } = op.config || op
        const val = readAssertionExpression(responseData, String(expression || ''))
        
        if (val !== undefined) {
          message.success('提取成功')
          if (props.envId) {
            await saveVariableToEnvironment(name, val)
          }
        }
      } else if (op.type === 'assertion') {
        const cfg = normalizeAssertionConfig(op.config || op)
        const evaluation = evaluateAssertionRule({
          target: cfg.target,
          operator: cfg.operator,
          expression: cfg.expression,
          expected: cfg.value,
          statusCode: response.status_code,
          headers: response?.headers,
          data: responseData
        })
        const actualValue = evaluation.actual
        const passed = evaluation.passed
        const expectedText =
          cfg.value == null || cfg.value === '' ? evaluation.operator : String(cfg.value)

        if (passed) {
          message.success(`断言成功: ${cfg.name || op.config?.name || '验证响应'}`)
        } else {
          message.error(
            `断言失败: ${cfg.name || op.config?.name || '验证响应'} (期望: ${expectedText}, 实际: ${actualValue === undefined ? '未找到' : actualValue})`
          )
        }
      }
    } catch (err) {
      console.warn('后置操作执行异常', err)
    }
  }
}

const saveVariableToEnvironment = async (name: string, value: any) => {
  if (!props.envId) return
  try {
    const envRes: any = await execRequest.get(`/environments/${props.envId}`)
    if (envRes) {
      const variables = Array.isArray(envRes.variables) ? [...envRes.variables] : []
      const existingIdx = variables.findIndex((v: any) => v.name === name)
      if (existingIdx > -1) {
        variables[existingIdx].remote_value = String(value)
        variables[existingIdx].local_value = String(value)
      } else {
        variables.push({
          name: name,
          remote_value: String(value),
          local_value: String(value),
          is_synced: true
        })
      }
      await execRequest.patch(`/environments/${props.envId}`, { variables })
    }
  } catch (err) {
    console.error('持久化变量失败:', err)
  }
}

const getEnvVariables = async () => {
  let variables: Record<string, string> = {}
  if (props.envId) {
    try {
      const envRes: any = await execRequest.get(`/environments/${props.envId}`)
      if (envRes && envRes.variables) {
        envRes.variables.forEach((v: any) => {
          variables[v.name] = v.local_value || v.remote_value || ''
        })
      }
    } catch (e) {
      console.warn('获取环境变量失败')
    }
  }
  return variables
}

const handleGroupSelect = (key: string) => {
  selectedGroup.value = key
  selectedGroupLabel.value = groupOptions.find(o => o.key === key)?.label || '正向'
}

const openAddModal = () => {
  newCaseName.value = ''
  selectedGroup.value = 'positive'
  selectedGroupLabel.value = '正向'
  editQueryParams.value = Array.isArray(props.data?.query_params) 
    ? props.data.query_params.map((p: any) => ({ ...p })) 
    : [{ name: '', example: '', desc: '' }]
  editBodyType.value = props.data?.body_definition?.type || 'json'
  editBodyContent.value = props.data?.body_definition?.content || '{}'
  editPostOperations.value = Array.isArray(props.data?.post_operations) ? [...props.data.post_operations] : []
  editResponseResult.value = null
  editResponseStatus.value = null
  editResponseTime.value = 0
  showAddModal.value = true
}

const editResponseResult = ref<any>(null)
const editResponseStatus = ref<number | null>(null)
const editResponseTime = ref(0)

const handleEditRun = async () => {
  if (saving.value) return
  
  saving.value = true
  editResponseResult.value = null
  editResponseTime.value = 0
  editResponseStatus.value = null

  try {
    const variables = await getEnvVariables()
    const replaceVars = (str: string) => {
      if (!str) return str
      return str.replace(/\{\{(.+?)\}\}/g, (match, name) => {
        const key = name.trim()
        return variables[key] !== undefined ? variables[key] : match
      })
    }

    const baseUrl = props.envBaseUrl || '' 
    const path = replaceVars(props.data?.path || '')
    let fullUrl = baseUrl + path

    const qp = editQueryParams.value
      .filter((p: any) => p.name && (p.example || p.value))
      .map((p: any) => {
        const n = replaceVars(p.name)
        const v = replaceVars(p.example || p.value)
        return `${encodeURIComponent(n)}=${encodeURIComponent(v)}`
      })
      .join('&')
    
    if (qp) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + qp
    }

    const headers: Record<string, string> = {}
    let bodyText = editBodyContent.value
    if (editBodyType.value === 'json') {
      bodyText = replaceVars(editBodyContent.value)
    }

    let body: any = null
    if (editBodyType.value === 'json' && bodyText) {
      try {
        body = JSON.parse(bodyText)
      } catch (e) {
        body = bodyText
      }
    }

    const res: any = await execRequest.post('/proxy', {
      url: fullUrl,
      method: props.data?.method || 'GET',
      headers: headers,
      body: body
    })

    if (res.error) {
      editResponseResult.value = res
    } else {
      editResponseStatus.value = res.status_code
      editResponseTime.value = res.elapsed
      editResponseResult.value = res 
      await handlePostOperations(res, editPostOperations.value)
    }
  } catch (err) {
    console.error('调试运行失败:', err)
  } finally {
    saving.value = false
  }
}

const handleSaveNewCase = async () => {
  if (!newCaseName.value) {
    message.warning('请输入用例名称')
    return
  }
  if (!props.data?.id) return

  saving.value = true
  try {
    const payload = {
      interface_id: props.data.id,
      name: newCaseName.value,
      case_type: selectedGroup.value, // 使用选中的分组作为类型
      method: props.data.method,
      path: props.data.path,
      query_params: editQueryParams.value.filter(p => p.name),
      header_params: [], // 简化处理
      post_operations: editPostOperations.value,
      body_definition: {
        type: editBodyType.value,
        content: editBodyContent.value
      },
      assertions: []
    }
    await execRequest.post('/test-cases', payload)
    message.success('保存成功')
    showAddModal.value = false
    fetchTestCases() // 刷新列表
  } catch (err) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = (item: any) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除用例 "${item.name}" 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await execRequest.delete(`/test-cases/${item.id}`)
        message.success('删除成功')
        fetchTestCases()
      } catch (err) {
        message.error('删除失败')
      }
    }
  })
}

const toggleExpand = (id: number) => {
  if (expandedId.value === id) {
    expandedId.value = null
  } else {
    expandedId.value = id
  }
}

const handleRun = async (item: any) => {
  if (item.running) return
  
  item.running = true
  item.responseResult = null
  item.responseTime = 0
  item.responseStatus = null

  try {
    const variables = await getEnvVariables()
    const replaceVars = (str: string) => {
      if (!str) return str
      return str.replace(/\{\{(.+?)\}\}/g, (match, name) => {
        const key = name.trim()
        return variables[key] !== undefined ? variables[key] : match
      })
    }

    // 1. 获取接口基础信息
    const baseUrl = props.envBaseUrl || '' 
    const pathValue = replaceVars(props.data?.path || '')
    let fullUrl = baseUrl + pathValue

    // 2. 拼接 Query 参数
    const qp = (item.query_params || [])
      .filter((p: any) => p.name && (p.example || p.value))
      .map((p: any) => {
        const n = replaceVars(p.name)
        const v = replaceVars(p.example || p.value)
        return `${encodeURIComponent(n)}=${encodeURIComponent(v)}`
      })
      .join('&')
    
    if (qp) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + qp
    }

    // 3. 构建 Headers
    const headers: Record<string, string> = {}
    ;(item.header_params || []).forEach((p: any) => {
      if (p.name && (p.example || p.value)) {
        headers[replaceVars(p.name)] = replaceVars(p.example || p.value)
      }
    })

    // 4. 构建 Body
    let body: any = null
    const bodyDef = item.body_definition
    if (bodyDef?.type === 'json' && bodyDef.content) {
      const bodyText = replaceVars(bodyDef.content)
      try {
        body = JSON.parse(bodyText)
      } catch (e) {
        body = bodyText
      }
    }

    // 5. 调用执行引擎代理
    const res: any = await execRequest.post('/proxy', {
      url: fullUrl,
      method: props.data?.method || 'GET',
      headers: headers,
      body: body
    })

    if (res.error) {
      item.result = 'fail'
      item.responseResult = res
    } else {
      item.responseStatus = res.status_code
      item.responseTime = res.elapsed
      item.responseResult = res 
      item.result = String(res.status_code).startsWith('2') ? 'pass' : 'fail'
      
      // 执行后置操作
      if (item.post_operations) {
        await handlePostOperations(res, item.post_operations)
      }
    }
  } catch (err) {
    console.error('运行用例失败:', err)
    item.result = 'fail'
  } finally {
    item.running = false
  }
}

const counts = computed(() => {
  return {
    all: testCases.value.length,
    positive: testCases.value.filter(c => c.group === 'positive').length,
    negative: testCases.value.filter(c => c.group === 'negative').length,
    boundary: testCases.value.filter(c => c.group === 'boundary').length,
    security: testCases.value.filter(c => c.group === 'security').length,
    other: testCases.value.filter(c => c.group === 'other').length,
  }
})

const filteredCases = computed(() => {
  let list = testCases.value
  if (activeCategory.value !== 'all') {
    list = list.filter(c => c.group === activeCategory.value)
  }
  if (searchPattern.value) {
    list = list.filter(c => c.name.toLowerCase().includes(searchPattern.value.toLowerCase()))
  }
  return list
})

const fetchTestCases = async () => {
  if (!props.data?.id) return
  try {
    const res: any = await execRequest.get(`/test-cases?interface_id=${props.data.id}`)
    if (Array.isArray(res)) {
      // 模拟图片中的数据结构以展示 1:1 效果，实际生产应由后端返回分类
      testCases.value = res.map((item: any) => ({
        ...item,
        group: item.group || (Math.random() > 0.5 ? 'positive' : 'negative'), // 临时模拟
        groupLabel: item.groupLabel || '正向', // 临时模拟
        tags: item.tags || ['仅传必要字段'],
        dataCount: item.dataCount || 16,
        running: false,
        result: '-'
      }))
    }
  } catch (err) {
    console.error('获取用例失败:', err)
  }
}

// 模拟图片数据用于 1:1 还原展示
const loadMockData = () => {
  testCases.value = [
    { 
      id: 1, 
      name: '仅传必要字段 - 使用有效手机号和验证码获取token - 期望200成功返回token', 
      group: 'positive', 
      groupLabel: '正向', 
      tags: ['仅传必要字段'], 
      running: false, 
      result: 'fail',
      query_params: [
        { name: 'mobile', example: '19947655436' },
        { name: 'code', example: '123456' }
      ],
      header_params: [
        { name: 'Content-Type', example: 'application/json' }
      ],
      body_definition: { type: 'json', content: '{"grant_type": "admin_sms_code"}' }
    },
    { id: 2, name: '其他正向 - 提供完整的有效参数组合获取token - 期望200成功', group: 'positive', groupLabel: '正向', tags: ['其他正向'], running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
    { id: 3, name: '覆盖grant_type枚举组合 - 使用testData正交设计测试grant_type与其他参数的组合 - 期望对不同组合返回适当响应', group: 'positive', groupLabel: '正向', tags: ['覆盖枚举组合'], dataCount: 16, running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
    { id: 4, name: '语义合法 - 使用业务逻辑有效的管理员短信验证码方式获取token - 期望200成功', group: 'positive', groupLabel: '正向', tags: ['语义合法'], running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
    { id: 5, name: '其他负向 - 使用错误的client_id and client_secret组合 - 期望401客户端认证失败', group: 'negative', groupLabel: '负向', tags: ['其他负向'], running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
    { id: 6, name: '语义非法 - 使用非admin_sms_code的grant_type值但提供手机验证码参数 - 期望400或401错误', group: 'negative', groupLabel: '负向', tags: ['语义非法'], running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
    { id: 7, name: '格式错误 - 使用格式错误的手机号 (非11位数字) - 期望400格式错误', group: 'negative', groupLabel: '负向', tags: ['格式错误'], running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
    { id: 8, name: '类型错误 - 将code参数值设置为整数类型 - 期望400类型错误', group: 'negative', groupLabel: '负向', tags: ['类型错误'], running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
    { id: 9, name: '无效值 - 使用错误或过期的短信验证码 - 期望401或400错误', group: 'negative', groupLabel: '负向', tags: ['无效值'], running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
    { id: 10, name: '无效值 - 使用未注册或无效的手机号 - 期望401或400错误', group: 'negative', groupLabel: '负向', tags: ['无效值'], running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
    { id: 11, name: '缺失必填字段 - 请求中省略code字段 - 期望400错误提示缺少必要参数', group: 'negative', groupLabel: '负向', tags: ['缺失必填字段'], running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
    { id: 12, name: '缺失必填字段 - 请求中省略mobile字段 - 期望400错误提示缺少必要参数', group: 'negative', groupLabel: '负向', tags: ['缺失必填字段'], running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
    { id: 13, name: '字符串过长 - 使用超长的手机号 (超过11位) - 期望400格式错误', group: 'boundary', groupLabel: '边界值', tags: ['字符串过长'], running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
    { id: 14, name: '字符串过长 - 使用超长的验证码 (例如100位) - 期望400错误或截断处理', group: 'boundary', groupLabel: '边界值', tags: ['字符串过长'], running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
    { id: 15, name: '字符串过短 - 使用过短的验证码 (少于1位) - 期望400错误', group: 'boundary', groupLabel: '边界值', tags: ['字符串过短'], running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
    { id: 16, name: '空值 - 将code字段值设置为空字符串 - 期望400错误', group: 'boundary', groupLabel: '边界值', tags: ['空值'], running: false, result: '-', query_params: [], header_params: [], body_definition: { type: 'none' } },
  ]
}

onMounted(() => {
  // 如果有 props 数据则尝试加载真实数据，否则加载 Mock 数据展示 UI
  if (props.data?.id) {
    fetchTestCases()
  } else {
    loadMockData()
  }
})

// ── AI 生成用例 ────────────────────────────────────────────────────
const showAiModal = ref(false)
const aiGenerating = ref(false)
const aiSaving = ref(false)
const aiCases = ref<any[]>([])
const aiSelectedIds = ref<Set<number>>(new Set())
const aiExtraRequirement = ref('')

// 场景配置表
const scenarioMap = {
  positive: [
    { key: 'p_required', label: '仅传必要字段' },
    { key: 'p_semantic', label: '语义合法' },
    { key: 'p_enum', label: '覆盖枚举组合' },
    { key: 'p_other', label: '其他正向' },
  ],
  negative: [
    { key: 'n_invalid', label: '无效值' },
    { key: 'n_missing', label: '缺失必填字段' },
    { key: 'n_format', label: '格式错误' },
    { key: 'n_type', label: '类型错误' },
    { key: 'n_semantic', label: '语义非法' },
    { key: 'n_other', label: '其他负向' },
  ],
  boundary: [
    { key: 'b_minmax', label: '极大值/极小值' },
    { key: 'b_overflow', label: '超出最大、最小边界值' },
    { key: 'b_null', label: 'Null/零值/空值' },
    { key: 'b_length', label: '字符串过长、过短' },
  ],
  security: [
    { key: 's_auth', label: '鉴权控制' },
    { key: 's_sql', label: 'SQL注入' },
    { key: 's_fuzzy', label: '模糊输入' },
    { key: 's_xss', label: 'XSS注入' },
    { key: 's_cmd', label: '命令行注入' },
    { key: 's_json', label: 'JSON注入' },
    { key: 's_nosql', label: 'NoSQL注入' },
  ],
}

// 默认全选
const allScenarioKeys = Object.values(scenarioMap).flat().map(t => t.key)
const selectedScenarios = ref<Set<string>>(new Set(allScenarioKeys))

const toggleScenario = (key: string) => {
  const s = new Set(selectedScenarios.value)
  s.has(key) ? s.delete(key) : s.add(key)
  selectedScenarios.value = s
}

const isCategoryAllSelected = (cat: keyof typeof scenarioMap) => {
  return scenarioMap[cat].every(t => selectedScenarios.value.has(t.key))
}

const toggleCategoryAll = (cat: keyof typeof scenarioMap) => {
  const s = new Set(selectedScenarios.value)
  if (isCategoryAllSelected(cat)) {
    scenarioMap[cat].forEach(t => s.delete(t.key))
  } else {
    scenarioMap[cat].forEach(t => s.add(t.key))
  }
  selectedScenarios.value = s
}

const openAiModal = () => {
  aiCases.value = []
  aiSelectedIds.value = new Set()
  aiExtraRequirement.value = ''
  selectedScenarios.value = new Set(allScenarioKeys)
  showAiModal.value = true
}

const getMethodStyleForAi = (method: string) => {
  return getMethodStyle((method || 'GET').toUpperCase())
}

const caseTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    positive: '正向', negative: '负向', boundary: '边界值',
    security: '安全性', other: '其他'
  }
  return map[type] || type
}

const toggleAiSelect = (idx: number) => {
  const s = new Set(aiSelectedIds.value)
  s.has(idx) ? s.delete(idx) : s.add(idx)
  aiSelectedIds.value = s
}

const aiSelectAll = () => {
  if (aiSelectedIds.value.size === aiCases.value.length) {
    aiSelectedIds.value = new Set()
  } else {
    aiSelectedIds.value = new Set(aiCases.value.map((_, i) => i))
  }
}

const handleAiGenerate = async () => {
  if (!props.data?.id) {
    message.warning('请先选择一个接口')
    return
  }
  aiGenerating.value = true
  aiCases.value = []

  // 把勾选的场景标签名整理成文字传给后端
  const selectedLabels = Object.values(scenarioMap).flat()
    .filter(t => selectedScenarios.value.has(t.key))
    .map(t => t.label)

  try {
    const res: any = await execRequest.post('/test-cases/ai-generate', {
      interface_id: props.data.id,
      save: false,
      scenarios: selectedLabels,
      extra_requirement: aiExtraRequirement.value || ''
    }, { timeout: 90000 })  // AI 生成最长等 90 秒
    if (res?.data && Array.isArray(res.data)) {
      aiCases.value = res.data
      aiSelectedIds.value = new Set(res.data.map((_: any, i: number) => i))
    } else if (Array.isArray(res)) {
      // exec-request 拦截器已经把 data 字段解包，直接就是数组
      aiCases.value = res
      aiSelectedIds.value = new Set(res.map((_: any, i: number) => i))
    } else {
      message.error('AI 返回数据格式异常')
    }
  } catch (err: any) {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      message.error('AI 生成超时，请减少勾选的场景数量后重试')
    } else {
      message.error(err?.response?.data?.detail || 'AI 生成失败，请检查 DeepSeek Key 配置')
    }
  } finally {
    aiGenerating.value = false
  }
}

const handleAiSave = async () => {
  if (!props.data?.id || !aiSelectedIds.value.size) return
  aiSaving.value = true
  try {
    const selected = [...aiSelectedIds.value].map(i => aiCases.value[i])
    for (const c of selected) {
      await execRequest.post('/test-cases', {
        interface_id: props.data.id,
        name: c.name,
        case_type: c.case_type || 'positive',
        query_params: c.query_params || [],
        header_params: c.header_params || [],
        body_definition: c.body_definition || { type: 'none' },
        assertions: c.assertions || [],
        post_operations: []
      })
    }
    message.success(`已保存 ${selected.length} 条 AI 生成用例`)
    showAiModal.value = false
    fetchTestCases()
  } catch (err) {
    message.error('保存失败')
  } finally {
    aiSaving.value = false
  }
}
</script>

<style scoped>
.api-test-case-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

/* 1. 顶部 Header */
.test-case-header {
  padding: 0 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-tabs-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.category-tabs .n-tabs-nav) {
  padding: 0;
}

:deep(.category-tabs .n-tabs-tab) {
  font-size: 13px;
  padding: 12px 0;
  margin-right: 24px;
}

:deep(.category-tabs .n-tabs-tab--active) {
  font-weight: 600;
}

.settings-btn {
  color: #8792a2 !important;
}

.test-report-btn {
  color: #5c6676 !important;
  font-size: 12px;
}

/* 2. 操作栏 */
.action-toolbar {
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 200px;
}

.ai-gen-btn {
  color: #5c6676 !important;
}

.run-all-btn {
  padding: 0 16px;
}

/* 3. 表格样式 */
.test-case-list {
  flex: 1;
  padding: 0 24px 24px;
  overflow: auto;
}

.case-table :deep(th) {
  background: #f8f9fc !important;
  color: #8792a2 !important;
  font-weight: normal !important;
  font-size: 12px;
  height: 40px;
}

.case-table :deep(td) {
  height: 48px;
  vertical-align: middle;
}

.col-check { width: 40px; text-align: center; }
.col-index { width: 40px; color: #8792a2; font-size: 12px; }
.col-name { min-width: 400px; }
.col-group { width: 100px; }
.col-result { width: 100px; text-align: center; }
.col-action { width: 40px; text-align: center; }

.name-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.case-right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.case-title {
  color: #1a1f36;
  font-size: 13px;
  flex: 1;
  margin-right: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-run-btn {
  opacity: 0;
  transition: opacity 0.2s;
  height: 24px;
  padding: 0 8px;
}

.case-table tr:hover .row-run-btn {
  opacity: 1;
}

.case-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.custom-tag {
  background: #f0f2f5;
  color: #8792a2;
  font-size: 11px;
}

.data-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #e6f4ff;
  color: #1890ff;
  padding: 0 6px;
  height: 18px;
  border-radius: 4px;
  font-size: 11px;
}

.group-text {
  font-size: 12px;
  color: #1a1f36;
}

.result-placeholder {
  color: #ccc;
}

/* 展开详情样式 */
.case-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.case-row:hover {
  background-color: #f9fafb;
}

.case-row.expanded {
  background-color: #f0f2f5;
}

/* 展开详情区域样式 */
.detail-row {
  background-color: #f0f2f5;
}

/* 添加用例弹窗样式 1:1 还原 */
.modal-full-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.edit-modal-header {
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.close-icon {
  font-size: 18px;
  cursor: pointer;
  color: #8792a2;
}

.case-name-input {
  --n-font-size: 18px !important;
  max-width: 600px;
}

.edit-modal-sub-header {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.group-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5c6676;
  font-size: 13px;
  cursor: pointer;
}

.divider {
  color: #eef1f6;
}

.tags-adder {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  font-size: 13px;
  cursor: pointer;
}

.edit-modal-body-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.replica-body {
  height: 500px;
}

.debug-interface-replica {
  border: 1px solid #eef1f6;
  border-radius: 8px;
}

.url-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fcfcfc;
  border-bottom: 1px solid #eef1f6;
  gap: 12px;
}

.method-tag {
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
  background: #fffbe6;
  color: #faad14;
}

.url-input-box {
  flex: 1;
  color: #1a1f36;
  font-family: monospace;
}

.config-tabs-replica :deep(.n-tabs-nav) {
  padding: 0 16px;
}

.replica-json-editor {
  border: 1px solid #eef1f6;
  border-radius: 4px;
  margin-top: 12px;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 6px 12px;
  background: #fafafa;
  border-bottom: 1px solid #eef1f6;
}

.editor-content {
  display: flex;
  height: 300px;
}

.ln {
  width: 32px;
  background: #fafafa;
  color: #ccc;
  text-align: center;
  padding-top: 8px;
  border-right: 1px solid #eef1f6;
}

.editor-content textarea {
  flex: 1;
  border: none;
  outline: none;
  padding: 8px;
  resize: none;
  font-family: monospace;
}

.edit-modal-footer {
  height: 48px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: #fcfcfc;
}

.footer-left {
  font-size: 14px;
  font-weight: 600;
}

.pane-padding {
  padding: 16px;
}

.body-type-selector {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.type-item {
  font-size: 12px;
  cursor: pointer;
  color: #5c6676;
}

.type-item.active {
  background: #1890ff;
  color: #fff;
  padding: 2px 8px;
  border-radius: 12px;
}

.detail-td {
  padding: 0 16px 16px !important;
}

.case-detail-container {
  background: #fff;
  border: 1px solid #e8ecf4;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;
}

.case-detail-container:hover {
  box-shadow: 0 6px 24px rgba(0,0,0,0.09);
}

.detail-header {
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafbfc;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
}

.method-tag {
  font-weight: 700;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 4px;
  flex-shrink: 0;
}

.method-tag.post {
  color: #d46b08;
  background: #fff7e6;
  border: 1px solid #ffd591;
}

.link-icon {
  color: #c0c8d8;
  font-size: 11px;
  flex-shrink: 0;
}

.path-text {
  color: #3c4257;
  font-size: 13px;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.gray-tag {
  background: #f0f2f7;
  color: #8792a2;
  font-size: 11px;
  border-radius: 4px;
}

/* 响应式分栏：宽屏左右，窄屏上下 */
.detail-body {
  display: flex;
  min-height: 360px;
  max-height: 520px;
}

@media (max-width: 900px) {
  .detail-body {
    flex-direction: column;
    max-height: none;
  }
  .response-panel {
    width: 100% !important;
    min-height: 280px;
    border-left: none !important;
    border-top: 1px solid #f0f0f0;
  }
}

.request-panel {
  flex: 1;
  min-width: 0;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.response-panel {
  width: 42%;
  min-width: 280px;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-tabs {
  flex: 1;
  overflow: hidden;
}

:deep(.detail-tabs .n-tabs-nav) {
  padding: 0 12px;
  background: #fafbfc;
}

:deep(.detail-tabs .n-tabs-tab) {
  font-size: 12px;
  padding: 8px 0;
  margin-right: 14px;
}

:deep(.detail-tabs .n-tab-pane) {
  overflow-y: auto;
  max-height: 340px;
}

.tabs-extra-icon {
  margin-right: 16px;
  color: #8792a2;
  cursor: pointer;
}

.params-content {
  padding: 10px 14px;
}

.param-group-title {
  font-size: 11px;
  color: #a0aab8;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.param-table-simple {
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f2f7;
  border-radius: 6px;
  overflow: hidden;
}

.param-row-header, .param-row {
  display: flex;
  align-items: center;
  height: 32px;
  border-bottom: 1px solid #f5f7fa;
  font-size: 12px;
}

.param-row:last-child {
  border-bottom: none;
}

.param-row-header {
  color: #a0aab8;
  font-weight: 500;
  background: #fafbfc;
}

.param-row:hover {
  background: #f9fafc;
}

.col-status { width: 28px; text-align: center; flex-shrink: 0; }
.col-key { flex: 2; min-width: 0; padding: 0 8px; color: #1a1f36; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-val { flex: 3; min-width: 0; padding: 0 8px; color: #5c6676; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-op { width: 52px; display: flex; gap: 6px; color: #d0d5e0; justify-content: center; flex-shrink: 0; }

.op-icon { cursor: pointer; }
.op-icon:hover { color: #8792a2; }

.add-param-link {
  margin-top: 12px;
  color: #ccc;
  font-size: 12px;
  cursor: pointer;
}

.res-tabs-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafbfc;
  border-bottom: 1px solid #f0f0f0;
  padding-right: 12px;
  flex-shrink: 0;
}

.res-tabs {
  flex: 1;
  min-width: 0;
}

:deep(.res-tabs .n-tabs-nav) {
  padding: 0 12px;
  border-bottom: none;
}

:deep(.res-tabs .n-tabs-tab) {
  font-size: 12px;
  padding: 8px 0;
  margin-right: 14px;
}

.res-status-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  flex-shrink: 0;
  flex-wrap: nowrap;
}

.status-code { color: #faad14; font-weight: 700; font-size: 13px; }
.status-code.status-success { color: #52c41a; }
.res-time, .res-size { color: #a0aab8; }
.share-icon { color: #c0c8d8; cursor: pointer; }
.share-icon:hover { color: #8792a2; }

.fail-tag, .pass-tag {
  padding: 1px 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  white-space: nowrap;
}

.fail-tag {
  background: #fff1f0;
  border: 1px solid #ffa39e;
  color: #cf1322;
}

.pass-tag {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #389e0d;
}

.res-body-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-toolbar {
  height: 32px;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  font-size: 11px;
  color: #5c6676;
  background: #fafbfc;
  flex-shrink: 0;
}

.toolbar-item { cursor: pointer; display: flex; align-items: center; gap: 3px; color: #8792a2; }
.toolbar-item:hover { color: #1a1f36; }
.toolbar-icon { cursor: pointer; color: #a0aab8; }
.toolbar-icon:hover { color: #5c6676; }

.editor-content-area {
  flex: 1;
  display: flex;
  background: #fff;
  overflow: auto;
}

.line-number {
  width: 28px;
  background: #fafbfc;
  border-right: 1px solid #f0f2f7;
  color: #c8d0de;
  text-align: center;
  padding-top: 8px;
  font-family: monospace;
  font-size: 11px;
  flex-shrink: 0;
  user-select: none;
}

.editor-text {
  flex: 1;
  padding: 8px;
  min-width: 0;
  overflow: auto;
}

.json-pre {
  margin: 0;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  color: #2d3748;
  line-height: 1.6;
}

.body-json-view {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 8px;
  margin-top: 8px;
  max-height: 200px;
  overflow: auto;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  border-radius: 12px;
  font-size: 11px;
}

.result-badge.fail {
  background: #fff1f0;
  color: #cf1322;
}

.result-badge.pass {
  background: #f6ffed;
  color: #52c41a;
}

.row-hover-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #8792a2;
  opacity: 0;
  transition: opacity 0.2s;
}

.case-row:hover .row-hover-actions {
  opacity: 1;
}

.hover-icon {
  cursor: pointer;
}

.hover-icon:hover {
  color: #1a1f36;
}

.hover-icon.delete:hover {
  color: #ff4d4f;
}

/* 后置操作样式 1:1 还原 (复刻自调试页) */
.post-op-item-wrapper {
  margin-bottom: 8px;
}

.post-op-item {
  display: flex;
  align-items: center;
  background: #f8f9fc;
  border: 1px solid #eef1f6;
  border-radius: 6px;
  padding: 8px 12px;
  gap: 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.post-op-item:hover {
  border-color: #7d33ff;
  background: #fff;
  box-shadow: 0 2px 8px rgba(125, 51, 255, 0.08);
}

.post-op-item.is-editing {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-color: #7d33ff;
  background: #fff;
}

.op-drag-handle {
  color: #ccc;
  cursor: grab;
  font-size: 14px;
}

.op-main-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.op-status-icon {
  color: #52c41a;
  font-size: 16px;
}

.op-type-label {
  color: #1a1f36;
  font-weight: 500;
}

.op-name-tag {
  color: #7d33ff;
  background: #f0f4ff;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.op-var-scope {
  color: #8792a2;
}

.op-details {
  color: #5c6676;
  font-family: monospace;
}

.op-right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #8792a2;
}

.action-icon {
  cursor: pointer;
  font-size: 14px;
}

.action-icon:hover { color: #1a1f36; }
.action-icon.delete:hover { color: #ff4d4f; }

.op-edit-panel {
  border: 1px solid #7d33ff;
  border-top: none;
  border-radius: 0 0 6px 6px;
  padding: 16px;
  background: #fff;
  margin-top: -1px;
  margin-bottom: 8px;
}

.edit-row {
  display: flex;
  gap: 16px;
}

.edit-col {
  flex: 1;
}

.flex-2 { flex: 2; }

.edit-label {
  font-size: 12px;
  color: #8792a2;
  margin-bottom: 8px;
}

.mt-12 { margin-top: 12px; }

.editing-text {
  color: #7d33ff;
  font-style: italic;
}

/* 1:1 断言表单样式 */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.edit-form-row {
  display: flex;
  align-items: center;
}

.edit-form-label {
  width: 120px;
  font-size: 13px;
  color: #1a1f36;
  display: flex;
  align-items: center;
  gap: 4px;
}

.edit-form-content {
  flex: 1;
}

.flex-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.flex-row-append {
  display: flex;
  align-items: center;
  color: #8792a2;
  font-size: 12px;
}

.append-text { margin-right: 8px; }
.ml-12 { margin-left: 12px; }

.index-input {
  width: 60px !important;
}

.operator-select {
  width: 180px !important;
}

.label-icon {
  font-size: 14px;
  color: #ccc;
  cursor: help;
}

.wand-icon {
  cursor: pointer;
  color: #7d33ff;
}

.op-summary-text {
  color: #5c6676;
  font-size: 13px;
}

/* 虚线添加框 */
.add-op-dashed-box {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  margin-bottom: 24px;
  transition: all 0.2s;
}

.add-op-dashed-box:hover {
  border-color: #7d33ff;
  background: #fcfaff;
}

.add-op-trigger {
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #7d33ff;
  cursor: pointer;
  font-size: 13px;
}

/* 快速面板 */
.quick-op-panel {
  padding: 0;
}

.quick-section {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 24px;
}

.section-label {
  font-size: 12px;
  color: #8792a2;
  width: 40px;
  padding-top: 8px;
}

.quick-items {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #5c6676;
}

.quick-item:hover {
  background: #f5f7fa;
  color: #1a1f36;
}

/* ── AI 生成用例弹窗 1:1 还原 ── */
:deep(.ai-gen-modal .n-modal) {
  padding: 0 !important;
}

.ai-modal-wrap {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 标题栏 */
.ai-modal-titlebar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid #f0f0f0;
}

.ai-close-btn {
  font-size: 16px;
  color: #8792a2;
  cursor: pointer;
  flex-shrink: 0;
}

.ai-close-btn:hover { color: #1a1f36; }

.ai-modal-title-text {
  font-size: 16px;
  font-weight: 600;
  color: #1a1f36;
}

/* 配置主体 */
.ai-config-body {
  padding: 20px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.ai-section-label {
  font-size: 12px;
  color: #a0aab8;
  margin-bottom: 16px;
}

/* 分类块 */
.ai-category-block {
  margin-bottom: 18px;
}

.ai-category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.ai-category-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1f36;
}

.ai-select-all {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #7d33ff;
  cursor: pointer;
  user-select: none;
}

.ai-check-icon {
  font-size: 16px;
  color: #d0d5e0;
  transition: color 0.15s;
}

.ai-check-icon.checked {
  color: #7d33ff;
}

/* 标签列表 */
.ai-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ai-tag-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid #e8ecf4;
  background: #f8f9fc;
  font-size: 13px;
  color: #5c6676;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s;
}

.ai-tag-item:hover {
  border-color: #c4a8ff;
  background: #f5f0ff;
  color: #7d33ff;
}

.ai-tag-item.checked {
  border-color: #7d33ff;
  background: #f0eaff;
  color: #7d33ff;
}

.ai-tag-check {
  font-size: 15px;
  color: #d0d5e0;
  transition: color 0.15s;
  flex-shrink: 0;
}

.ai-tag-item.checked .ai-tag-check {
  color: #7d33ff;
}

/* 额外要求输入框 */
.ai-extra-input {
  margin-top: 4px;
  margin-bottom: 16px;
}

:deep(.ai-textarea .n-input__textarea-el) {
  font-size: 13px;
  color: #1a1f36;
  resize: none;
}

:deep(.ai-textarea .n-input) {
  border-radius: 8px;
  border-color: #e8ecf4 !important;
  background: #fafbfc !important;
}

/* 生成按钮 */
.ai-generate-btn-wrap {
  padding: 0 0 12px;
}

.ai-generate-btn {
  background: linear-gradient(135deg, #7d33ff 0%, #5b21b6 100%) !important;
  border: none !important;
  border-radius: 8px !important;
  height: 44px !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  letter-spacing: 1px;
}

.ai-generate-btn:disabled {
  opacity: 0.5 !important;
}

/* 底部信息栏 */
.ai-modal-footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 16px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #a0aab8;
}

.ai-footer-link {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #7d33ff;
  cursor: pointer;
}

.ai-footer-meta {
  display: flex;
  gap: 16px;
}

/* 生成中 */
.ai-loading-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 20px;
}

.ai-loading-text {
  font-size: 15px;
  color: #1a1f36;
  font-weight: 500;
}

.ai-loading-sub {
  font-size: 12px;
  color: #a0aab8;
}

/* 生成结果 */
.ai-result-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
}

.ai-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #5c6676;
}

.ai-result-count b { color: #7d33ff; }

.ai-case-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 420px;
  overflow-y: auto;
}

.ai-case-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid #eef1f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  background: #fff;
}

.ai-case-item:hover { border-color: #c4a8ff; background: #faf7ff; }
.ai-case-item.selected { border-color: #7d33ff; background: #f5f0ff; }

.ai-case-check { padding-top: 2px; flex-shrink: 0; }

.ai-case-body { flex: 1; min-width: 0; }

.ai-case-name {
  font-size: 13px;
  color: #1a1f36;
  line-height: 1.5;
  margin-bottom: 6px;
}

.ai-case-meta { display: flex; align-items: center; gap: 8px; }

.ai-type-tag {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.ai-type-tag.positive  { background: #f6ffed; color: #389e0d; border: 1px solid #b7eb8f; }
.ai-type-tag.negative  { background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e; }
.ai-type-tag.boundary  { background: #e6f7ff; color: #096dd9; border: 1px solid #91d5ff; }
.ai-type-tag.security  { background: #fff7e6; color: #d46b08; border: 1px solid #ffd591; }
.ai-type-tag.other     { background: #f5f5f5; color: #595959; border: 1px solid #d9d9d9; }

.ai-assert-hint { font-size: 11px; color: #a0aab8; }

.ai-result-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.ai-select-hint { font-size: 12px; color: #a0aab8; }
</style>
