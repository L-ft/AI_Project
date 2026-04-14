<template>
  <div class="api-debug-container">
    <!-- 请求地址栏 -->
    <div class="debug-url-bar">
      <div class="debug-title-row">
        <n-input
          v-model:value="editableName"
          :placeholder="data?.isTestCase ? '用例名称' : '接口名称'"
          ghost
          class="debug-name-input"
        />
      </div>
      <div class="debug-request-row">
        <div class="method-url-group">
          <n-input-group>
            <n-select
              v-model:value="method"
              :options="methodOptions"
              :class="['method-select', method.toLowerCase()]"
              :style="{ width: '110px' }"
            />
            <div class="url-input-wrapper">
              <span class="base-url">{{ envBaseUrl }}</span>
              <n-input
                v-model:value="path"
                placeholder="接口路径"
                ghost
                class="path-input"
              />
            </div>
          </n-input-group>
        </div>
        <div class="debug-url-actions">
          <n-space justify="end" :size="8" wrap align="center">
            <n-button-group>
              <n-button
                type="primary"
                color="#7D33FF"
                class="send-btn"
                :loading="sending"
                @click="handleSend"
              >
                发送
              </n-button>
              <n-button type="primary" color="#7D33FF" style="padding: 0 8px">
                <template #icon><n-icon :component="DownOutlined" /></template>
              </n-button>
            </n-button-group>
            <template v-if="data?.isTestCase">
              <n-button secondary @click="handleUpdateCase">保存</n-button>
              <n-button secondary @click="handleDeleteCase" class="delete-btn">删除</n-button>
            </template>
            <template v-else>
              <n-button secondary :loading="interfaceSaving" @click="handleSaveInterface">保存</n-button>
              <n-button secondary @click="showSaveCaseModal = true">保存为用例</n-button>
            </template>
          </n-space>
        </div>
      </div>
    </div>

    <!-- 保存为用例弹窗 -->
    <n-modal
      v-model:show="showSaveCaseModal"
      preset="card"
      title="保存为用例"
      class="save-case-modal"
      :segmented="{ content: 'soft' }"
      :style="{ width: '440px', borderRadius: '12px' }"
    >
      <div class="modal-form">
        <div class="form-item">
          <div class="form-label">用例名称 <span class="required">*</span></div>
          <div class="case-name-input-group">
            <span class="prefix">{{ data?.label || '获取 token' }} (</span>
            <n-select
              v-model:value="caseName"
              filterable
              tag
              placeholder="用例名称"
              :options="caseNameOptions"
              class="case-name-select"
            />
            <span class="suffix">)</span>
          </div>
        </div>

        <div class="form-item">
          <div class="form-label">用例类型</div>
          <n-radio-group v-model:value="caseType" name="caseType">
            <n-space>
              <n-radio value="debug">调试用例</n-radio>
              <n-radio value="test">测试用例</n-radio>
            </n-space>
          </n-radio-group>
        </div>

        <div class="form-item checkbox-item">
          <n-checkbox v-model:checked="saveResponse">
            同时保存响应
          </n-checkbox>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-space justify="end">
            <n-button @click="showSaveCaseModal = false">取消</n-button>
            <n-button type="primary" color="#7D33FF" @click="handleSaveCase">保存</n-button>
          </n-space>
        </div>
      </template>
    </n-modal>

    <!-- 请求参数区域 -->
    <div class="debug-content" :style="{ height: debugContentHeight + 'px', flex: 'none' }">
      <n-tabs type="line" animated class="param-tabs" v-model:value="activeTab">
        <n-tab-pane name="params" :tab="`Params ${queryParams.length > 0 ? queryParams.length : ''}`">
          <div class="pane-content">
            <n-data-table
              :columns="debugQueryColumns"
              :data="queryParams"
              :row-key="(row: any) => row.key"
              :bordered="true"
              :single-line="false"
              size="small"
              class="param-data-table"
              :pagination="false"
            />
            <n-button dashed block class="param-add-btn" @click="addQueryParam">添加参数</n-button>
          </div>
        </n-tab-pane>
        <n-tab-pane name="body" tab="Body">
          <div class="pane-content">
            <!-- Body 类型选择 -->
            <div class="body-type-selector">
              <span 
                v-for="opt in bodyTypeOptions" 
                :key="opt.value"
                :class="['type-item', { active: bodyType === opt.value }]"
                :data-type="opt.value"
                @click="bodyType = opt.value"
              >
                {{ opt.label }}
              </span>
            </div>

            <!-- JSON 编辑区域 -->
            <div v-if="['json', 'text', 'xml'].includes(bodyType)" class="json-editor-container">
              <div class="json-toolbar">
                <n-button size="tiny" secondary class="dynamic-value-btn">
                  <template #icon><n-icon :component="ThunderboltOutlined" /></template>
                  动态值
                </n-button>
                <div class="json-toolbar-right">
                  <div class="warning-tag">
                    <n-icon :component="InfoCircleOutlined" /> 与定义不一致
                  </div>
                  <n-button text size="tiny">
                    <template #icon><n-icon :component="CodeOutlined" /></template>
                    提取
                  </n-button>
                  <n-button text size="tiny">
                    <template #icon><n-icon :component="FormatPainterOutlined" /></template>
                    格式化
                  </n-button>
                </div>
              </div>
              <div class="editor-area">
                <div class="line-numbers">1</div>
                <textarea
                  v-model="bodyJsonContent"
                  class="json-textarea"
                  spellcheck="false"
                ></textarea>
              </div>
            </div>
            <div v-else class="empty-body-pane">
              <n-empty :description="`暂未实现 ${bodyType} 预览`" />
            </div>
          </div>
        </n-tab-pane>
        <n-tab-pane name="headers" :tab="`Headers ${headerParams.length > 0 ? headerParams.length : ''}`">
          <div class="pane-content header-pane">
            <div class="header-hero">
              <div>
                <div class="header-hero-title">全局 Header 参数</div>
                <div class="header-hero-desc">支持常用请求头快速注入、变量引用、类型说明和运行前替换，例如 <code>Bearer {{ headerPreviewToken }}</code>。</div>
                <div class="header-stats-line">
                  <span>总数 {{ headerParams.length }}</span>
                  <span>已启用 {{ enabledHeaderPreview.length }}</span>
                  <span v-if="activeHeaderRow">当前编辑 {{ activeHeaderRow.name || '未命名 Header' }}</span>
                </div>
              </div>
              <div class="header-hero-actions">
                <button type="button" class="header-preset-pill" @click="addHeaderPreset('auth')">Authorization</button>
                <button type="button" class="header-preset-pill" @click="addHeaderPreset('json')">Content-Type</button>
                <button type="button" class="header-preset-pill" @click="addHeaderPreset('trace')">TraceId</button>
                <button type="button" class="header-preset-pill primary" @click="addHeaderParam()">新增 Header</button>
              </div>
            </div>

            <div class="header-toolbar">
              <n-input
                v-model:value="headerKeyword"
                size="small"
                clearable
                placeholder="搜索 Header 名称、值或说明"
                class="header-search-input"
              />
              <div class="header-toolbar-actions">
                <button type="button" class="header-toolbar-btn" @click="showDisabledHeaders = !showDisabledHeaders">
                  {{ showDisabledHeaders ? '仅看启用' : '显示全部' }}
                </button>
                <button type="button" class="header-toolbar-btn" @click="enableAllHeaders()">全部启用</button>
                <button type="button" class="header-toolbar-btn danger" @click="removeDisabledHeaders()">清理未启用</button>
              </div>
            </div>

            <div class="header-variable-bar">
              <span class="header-variable-label">变量引用</span>
              <button
                v-for="variableName in headerVariableSuggestions"
                :key="variableName"
                type="button"
                class="header-variable-chip"
                @click="insertHeaderVariable(variableName)"
              >
                {{ formatVariableReference(variableName) }}
              </button>
            </div>

            <div class="header-board">
              <div class="header-board-head">
                <div class="col-check"></div>
                <div class="col-name">参数名</div>
                <div class="col-eq"></div>
                <div class="col-value">参数值</div>
                <div class="col-type">类型</div>
                <div class="col-desc">说明</div>
                <div class="col-action"></div>
              </div>

              <div v-if="filteredHeaderParams.length > 0" class="header-board-body">
                <div
                  v-for="(row, index) in filteredHeaderParams"
                  :key="row.key"
                  class="header-row"
                  :class="{ disabled: row.enabled === false, active: activeHeaderKey === row.key }"
                  @click="setActiveHeader(row.key)"
                >
                  <div class="col-check">
                    <input v-model="row.enabled" type="checkbox" class="header-enable-checkbox" />
                  </div>
                  <div class="col-name">
                    <n-input v-model:value="row.name" size="small" placeholder="如 Authorization" @focus="setActiveHeader(row.key)" />
                  </div>
                  <div class="col-eq">=</div>
                  <div class="col-value">
                    <n-input v-model:value="row.example" size="small" placeholder="如 Bearer {{token}}" @focus="setActiveHeader(row.key)" />
                    <div class="header-row-tools">
                      <button type="button" class="header-inline-btn" @click="applyBearerTokenToHeader(row)">引用 token</button>
                      <button
                        v-for="variableName in headerVariableSuggestions.slice(0, 4)"
                        :key="`${row.key}-${variableName}`"
                        type="button"
                        class="header-inline-chip"
                        @click="appendHeaderVariable(row, variableName)"
                      >
                        {{ formatVariableReference(variableName) }}
                      </button>
                    </div>
                  </div>
                  <div class="col-type">
                    <n-select v-model:value="row.type" size="small" :options="paramTypeOptions" @update:value="() => setActiveHeader(row.key)" />
                  </div>
                  <div class="col-desc">
                    <n-input v-model:value="row.desc" size="small" placeholder="可填写用途说明" @focus="setActiveHeader(row.key)" />
                  </div>
                  <div class="col-action">
                    <button type="button" class="header-icon-btn danger" @click="removeHeaderParam(row.key)">删除</button>
                  </div>
                </div>
              </div>

              <div v-else class="header-empty-state">
                <div class="header-empty-title">还没有 Header 参数</div>
                <div class="header-empty-desc">{{ headerParams.length > 0 ? '当前筛选条件下没有匹配的 Header。' : `推荐先添加 Authorization，并通过 ${headerPreviewToken} 引用环境变量，实现 Bearer Token 自动替换。` }}</div>
                <div class="header-empty-actions">
                  <button type="button" class="header-preset-pill primary" @click="addHeaderPreset('auth')">一键添加 Authorization</button>
                  <button type="button" class="header-preset-pill" @click="resetHeaderFilters()">重置筛选</button>
                </div>
              </div>
            </div>

            <div class="header-preview-card" v-if="enabledHeaderPreview.length > 0">
              <div class="header-preview-title">发送预览</div>
              <div v-for="item in enabledHeaderPreview" :key="item.key" class="header-preview-line">
                <span class="header-preview-name">{{ item.name }}</span>
                <span class="header-preview-sep">:</span>
                <span class="header-preview-value">{{ item.example }}</span>
              </div>
            </div>
          </div>
        </n-tab-pane>
        <!-- Cookies Tab -->
        <n-tab-pane name="cookies" :tab="`Cookies${cookies.length > 0 ? ' ' + cookies.length : ''}`">
          <div class="pane-content cookies-pane">
            <div class="cookies-tip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Cookie 将以 <code>Cookie: name=value</code> 形式添加到请求 Header，优先级低于 Headers 中手动设置的 Cookie。
            </div>

            <table class="cookie-table">
              <thead>
                <tr>
                  <th class="ck-col-check"></th>
                  <th class="ck-col-name">Cookie 名称</th>
                  <th class="ck-col-value">值</th>
                  <th class="ck-col-domain">域名</th>
                  <th class="ck-col-path">路径</th>
                  <th class="ck-col-expires">过期时间</th>
                  <th class="ck-col-flags">Secure</th>
                  <th class="ck-col-flags">HttpOnly</th>
                  <th class="ck-col-action"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(ck, idx) in cookies" :key="ck._key" class="cookie-row" :class="{ 'ck-disabled': !ck.enabled }">
                  <td class="ck-col-check">
                    <n-checkbox v-model:checked="ck.enabled" size="small" />
                  </td>
                  <td class="ck-col-name">
                    <input v-model="ck.name" class="ck-input" placeholder="token" />
                  </td>
                  <td class="ck-col-value">
                    <input v-model="ck.value" class="ck-input" placeholder="abc123" />
                  </td>
                  <td class="ck-col-domain">
                    <input v-model="ck.domain" class="ck-input" placeholder=".example.com" />
                  </td>
                  <td class="ck-col-path">
                    <input v-model="ck.path" class="ck-input" placeholder="/" />
                  </td>
                  <td class="ck-col-expires">
                    <input v-model="ck.expires" class="ck-input" placeholder="2025-12-31" />
                  </td>
                  <td class="ck-col-flags">
                    <n-checkbox v-model:checked="ck.secure" size="small" />
                  </td>
                  <td class="ck-col-flags">
                    <n-checkbox v-model:checked="ck.httpOnly" size="small" />
                  </td>
                  <td class="ck-col-action">
                    <button class="ck-del-btn" @click="removeCookie(idx)" title="删除">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="cookies.length === 0">
                  <td colspan="9" class="ck-empty-row">暂无 Cookie，点击下方添加</td>
                </tr>
              </tbody>
            </table>
            <n-button dashed block class="param-add-btn" @click="addCookie">添加 Cookie</n-button>
          </div>
        </n-tab-pane>

        <!-- Auth Tab -->
        <n-tab-pane name="auth" :tab="`Auth${authType !== 'none' ? ' •' : ''}`">
          <div class="pane-content auth-pane">

            <!-- 类型选择卡片 -->
            <div class="auth-type-grid">
              <div
                v-for="at in authTypeOptions"
                :key="at.value"
                :class="['auth-type-card', { active: authType === at.value }]"
                @click="authType = at.value"
              >
                <div class="auth-type-icon" :style="{ background: at.color }">
                  <svg v-html="at.svgInner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"></svg>
                </div>
                <div class="auth-type-label">{{ at.label }}</div>
                <div v-if="authType === at.value" class="auth-type-check">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7d33ff" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
            </div>

            <!-- None -->
            <div v-if="authType === 'none'" class="auth-none-hint">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <p>当前未配置认证。选择上方认证类型以补充认证信息。</p>
            </div>

            <!-- Bearer Token -->
            <div v-else-if="authType === 'bearer'" class="auth-form">
              <div class="auth-form-section">
                <div class="auth-form-label">
                  Token
                  <span class="auth-form-hint">将以 <code>Authorization: Bearer &lt;token&gt;</code> 形式注入</span>
                </div>
                <n-input
                  v-model:value="authBearer.token"
                  type="textarea"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  :autosize="{ minRows: 2, maxRows: 6 }"
                  class="auth-token-input"
                />
              </div>
                <div class="auth-form-section">
                  <div class="auth-form-label">前缀</div>
                  <n-input v-model:value="authBearer.prefix" placeholder="Bearer" style="max-width: 180px;" />
                </div>
            </div>

            <!-- Basic Auth -->
            <div v-else-if="authType === 'basic'" class="auth-form">
              <div class="auth-form-row">
                <div class="auth-form-section">
                  <div class="auth-form-label">用户名 <span class="auth-req">*</span></div>
                  <n-input v-model:value="authBasic.username" placeholder="admin" />
                </div>
                <div class="auth-form-section">
                  <div class="auth-form-label">密码</div>
                  <n-input v-model:value="authBasic.password" type="password" placeholder="请输入密码" show-password-on="click" />
                </div>
              </div>
              <div class="auth-preview">
                <span class="auth-preview-label">生成 Header：</span>
                <code class="auth-preview-value">Authorization: Basic {{ basicAuthEncoded }}</code>
              </div>
            </div>

            <!-- API Key -->
            <div v-else-if="authType === 'apikey'" class="auth-form">
              <div class="auth-form-row">
                <div class="auth-form-section">
                  <div class="auth-form-label">Key 名称 <span class="auth-req">*</span></div>
                  <n-input v-model:value="authApiKey.key" placeholder="X-API-Key" />
                </div>
                <div class="auth-form-section">
                  <div class="auth-form-label">Value <span class="auth-req">*</span></div>
                  <n-input v-model:value="authApiKey.value" type="password" placeholder="your-api-key" show-password-on="click" />
                </div>
              </div>
                <div class="auth-form-section">
                  <div class="auth-form-label">添加位置</div>
                  <n-radio-group v-model:value="authApiKey.in" name="apikeyIn">
                    <n-space>
                      <n-radio value="header">Header</n-radio>
                      <n-radio value="query">Query 参数</n-radio>
                    </n-space>
                  </n-radio-group>
                </div>
            </div>

            <!-- OAuth 2.0 -->
            <div v-else-if="authType === 'oauth2'" class="auth-form">
              <div class="auth-form-section">
                <div class="auth-form-label">Grant Type</div>
                <n-select
                  v-model:value="authOAuth2.grantType"
                  :options="[
                    { label: 'Client Credentials', value: 'client_credentials' },
                    { label: 'Password', value: 'password' },
                    { label: 'Authorization Code', value: 'authorization_code' },
                    { label: 'Implicit', value: 'implicit' }
                  ]"
                  style="max-width: 280px;"
                />
              </div>
              <div class="auth-form-row">
                <div class="auth-form-section">
                  <div class="auth-form-label">Token URL <span class="auth-req">*</span></div>
                  <n-input v-model:value="authOAuth2.tokenUrl" placeholder="https://auth.example.com/oauth/token" />
                </div>
              </div>
              <div class="auth-form-row">
                <div class="auth-form-section">
                  <div class="auth-form-label">Client ID</div>
                  <n-input v-model:value="authOAuth2.clientId" placeholder="your-client-id" />
                </div>
                <div class="auth-form-section">
                  <div class="auth-form-label">Client Secret</div>
                  <n-input v-model:value="authOAuth2.clientSecret" type="password" placeholder="your-client-secret" show-password-on="click" />
                </div>
              </div>
              <div v-if="authOAuth2.grantType === 'password'" class="auth-form-row">
                <div class="auth-form-section">
                  <div class="auth-form-label">用户名</div>
                  <n-input v-model:value="authOAuth2.username" placeholder="admin" />
                </div>
                <div class="auth-form-section">
                  <div class="auth-form-label">瀵嗙爜</div>
                  <n-input v-model:value="authOAuth2.password" type="password" show-password-on="click" />
                </div>
              </div>
                <div class="auth-form-section">
                  <div class="auth-form-label">Scope（可选）</div>
                  <n-input v-model:value="authOAuth2.scope" placeholder="read write" />
                </div>
              <div class="auth-form-section">
                <div class="auth-form-label">Access Token</div>
                <div class="oauth-token-row">
                  <n-input v-model:value="authOAuth2.accessToken" placeholder="获取到的 Token 将显示在这里" />
                  <n-button type="primary" color="#7d33ff" :loading="oauthLoading" @click="fetchOAuth2Token">获取 Token</n-button>
                </div>
                <div v-if="authOAuth2.accessToken" class="auth-preview">
                  <span class="auth-preview-label">注入为：</span>
                  <code class="auth-preview-value">Authorization: Bearer {{ authOAuth2.accessToken.slice(0, 40) }}...</code>
                </div>
              </div>
            </div>

          </div>
        </n-tab-pane>
        <n-tab-pane name="pre" :tab="`前置操作 ${preOperations.length > 0 ? preOperations.length : ''}`">
          <div class="pane-content pre-ops-pane">
            <div class="pre-ops-header">
              <div>
                <div class="pre-ops-title">请求前置编排</div>
                <div class="pre-ops-subtitle">在发送请求之前准备变量、补充签名、等待节流或预置数据库数据。</div>
              </div>
              <div class="pre-ops-pill">执行顺序从上到下</div>
            </div>

            <div class="pre-op-quick-add">
              <button
                v-for="option in addPreOpOptions"
                :key="option.key"
                type="button"
                class="pre-op-add-card"
                :class="`type-${option.key}`"
                @click="handleAddPreOp(option.key)"
              >
                <div class="pre-op-add-icon">
                  <n-icon :component="option.icon" />
                </div>
                <div class="pre-op-add-body">
                  <div class="pre-op-add-name">{{ option.label }}</div>
                  <div class="pre-op-add-desc">{{ option.description }}</div>
                </div>
              </button>
            </div>

            <div v-if="preOperations.length > 0" class="pre-ops-list">
              <div
                v-for="(op, index) in preOperations"
                :key="op.id || index"
                class="pre-op-card"
                :class="[`type-${op.type}`, { expanded: editingPreOpIndex === index }]"
              >
                <div class="pre-op-strip"></div>
                <div class="pre-op-shell">
                  <div class="pre-op-summary" @click="editingPreOpIndex = editingPreOpIndex === index ? null : index">
                    <div class="pre-op-summary-main">
                      <div class="pre-op-icon">
                        <n-icon :component="preOpIcon(op.type)" />
                      </div>
                      <div class="pre-op-texts">
                        <div class="pre-op-meta">
                          <span class="pre-op-type">{{ preOpTypeLabel(op.type) }}</span>
                          <span class="pre-op-name">{{ op.name || `${preOpTypeLabel(op.type)} ${index + 1}` }}</span>
                          <span v-if="!op.enabled" class="pre-op-disabled-tag">已停用</span>
                        </div>
                        <div class="pre-op-description">{{ preOpSummary(op) }}</div>
                      </div>
                    </div>
                    <div class="pre-op-actions">
                      <n-switch v-model:value="op.enabled" size="small" @click.stop />
                      <n-icon :component="DeleteOutlined" class="action-icon delete" @click.stop="removePreOp(index)" />
                      <n-icon
                        :component="editingPreOpIndex === index ? UpOutlined : RightOutlined"
                        class="action-icon"
                        @click.stop="editingPreOpIndex = editingPreOpIndex === index ? null : index"
                      />
                    </div>
                  </div>

                  <div v-if="editingPreOpIndex === index" class="pre-op-editor">
                    <div class="pre-op-editor-grid">
                      <div class="pre-op-field">
                        <div class="pre-op-label">操作名称</div>
                        <n-input v-model:value="op.name" size="small" placeholder="给这一步起个名字" />
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">操作类型</div>
                        <div class="pre-op-type-chip" :class="`type-${op.type}`">{{ preOpTypeLabel(op.type) }}</div>
                      </div>
                    </div>

                    <template v-if="op.type === 'db'">
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">数据源</div>
                          <n-input v-model:value="op.config.datasource" size="small" placeholder="留空则 default/mysql-main" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">执行动作</div>
                          <n-select v-model:value="op.config.action" size="small" :options="dbActionOptions" />
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">SQL</div>
                        <n-input
                          v-model:value="op.config.sql"
                          type="textarea"
                          size="small"
                          :autosize="{ minRows: 5, maxRows: 10 }"
                          placeholder="SELECT * FROM user WHERE id = {{userId}}"
                        />
                      </div>
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">结果变量</div>
                          <n-input v-model:value="op.config.result_var" size="small" placeholder="如 dbResult" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">超时（ms）</div>
                          <n-input v-model:value="op.config.timeout_ms" size="small" placeholder="5000" />
                        </div>
                      </div>
                    </template>

                    <template v-else-if="op.type === 'script'">
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">脚本语言</div>
                          <n-select
                            v-model:value="op.config.language"
                            size="small"
                            :options="scriptLanguageOptions"
                            @update:value="(value) => handleScriptLanguageChange(op, value)"
                          />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">说明</div>
                          <div class="pre-op-hint">脚本会拿到 `context`，可直接修改路径、参数、请求体和变量。</div>
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">代码片段</div>
                        <div v-if="op.config.language !== 'javascript'" class="script-engine-warning">
                          <span class="script-engine-warning-title">{{ getScriptLanguageLabel(op.config.language) }} 执行引擎暂未接入</span>
                          <span class="script-engine-warning-text">当前提供的是语法模板和编写辅助，真实执行目前仅支持 JavaScript。</span>
                        </div>
                        <div class="script-snippet-groups">
                          <div class="script-snippet-group">
                            <div class="script-snippet-group-title">通用片段</div>
                            <div class="script-snippet-list">
                              <div
                                v-for="snippet in getCommonScriptSnippetOptions(op.config.language)"
                                :key="snippet.key"
                              >
                                <div class="script-snippet-row">
                                  <button
                                    type="button"
                                    class="script-snippet-item"
                                    @click="applyScriptSnippet(op, snippet.code)"
                                  >
                                    {{ snippet.label }}
                                  </button>
                                  <button
                                    type="button"
                                    class="script-snippet-copy"
                                    @click="copyScriptSnippet(snippet.code)"
                                  >
                                    复制
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="script-snippet-group">
                            <div class="script-snippet-group-title">{{ getScriptLanguageLabel(op.config.language) }} 语法片段</div>
                            <div class="script-snippet-list secondary">
                              <div
                                v-for="snippet in getLanguageScriptSnippetOptions(op.config.language)"
                                :key="snippet.key"
                              >
                                <div class="script-snippet-row">
                                  <button
                                    type="button"
                                    class="script-snippet-item secondary"
                                    @click="applyScriptSnippet(op, snippet.code)"
                                  >
                                    {{ snippet.label }}
                                  </button>
                                  <button
                                    type="button"
                                    class="script-snippet-copy"
                                    @click="copyScriptSnippet(snippet.code)"
                                  >
                                    复制
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">脚本内容</div>
                        <div class="script-editor-toolbar">
                          <button
                            type="button"
                            class="script-toolbar-btn"
                            :disabled="!canUndoScriptChange(op.id)"
                            @click="undoScriptChange(op)"
                          >
                            撤销
                          </button>
                          <button
                            type="button"
                            class="script-toolbar-btn"
                            @click="restoreDefaultScript(op)"
                          >
                            恢复默认模板
                          </button>
                          <button
                            type="button"
                            class="script-toolbar-btn"
                            @click="formatScriptContent(op)"
                          >
                            简单格式化
                          </button>
                          <button
                            type="button"
                            class="script-toolbar-btn danger"
                            @click="clearScriptContent(op)"
                          >
                            清空
                          </button>
                        </div>
                        <div :ref="(el) => setScriptEditorRef(op.id, el)" class="script-editor-wrapper">
                          <n-input
                            v-model:value="op.config.script"
                            type="textarea"
                            size="small"
                            :autosize="{ minRows: 8, maxRows: 14 }"
                            placeholder="context.setVar('ts', Date.now())"
                            @focus="rememberScriptCursor(op.id)"
                            @click="rememberScriptCursor(op.id)"
                            @keyup="rememberScriptCursor(op.id)"
                          />
                        </div>
                        <div class="script-editor-tip">点击代码片段会插入到当前光标处；如果选中了文本，会直接替换选中内容。</div>
                        <div class="script-api-panel">
                          <div class="script-api-topbar">
                            <div class="script-api-title">Context API</div>
                            <input
                              :value="getScriptApiSearch(op.id)"
                              type="text"
                              class="script-api-search"
                               placeholder="搜索 API / 描述"
                              @input="handleScriptApiSearchInput(op.id, $event)"
                            />
                          </div>
                          <div
                            v-for="group in getFilteredScriptApiGroups(op.id)"
                            :key="group.category"
                            class="script-api-group"
                          >
                            <div class="script-api-group-title">{{ group.label }}</div>
                            <div class="script-api-grid">
                              <div
                                v-for="item in group.items"
                                :key="item.name"
                                class="script-api-item"
                              >
                                <div class="script-api-head">
                                  <div class="script-api-name">{{ item.name }}</div>
                                  <button
                                    type="button"
                                    class="script-api-action"
                                    @click="applyScriptSnippet(op, getScriptApiExample(op.config.language, item.key))"
                                  >
                                    插入示例
                                  </button>
                                </div>
                                <div class="script-api-desc">{{ item.description }}</div>
                              </div>
                            </div>
                          </div>
                          <div v-if="getFilteredScriptApiGroups(op.id).length === 0" class="script-api-empty">
                            未找到匹配的 API
                          </div>
                        </div>
                      </div>
                    </template>

                    <template v-else-if="op.type === 'public_script'">
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">脚本库模板</div>
                          <n-select v-model:value="op.config.script_key" size="small" :options="publicScriptOptions" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">模板说明</div>
                          <div class="pre-op-hint">{{ currentPublicScriptDescription(op.config.script_key) }}</div>
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">模板参数（JSON）</div>
                        <n-input
                          v-model:value="op.config.params"
                          type="textarea"
                          size="small"
                          :autosize="{ minRows: 5, maxRows: 10 }"
                          placeholder='{"headerName":"Authorization"}'
                        />
                      </div>
                    </template>

                    <template v-else-if="op.type === 'wait'">
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">等待时长</div>
                          <n-input v-model:value="op.config.duration" size="small" placeholder="500" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">鏃堕棿鍗曚綅</div>
                          <n-select v-model:value="op.config.unit" size="small" :options="waitUnitOptions" />
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">备注</div>
                        <n-input v-model:value="op.config.note" size="small" placeholder="例如：等待上游缓存刷新" />
                      </div>
                    </template>

                    <template v-else-if="op.type === 'db'">
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">数据源</div>
                          <n-input v-model:value="op.config.datasource" size="small" placeholder="留空则 default/mysql-main" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">执行动作</div>
                          <n-select v-model:value="op.config.action" size="small" :options="dbActionOptions" />
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">SQL</div>
                        <n-input
                          v-model:value="op.config.sql"
                          type="textarea"
                          size="small"
                          :autosize="{ minRows: 5, maxRows: 10 }"
                          placeholder="SELECT status FROM orders WHERE order_no = {{orderNo}}"
                        />
                      </div>
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">结果变量</div>
                          <n-input v-model:value="op.config.result_var" size="small" placeholder="如 dbCheckResult" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">超时（ms）</div>
                          <n-input v-model:value="op.config.timeout_ms" size="small" placeholder="5000" />
                        </div>
                      </div>
                    </template>

                    <template v-else-if="op.type === 'script'">
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">脚本语言</div>
                          <n-select
                            v-model:value="op.config.language"
                            size="small"
                            :options="scriptLanguageOptions"
                            @update:value="(value) => handleScriptLanguageChange(op, value)"
                          />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">说明</div>
                          <div class="pre-op-hint">支持多种脚本语言、代码片段、复制片段与快捷编辑；当前执行引擎仍以 JavaScript 为主。</div>
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">代码片段</div>
                        <div v-if="op.config.language !== 'javascript'" class="script-engine-warning">
                          <span class="script-engine-warning-title">{{ getScriptLanguageLabel(op.config.language) }} 执行引擎暂未接入</span>
                          <span class="script-engine-warning-text">当前提供的是模板和辅助编写体验，真实执行目前仅支持 JavaScript。</span>
                        </div>
                        <div class="script-snippet-groups">
                          <div class="script-snippet-group">
                            <div class="script-snippet-group-title">通用片段</div>
                            <div class="script-snippet-list">
                              <div v-for="snippet in getCommonScriptSnippetOptions(op.config.language)" :key="snippet.key">
                                <div class="script-snippet-row">
                                  <button type="button" class="script-snippet-item" @click="applyScriptSnippet(op, snippet.code)">
                                    {{ snippet.label }}
                                  </button>
                                  <button type="button" class="script-snippet-copy" @click="copyScriptSnippet(snippet.code)">
                                    复制
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="script-snippet-group">
                            <div class="script-snippet-group-title">{{ getScriptLanguageLabel(op.config.language) }} 语法片段</div>
                            <div class="script-snippet-list secondary">
                              <div v-for="snippet in getLanguageScriptSnippetOptions(op.config.language)" :key="snippet.key">
                                <div class="script-snippet-row">
                                  <button type="button" class="script-snippet-item secondary" @click="applyScriptSnippet(op, snippet.code)">
                                    {{ snippet.label }}
                                  </button>
                                  <button type="button" class="script-snippet-copy" @click="copyScriptSnippet(snippet.code)">
                                    复制
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">脚本内容</div>
                        <div class="script-editor-toolbar">
                          <button type="button" class="script-toolbar-btn" :disabled="!canUndoScriptChange(op.id)" @click="undoScriptChange(op)">撤销</button>
                          <button type="button" class="script-toolbar-btn" @click="restoreDefaultScript(op)">恢复默认模板</button>
                          <button type="button" class="script-toolbar-btn" @click="formatScriptContent(op)">简单格式化</button>
                          <button type="button" class="script-toolbar-btn danger" @click="clearScriptContent(op)">清空</button>
                        </div>
                        <div :ref="(el) => setScriptEditorRef(op.id, el)" class="script-editor-wrapper">
                          <n-input
                            v-model:value="op.config.script"
                            type="textarea"
                            size="small"
                            :autosize="{ minRows: 8, maxRows: 14 }"
                            placeholder="if (statusCode !== 200) { throw new Error('response failed') }"
                            @focus="rememberScriptCursor(op.id)"
                            @click="rememberScriptCursor(op.id)"
                            @keyup="rememberScriptCursor(op.id)"
                          />
                        </div>
                      </div>
                    </template>

                    <template v-else-if="op.type === 'public_script'">
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">公共脚本</div>
                          <n-select v-model:value="op.config.script_key" size="small" :options="publicScriptOptions" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">模板说明</div>
                          <div class="pre-op-hint">{{ currentPublicScriptDescription(op.config.script_key) }}</div>
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">模板参数（JSON）</div>
                        <n-input
                          v-model:value="op.config.params"
                          type="textarea"
                          size="small"
                          :autosize="{ minRows: 5, maxRows: 10 }"
                          placeholder='{"headerName":"Authorization"}'
                        />
                      </div>
                    </template>

                    <template v-else-if="op.type === 'wait'">
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">等待时长</div>
                          <n-input v-model:value="op.config.duration" size="small" placeholder="500" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">鏃堕棿鍗曚綅</div>
                          <n-select v-model:value="op.config.unit" size="small" :options="waitUnitOptions" />
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">备注</div>
                        <n-input v-model:value="op.config.note" size="small" placeholder="例如：等待异步任务最终入库" />
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="pre-op-empty-state">
              <div class="pre-op-empty-card">
                <div class="pre-op-empty-title">还没有前置操作</div>
                <div class="pre-op-empty-desc">可以先添加数据库准备、脚本加工、脚本库模板或等待时间，让调试链路更完整。</div>
              </div>
            </div>
          </div>
        </n-tab-pane>
        <n-tab-pane name="post" :tab="`后置操作 ${postOperations.length > 0 ? postOperations.length : ''}`">
          <div class="pane-content pre-ops-pane post-ops-pane">
            <div class="pre-ops-header">
              <div>
                <div class="pre-ops-title">后置操作编排</div>
                <div class="pre-ops-subtitle">接口返回后继续执行断言、提取变量、数据库操作、自定义脚本、等待时间和公共脚本，布局与前置操作保持一致。</div>
              </div>
              <div class="pre-ops-pill">执行顺序从上到下</div>
            </div>

            <div class="pre-op-quick-add">
              <button
                v-for="option in addPostOpOptions"
                :key="option.key"
                type="button"
                class="pre-op-add-card"
                :class="`type-${option.key}`"
                @click="handleAddPostOp(option.key)"
              >
                <div class="pre-op-add-icon">
                  <n-icon :component="option.icon" />
                </div>
                <div class="pre-op-add-body">
                  <div class="pre-op-add-name">{{ option.label }}</div>
                  <div class="pre-op-add-desc">{{ option.description }}</div>
                </div>
              </button>
            </div>

            <div v-if="postOperations.length > 0" class="pre-ops-list">
              <div
                v-for="(op, index) in postOperations"
                :key="op.id || index"
                class="pre-op-card"
                :class="[`type-${op.type}`, { expanded: editingOpIndex === index }]"
              >
                <div class="pre-op-strip"></div>
                <div class="pre-op-shell">
                  <div class="pre-op-summary" @click="editingOpIndex = editingOpIndex === index ? null : index">
                    <div class="pre-op-summary-main">
                      <div class="pre-op-icon">
                        <n-icon :component="postOpIcon(op.type)" />
                      </div>
                      <div class="pre-op-texts">
                        <div class="pre-op-meta">
                          <span class="pre-op-type">{{ postOpTypeLabel(op.type) }}</span>
                          <span class="pre-op-name">{{ op.name || `${postOpTypeLabel(op.type)} ${index + 1}` }}</span>
                          <span v-if="!op.enabled" class="pre-op-disabled-tag">已停用</span>
                        </div>
                        <div class="pre-op-description">{{ postOpSummary(op) }}</div>
                      </div>
                    </div>
                    <div class="pre-op-actions">
                      <n-switch v-model:value="op.enabled" size="small" @click.stop />
                      <n-icon :component="DeleteOutlined" class="action-icon delete" @click.stop="removePostOp(index)" />
                      <n-icon
                        :component="editingOpIndex === index ? UpOutlined : RightOutlined"
                        class="action-icon"
                        @click.stop="editingOpIndex = editingOpIndex === index ? null : index"
                      />
                    </div>
                  </div>

                  <div v-if="editingOpIndex === index" class="pre-op-editor">
                    <div class="pre-op-editor-grid">
                      <div class="pre-op-field">
                        <div class="pre-op-label">操作名称</div>
                        <n-input v-model:value="op.name" size="small" placeholder="给这一步起个名字" />
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">操作类型</div>
                        <div class="pre-op-type-chip" :class="`type-${op.type}`">{{ postOpTypeLabel(op.type) }}</div>
                      </div>
                    </div>

                    <template v-if="op.type === 'assertion'">
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">断言名称</div>
                          <n-input v-model:value="op.config.name" size="small" placeholder="例如：状态码等于 200" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">断言对象</div>
                          <n-select
                            v-model:value="op.config.target"
                            size="small"
                            :options="assertTargets"
                            @update:value="(val) => {
                              op.config.target_label = assertTargets.find(t => t.value === val)?.label
                            }"
                          />
                        </div>
                      </div>
                      <div
                        v-if="['response_json', 'response_header', 'response_cookie', 'env_var', 'global_var'].includes(op.config.target)"
                        class="pre-op-field"
                      >
                        <div class="pre-op-label">表达式</div>
                        <n-input v-model:value="op.config.expression" size="small" placeholder="例如：$.data.id / content-type / token" />
                      </div>
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">断言方式</div>
                          <n-select v-model:value="op.config.operator" size="small" :options="assertOperators" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">期望值</div>
                          <n-input v-model:value="op.config.value" size="small" placeholder="根据断言方式填写" />
                        </div>
                      </div>
                    </template>

                    <template v-else-if="op.type === 'extract'">
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">变量名称</div>
                          <n-input v-model:value="op.config.name" size="small" placeholder="例如：token" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">作用域</div>
                          <n-select
                            v-model:value="op.config.target"
                            size="small"
                            :options="[
                              { label: '环境变量', value: 'environment' },
                              { label: '临时变量', value: 'temporary' }
                            ]"
                          />
                        </div>
                      </div>
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">提取来源</div>
                          <n-select
                            v-model:value="op.config.source"
                            size="small"
                            :options="[
                              { label: '响应 JSON', value: 'json' },
                              { label: '响应 Header', value: 'header' },
                              { label: '响应文本', value: 'text' }
                            ]"
                          />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">表达式</div>
                          <n-input v-model:value="op.config.expression" size="small" placeholder="例如：$.data.token / content-type" />
                        </div>
                      </div>
                    </template>

                    <template v-else-if="op.type === 'db'">
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">数据源</div>
                          <n-input v-model:value="op.config.datasource" size="small" placeholder="例如：default/mysql-main" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">执行动作</div>
                          <n-select v-model:value="op.config.action" size="small" :options="dbActionOptions" />
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">SQL</div>
                        <n-input
                          v-model:value="op.config.sql"
                          type="textarea"
                          size="small"
                          :autosize="{ minRows: 5, maxRows: 10 }"
                          placeholder="SELECT status FROM orders WHERE order_no = {{orderNo}}"
                        />
                      </div>
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">结果变量</div>
                          <n-input v-model:value="op.config.result_var" size="small" placeholder="例如：dbCheckResult" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">超时（ms）</div>
                          <n-input v-model:value="op.config.timeout_ms" size="small" placeholder="5000" />
                        </div>
                      </div>
                    </template>

                    <template v-else-if="op.type === 'script'">
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">脚本语言</div>
                          <n-select
                            v-model:value="op.config.language"
                            size="small"
                            :options="scriptLanguageOptions"
                            @update:value="(value) => handleScriptLanguageChange(op, value)"
                          />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">说明</div>
                          <div class="pre-op-hint">支持多种脚本语言、代码片段、复制片段与快捷编辑；当前执行引擎仍以 JavaScript 为主。</div>
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">代码片段</div>
                        <div v-if="op.config.language !== 'javascript'" class="script-engine-warning">
                          <span class="script-engine-warning-title">{{ getScriptLanguageLabel(op.config.language) }} 执行引擎暂未接入</span>
                          <span class="script-engine-warning-text">当前提供的是模板和辅助编写体验，真实执行目前仅支持 JavaScript。</span>
                        </div>
                        <div class="script-snippet-groups">
                          <div class="script-snippet-group">
                            <div class="script-snippet-group-title">通用代码片段</div>
                            <div class="script-snippet-list">
                              <div
                                v-for="snippet in getCommonScriptSnippetOptions(op.config.language)"
                                :key="snippet.key"
                              >
                                <div class="script-snippet-row">
                                  <button
                                    type="button"
                                    class="script-snippet-item"
                                    @click="applyScriptSnippet(op, snippet.code)"
                                  >
                                    {{ snippet.label }}
                                  </button>
                                  <button
                                    type="button"
                                    class="script-snippet-copy"
                                    @click="copyScriptSnippet(snippet.code)"
                                  >
                                    复制
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="script-snippet-group">
                            <div class="script-snippet-group-title">{{ getScriptLanguageLabel(op.config.language) }} 语法片段</div>
                            <div class="script-snippet-list secondary">
                              <div
                                v-for="snippet in getLanguageScriptSnippetOptions(op.config.language)"
                                :key="snippet.key"
                              >
                                <div class="script-snippet-row">
                                  <button
                                    type="button"
                                    class="script-snippet-item secondary"
                                    @click="applyScriptSnippet(op, snippet.code)"
                                  >
                                    {{ snippet.label }}
                                  </button>
                                  <button
                                    type="button"
                                    class="script-snippet-copy"
                                    @click="copyScriptSnippet(snippet.code)"
                                  >
                                    复制
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">脚本内容</div>
                        <div class="script-editor-toolbar">
                          <button
                            type="button"
                            class="script-toolbar-btn"
                            :disabled="!canUndoScriptChange(op.id)"
                            @click="undoScriptChange(op)"
                          >
                            鎾ら攢
                          </button>
                          <button
                            type="button"
                            class="script-toolbar-btn"
                            @click="restoreDefaultScript(op)"
                          >
                            恢复默认模板
                          </button>
                          <button
                            type="button"
                            class="script-toolbar-btn"
                            @click="formatScriptContent(op)"
                          >
                            简单整理
                          </button>
                          <button
                            type="button"
                            class="script-toolbar-btn danger"
                            @click="clearScriptContent(op)"
                          >
                            清空
                          </button>
                        </div>
                        <div :ref="(el) => setScriptEditorRef(op.id, el)" class="script-editor-wrapper">
                          <n-input
                            v-model:value="op.config.script"
                            type="textarea"
                            size="small"
                            :autosize="{ minRows: 8, maxRows: 14 }"
                            placeholder="if (statusCode !== 200) { throw new Error('response failed') }"
                            @focus="rememberScriptCursor(op.id)"
                            @click="rememberScriptCursor(op.id)"
                            @keyup="rememberScriptCursor(op.id)"
                          />
                        </div>
                        <div class="script-editor-tip">点击代码片段会插入到当前光标处；如果选中了文本，会直接替换选中内容。</div>
                        <div class="script-api-panel">
                          <div class="script-api-topbar">
                            <div class="script-api-title">Context API</div>
                            <input
                              :value="getScriptApiSearch(op.id)"
                              type="text"
                              class="script-api-search"
                              placeholder="搜索 API / 描述"
                              @input="handleScriptApiSearchInput(op.id, $event)"
                            />
                          </div>
                          <div
                            v-for="group in getFilteredScriptApiGroups(op.id)"
                            :key="group.category"
                            class="script-api-group"
                          >
                            <div class="script-api-group-title">{{ group.label }}</div>
                            <div class="script-api-grid">
                              <div
                                v-for="item in group.items"
                                :key="item.name"
                                class="script-api-item"
                              >
                                <div class="script-api-head">
                                  <div class="script-api-name">{{ item.name }}</div>
                                  <button
                                    type="button"
                                    class="script-api-action"
                                    @click="applyScriptSnippet(op, getScriptApiExample(op.config.language, item.key))"
                                  >
                                    插入示例
                                  </button>
                                </div>
                                <div class="script-api-desc">{{ item.description }}</div>
                              </div>
                            </div>
                          </div>
                          <div v-if="getFilteredScriptApiGroups(op.id).length === 0" class="script-api-empty">
                            未找到匹配的 API
                          </div>
                        </div>
                      </div>
                    </template>

                    <template v-else-if="op.type === 'public_script'">
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">公共脚本模板</div>
                          <n-select v-model:value="op.config.script_key" size="small" :options="publicScriptOptions" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">模板说明</div>
                          <div class="pre-op-hint">{{ currentPublicScriptDescription(op.config.script_key) }}</div>
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">模板参数（JSON）</div>
                        <n-input
                          v-model:value="op.config.params"
                          type="textarea"
                          size="small"
                          :autosize="{ minRows: 5, maxRows: 10 }"
                          placeholder='{"headerName":"Authorization"}'
                        />
                      </div>
                    </template>

                    <template v-else-if="op.type === 'wait'">
                      <div class="pre-op-editor-grid two-cols">
                        <div class="pre-op-field">
                          <div class="pre-op-label">等待时长</div>
                          <n-input v-model:value="op.config.duration" size="small" placeholder="500" />
                        </div>
                        <div class="pre-op-field">
                          <div class="pre-op-label">鏃堕棿鍗曚綅</div>
                          <n-select v-model:value="op.config.unit" size="small" :options="waitUnitOptions" />
                        </div>
                      </div>
                      <div class="pre-op-field">
                        <div class="pre-op-label">备注</div>
                        <n-input v-model:value="op.config.note" size="small" placeholder="例如：等待异步任务最终入库" />
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="pre-op-empty-state">
              <div class="pre-op-empty-card">
                <div class="pre-op-empty-title">还没有后置操作</div>
                <div class="pre-op-empty-desc">从上方卡片添加断言、提取变量、数据库操作、脚本或等待时间，构建完整的响应后处理链路。</div>
              </div>
            </div>
          </div>
        </n-tab-pane>
        <!-- Settings Tab -->
        <n-tab-pane name="settings" tab="设置">
          <div class="pane-content settings-pane">

            <!-- 基本请求设置 -->
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
                    v-model:value="reqSettings.timeout"
                    :min="0"
                    :max="300000"
                    :step="1000"
                    placeholder="30000"
                    style="width: 160px;"
                  />
                </div>
                <div class="settings-item">
                  <div class="settings-label">
                    最大重定向次数
                    <span class="settings-hint">0 表示不跟随</span>
                  </div>
                  <n-input-number
                    v-model:value="reqSettings.maxRedirects"
                    :min="0"
                    :max="20"
                    placeholder="5"
                    style="width: 120px;"
                  />
                </div>
              </div>

              <div class="settings-row">
                <div class="settings-item settings-item--switch">
                  <div class="settings-switch-info">
                    <div class="settings-label">自动跟随重定向</div>
                    <div class="settings-desc">接收到 3xx 响应时自动跟随 Location 跳转</div>
                  </div>
                  <n-switch v-model:value="reqSettings.followRedirects" size="medium" />
                </div>
                <div class="settings-item settings-item--switch">
                  <div class="settings-switch-info">
                    <div class="settings-label">验证 SSL 证书</div>
                    <div class="settings-desc">关闭后忽略自签名或过期证书错误</div>
                  </div>
                  <n-switch v-model:value="reqSettings.sslVerify" size="medium" />
                </div>
              </div>

              <div class="settings-row">
                <div class="settings-item settings-item--switch">
                  <div class="settings-switch-info">
                    <div class="settings-label">保持 Cookie</div>
                    <div class="settings-desc">自动存储并携带响应中的 Set-Cookie</div>
                  </div>
                  <n-switch v-model:value="reqSettings.keepCookies" size="medium" />
                </div>
                <div class="settings-item settings-item--switch">
                  <div class="settings-switch-info">
                    <div class="settings-label">自动设置 Content-Type</div>
                    <div class="settings-desc">根据 Body 类型自动设置 Content-Type Header</div>
                  </div>
                  <n-switch v-model:value="reqSettings.autoContentType" size="medium" />
                </div>
              </div>
            </div>

            <!-- 代理设置 -->
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
                  <n-switch v-model:value="reqSettings.useProxy" size="medium" />
                </div>
              </div>
              <div v-if="reqSettings.useProxy" class="settings-row settings-proxy-fields">
                <div class="settings-item settings-item--wide">
                  <div class="settings-label">代理地址</div>
                  <n-input v-model:value="reqSettings.proxyUrl" placeholder="http://proxy.example.com:8080" />
                </div>
                <div class="settings-item">
                  <div class="settings-label">代理用户名（可选）</div>
                  <n-input v-model:value="reqSettings.proxyUser" placeholder="用户名" />
                </div>
                <div class="settings-item">
                  <div class="settings-label">代理密码（可选）</div>
                  <n-input v-model:value="reqSettings.proxyPass" type="password" placeholder="密码" show-password-on="click" />
                </div>
              </div>
            </div>

            <!-- 响应处理 -->
            <div class="settings-section">
              <div class="settings-section-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7d33ff" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                响应处理
              </div>
              <div class="settings-row">
                <div class="settings-item">
                  <div class="settings-label">
                    响应体编码
                  </div>
                  <n-select
                    v-model:value="reqSettings.responseEncoding"
                    :options="encodingOptions"
                    style="width: 180px;"
                  />
                </div>
                <div class="settings-item">
                  <div class="settings-label">
                    最大响应体大小（KB）
                    <span class="settings-hint">0 不限制</span>
                  </div>
                  <n-input-number
                    v-model:value="reqSettings.maxResponseSize"
                    :min="0"
                    :max="102400"
                    :step="512"
                    placeholder="10240"
                    style="width: 160px;"
                  />
                </div>
              </div>
              <div class="settings-row">
                <div class="settings-item settings-item--switch">
                  <div class="settings-switch-info">
                    <div class="settings-label">自动解析 JSON 响应</div>
                    <div class="settings-desc">响应体为 JSON 时自动格式化显示</div>
                  </div>
                  <n-switch v-model:value="reqSettings.autoParseJson" size="medium" />
                </div>
                <div class="settings-item settings-item--switch">
                  <div class="settings-switch-info">
                    <div class="settings-label">显示响应耗时</div>
                    <div class="settings-desc">在响应头部显示请求耗时和响应大小</div>
                  </div>
                  <n-switch v-model:value="reqSettings.showTiming" size="medium" />
                </div>
              </div>
            </div>

            <!-- 重置按钮 -->
            <div class="settings-footer">
              <n-button size="small" @click="resetSettings">
                <template #icon>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.1"/></svg>
                </template>
                恢复默认设置
              </n-button>
            </div>

          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- 上下拖拽手柄 -->
    <div class="panel-resizer-v" @mousedown="startResizeV"></div>

    <!-- 返回响应区域 -->
    <div class="debug-footer">
      <div class="footer-header">
        <div class="footer-tabs">
          <n-tabs type="line" size="small" v-model:value="responseActiveTab">
            <n-tab-pane name="body" tab="Body" />
            <n-tab-pane name="cookie" tab="Cookie" />
            <n-tab-pane name="header" :tab="`Header ${responseResult?.headers ? Object.keys(responseResult.headers).length : 0}`" />
            <n-tab-pane name="console" tab="控制台" />
            <n-tab-pane name="request" tab="实际请求" />
          </n-tabs>
        </div>
        <div class="footer-actions">
          <n-space align="center" :size="16">
            <div v-if="responseTime" class="status-info-group">
              <!-- 状态码提示 -->
              <n-tooltip trigger="hover" placement="bottom" :style="{ padding: '12px' }">
                <template #trigger>
                  <span class="status-code-tag" :class="{ 'success': String(responseStatus).startsWith('2') }">{{ responseStatus }}</span>
                </template>
                <div class="status-tooltip-content">
                  <div class="status-tooltip-title">
                    <span class="status-dot" :class="{ 'success': String(responseStatus).startsWith('2') }"></span>
                    {{ responseStatus }} {{ responseStatus === '200' ? 'OK 成功' : 'Error' }}
                  </div>
                  <div class="status-tooltip-desc">
                    {{ responseStatus === '200' ? '请求成功，服务器已按要求响应' : '请求处理过程中出现错误' }}
                  </div>
                </div>
              </n-tooltip>
              <span class="res-meta-item">{{ Math.round(responseTime) }} ms</span>
              <span class="res-meta-item">{{ responseSize || '2.78K' }}</span>
            </div>
            <n-icon :component="ShareAltOutlined" class="share-icon" />
            <div class="validation-control-group">
              <span class="v-label">校验响应</span>
              <n-switch size="small" v-model:value="validateResponse" />
            </div>
            <div v-if="responseResult && validateResponse" class="pass-badge">
              <n-icon :component="CheckCircleFilled" />
              通过
            </div>
          </n-space>
        </div>
      </div>
      <div class="response-content-wrapper">
        <div class="response-main-area">
          <div class="response-toolbar" v-if="['body', 'cookie', 'header'].includes(responseActiveTab)">
            <div class="toolbar-left">
              <span class="tool-item active">Pretty</span>
              <span class="tool-item">Raw</span>
              <span class="tool-item">Preview</span>
              <span class="tool-item">Visualize</span>
              <n-divider vertical />
              <span class="tool-item">JSON <n-icon :component="DownOutlined" size="10" /></span>
              <span class="tool-item">utf8 <n-icon :component="DownOutlined" size="10" /></span>
            </div>
            <div class="toolbar-right">
              <n-icon :component="DownloadOutlined" class="tool-icon" />
              <n-icon :component="CopyOutlined" class="tool-icon" />
              <n-icon :component="SearchOutlined" class="tool-icon" />
            </div>
          </div>
          <div class="response-body-area">
            <div v-if="responseResult" class="response-result">
              <!-- Body Tab -->
              <template v-if="responseActiveTab === 'body'">
                <div class="line-numbers-col">
                  <div v-for="n in responseLineCount" :key="n" class="ln">{{ n }}</div>
                </div>
                <pre class="json-display">{{ formatResponse(responseResult) }}</pre>
              </template>
              <!-- Header Tab -->
              <template v-else-if="responseActiveTab === 'header'">
                <div class="header-table-wrapper">
                  <table class="header-simple-table">
                    <thead>
                      <tr><th>名称</th><th>值</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="(val, key) in (responseResult?.headers || {})" :key="key">
                        <td class="h-key">{{ key }}</td>
                        <td class="h-val">{{ val }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <!-- Assertion Result Tab -->
              <template v-else-if="responseActiveTab === 'assert'">
                <div class="assertion-results-wrapper">
                  <div v-if="assertionResults.length === 0" class="no-assertion">
                     <n-empty description="本次运行未执行断言" />
                  </div>
                  <div v-else class="assertion-list">
                    <div v-for="(res, idx) in assertionResults" :key="idx" class="assertion-result-item">
                      <n-icon :component="res.status === 'pass' ? CheckCircleFilled : CloseCircleFilled" :class="['res-icon', res.status]" />
                      <div class="res-info">
                        <div class="res-name">{{ res.name }}</div>
                        <div class="res-msg">{{ res.message }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <!-- Console Tab -->
              <template v-else-if="responseActiveTab === 'console'">
                <div class="console-pane">
                  <div v-if="consoleLogs.length === 0" class="no-console">
                     <n-empty description="暂无日志信息" />
                  </div>
                  <div v-else class="console-log-list">
                    <div v-for="(log, idx) in consoleLogs" :key="idx" :class="['console-log-line', log.type]">
                      <span class="log-time">{{ log.time }}</span>
                      <span class="log-msg">{{ log.message }}</span>
                    </div>
                  </div>
                </div>
              </template>
              <!-- Actual Request Tab -->
              <template v-else-if="responseActiveTab === 'request'">
                <div class="actual-request-wrapper">
                  <div class="request-section">
                    <div class="section-label">请求 URL</div>
                    <div class="url-line">
                      <span class="method-text" :class="actualRequest?.method?.toLowerCase()">{{ actualRequest?.method }}</span>
                      <span class="url-text">{{ actualRequest?.url }}</span>
                    </div>
                  </div>
                  
                  <div class="request-section">
                    <div class="section-label">Header</div>
                    <table class="header-simple-table">
                      <thead>
                        <tr><th>名称</th><th>值</th></tr>
                      </thead>
                      <tbody>
                        <tr v-for="(val, key) in (actualRequest?.headers || {})" :key="key">
                          <td class="h-key">{{ key }}</td>
                          <td class="h-val">{{ val }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div v-if="actualRequest?.body" class="request-section">
                    <div class="section-label">Body <span class="body-type-small">{{ actualRequest.bodyType }}</span></div>
                    <pre class="json-display request-body-pre">{{ actualRequest.body || '(空)' }}</pre>
                  </div>

                  <!-- 请求代码生成区域 -->
                  <div class="code-generation-section">
                    <div class="section-label">请求代码</div>
                    <div class="code-tabs-wrapper">
                      <!-- 语言切换 -->
                      <div class="lang-tabs">
                        <div 
                          v-for="lang in codeLangs" 
                          :key="lang"
                          :class="['lang-item', { active: selectedCodeLang === lang }]"
                          @click="selectedCodeLang = lang"
                        >
                          {{ lang }}
                        </div>
                      </div>
                      
                      <!-- 库切换 -->
                      <div v-if="codeLibs[selectedCodeLang]" class="lib-tabs">
                        <div 
                          v-for="lib in codeLibs[selectedCodeLang]" 
                          :key="lib"
                          :class="['lib-item', { active: selectedCodeLib === lib }]"
                          @click="selectedCodeLib = lib"
                        >
                          {{ lib }}
                        </div>
                      </div>

                      <!-- 代码展示区域 -->
                      <div class="generated-code-container">
                        <div class="code-line-numbers">
                          <div v-for="n in codeLineCount" :key="n" class="ln">{{ n }}</div>
                        </div>
                        <pre class="code-display">{{ generatedCode }}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else class="response-body-placeholder">
                <n-empty :description="`尚未实现 ${responseActiveTab} 预览`" />
              </div>
            </div>
            <div v-else class="response-body-placeholder">
              <div class="res-dots">...</div>
            </div>
          </div>
        </div>

        <!-- 拖拽手柄 -->
        <div class="panel-resizer" @mousedown="startResize"></div>

        <!-- 右侧校验面板 -->
        <div class="validation-side-panel" v-if="responseResult && validateResponse" :style="{ width: validationPanelWidth + 'px' }">
          <div class="validation-body-new">
            <div class="v-section-item">
              <div class="v-section-label">校验响应结果</div>
              <div class="v-result-line success">
                <n-icon :component="CheckCircleFilled" class="v-icon-new pass" />
                <span class="v-text">响应的数据结构与接口定义一致</span>
              </div>
            </div>
            
            <div class="v-section-item mt-20">
              <div class="v-section-label">断言结果</div>
              <div class="v-assertion-list">
                <div v-for="(res, idx) in assertionResults" :key="idx" class="v-result-line" :class="res.status">
                  <span class="v-index">{{ idx + 1 }}.</span>
                  <n-icon :component="res.status === 'pass' ? CheckCircleFilled : CloseCircleFilled" :class="['v-icon-new', res.status]" />
                  <span class="v-text">{{ res.name }}</span>
                  <template v-if="res.status === 'fail'">
                    <div class="v-error-detail">
                      AssertionError: expected '{{ res.actual }}' to deeply equal '{{ res.expected }}'
                    </div>
                  </template>
                </div>
                <div v-if="assertionResults.length === 0" class="v-empty-text">
                  暂无断言结果
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, h, nextTick, toRaw } from 'vue'
import { 
  NInput, NButton, NButtonGroup, NInputGroup, NIcon, NSpace, NTabs, NTabPane, 
  NDataTable, NEmpty, NSwitch, NSelect, NInputNumber, NModal, NRadioGroup, NRadio, NCheckbox,
  NTooltip, useMessage,
} from 'naive-ui'
import { 
  DownOutlined, ThunderboltOutlined, InfoCircleOutlined, 
  CodeOutlined, FormatPainterOutlined, MenuOutlined,
  BugOutlined, ReloadOutlined, LinkOutlined, ShareAltOutlined,
  CheckCircleFilled, CloseCircleFilled, DownloadOutlined, CopyOutlined, SearchOutlined,
  DatabaseOutlined, RightOutlined, EllipsisOutlined, DeleteOutlined, UpOutlined,
  QuestionCircleOutlined,
} from '@vicons/antd'
import execRequest from '../api/exec-request'

const props = defineProps<{
  data: any
  envBaseUrl?: string
  envId?: number | string | null
}>()

const emit = defineEmits<{
  'save-success': [payload?: Record<string, any>]
  'delete-success': []
}>()

const message = useMessage()
const interfaceSaving = ref(false)
const editableName = ref('')
const method = ref(props.data?.method || 'GET')
const path = ref(props.data?.path || '')
const queryParams = ref<any[]>([])
const headerParams = ref<any[]>([])

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'HEAD', value: 'HEAD' },
  { label: 'OPTIONS', value: 'OPTIONS' },
]

const paramTypeOptions = [
  { label: 'string', value: 'string' },
  { label: 'number', value: 'number' },
  { label: 'boolean', value: 'boolean' },
  { label: 'array', value: 'array' },
  { label: 'object', value: 'object' },
]

function ensureParamRow(p: Record<string, any> | undefined, index: number) {
  const row = p ?? {}
  return {
    enabled: row.enabled ?? true,
    name: row.name ?? '',
    type: row.type ?? 'string',
    example: row.example ?? '',
    desc: row.desc ?? '',
    key: row.key ?? `p-${Date.now()}-${index}-${Math.random()}`,
  }
}

function addQueryParam() {
  queryParams.value.push(ensureParamRow({}, queryParams.value.length))
}

function removeQueryParam(key: string) {
  queryParams.value = queryParams.value.filter((r: any) => r.key !== key)
}

function addHeaderParam() {
  const row = ensureParamRow({}, headerParams.value.length)
  headerParams.value.push(row)
  activeHeaderKey.value = row.key
}

function removeHeaderParam(key: string) {
  headerParams.value = headerParams.value.filter((r: any) => r.key !== key)
  if (activeHeaderKey.value === key) {
    activeHeaderKey.value = headerParams.value[0]?.key || ''
  }
}

const headerVariableNames = ref<string[]>([])
const activeHeaderKey = ref('')
const headerKeyword = ref('')
const showDisabledHeaders = ref(true)

const headerVariableSuggestions = computed(() => {
  const names = [...headerVariableNames.value, 'token', 'accessToken', 'tenantId', 'traceId']
  return Array.from(new Set(names.filter(Boolean)))
})

const headerPreviewToken = computed(() => `{{${headerVariableSuggestions.value[0] || 'token'}}}`)

const enabledHeaderPreview = computed(() => {
  return headerParams.value.filter((item: any) => item.enabled !== false && item.name && item.example)
})

const activeHeaderRow = computed(() => {
  return headerParams.value.find((item: any) => item.key === activeHeaderKey.value) || null
})

const filteredHeaderParams = computed(() => {
  const keyword = String(headerKeyword.value || '').trim().toLowerCase()
  return headerParams.value.filter((item: any) => {
    if (!showDisabledHeaders.value && item.enabled === false) return false
    if (!keyword) return true
    const haystack = [item.name, item.example, item.desc, item.type].join(' ').toLowerCase()
    return haystack.includes(keyword)
  })
})

const fetchHeaderVariableNames = async () => {
  if (!props.envId) {
    headerVariableNames.value = ['token']
    return
  }
  try {
    const envRes: any = await execRequest.get('/environments/' + props.envId)
    headerVariableNames.value = Array.isArray(envRes?.variables)
      ? envRes.variables.map((item: any) => item.name).filter(Boolean)
      : ['token']
  } catch (error) {
    headerVariableNames.value = ['token']
  }
}

const appendHeaderVariable = (row: any, variableName: string) => {
  const token = `{{${variableName}}}`
  row.example = `${row.example || ''}${token}`
  activeHeaderKey.value = row.key
}

const formatVariableReference = (variableName: string) => `{{${variableName}}}`

const setActiveHeader = (key: string) => {
  activeHeaderKey.value = key
}

const insertHeaderVariable = (variableName: string) => {
  if (headerParams.value.length === 0) {
    addHeaderParam()
  }
  const row = activeHeaderRow.value || headerParams.value[headerParams.value.length - 1]
  appendHeaderVariable(row, variableName)
}

const enableAllHeaders = () => {
  headerParams.value.forEach((item: any) => {
    item.enabled = true
  })
}

const removeDisabledHeaders = () => {
  headerParams.value = headerParams.value.filter((item: any) => item.enabled !== false)
  if (!headerParams.value.some((item: any) => item.key === activeHeaderKey.value)) {
    activeHeaderKey.value = headerParams.value[0]?.key || ''
  }
}

const resetHeaderFilters = () => {
  headerKeyword.value = ''
  showDisabledHeaders.value = true
}

const applyBearerTokenToHeader = (row: any) => {
  row.enabled = true
  row.name = 'Authorization'
  row.type = row.type || 'string'
  row.desc = row.desc || 'Bearer Token 认证'
  row.example = `Bearer {{${headerVariableSuggestions.value[0] || 'token'}}}`
}

const addHeaderPreset = (preset: 'auth' | 'json' | 'trace') => {
  if (preset === 'auth') {
    const existing = headerParams.value.find((item: any) => item.name === 'Authorization')
    if (existing) {
      applyBearerTokenToHeader(existing)
      return
    }
    const row = ensureParamRow({
      name: 'Authorization',
      type: 'string',
      example: `Bearer {{${headerVariableSuggestions.value[0] || 'token'}}}`,
      desc: 'Bearer Token 认证',
      enabled: true,
    }, headerParams.value.length)
    headerParams.value.push(row)
    return
  }
  if (preset === 'json') {
    const existing = headerParams.value.find((item: any) => item.name === 'Content-Type')
    if (existing) {
      existing.enabled = true
      existing.example = 'application/json'
      existing.type = 'string'
      existing.desc = existing.desc || '请求体类型'
      return
    }
    headerParams.value.push(ensureParamRow({
      name: 'Content-Type',
      type: 'string',
      example: 'application/json',
      desc: '请求体类型',
      enabled: true,
    }, headerParams.value.length))
    return
  }
  const existing = headerParams.value.find((item: any) => item.name === 'X-Trace-Id')
  if (existing) {
    existing.enabled = true
    existing.example = `{{${headerVariableSuggestions.value.includes('traceId') ? 'traceId' : (headerVariableSuggestions.value[0] || 'token')}}}`
    existing.type = 'string'
    existing.desc = existing.desc || '链路追踪标识'
    return
  }
  headerParams.value.push(ensureParamRow({
    name: 'X-Trace-Id',
    type: 'string',
    example: `{{${headerVariableSuggestions.value.includes('traceId') ? 'traceId' : (headerVariableSuggestions.value[0] || 'token')}}}`,
    desc: '链路追踪标识',
    enabled: true,
  }, headerParams.value.length))
}

function buildDebugParamColumns(onRemove: (key: string) => void): DataTableColumns<any> {
  return [
    {
      title: '参数名',
      key: 'name',
      render(row) {
        return h(NInput, {
          value: row.name,
          size: 'small',
          placeholder: '参数名',
          onUpdateValue: (v: string) => { row.name = v },
        })
      },
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
          onUpdateValue: (v: string) => { row.type = v },
        })
      },
    },
    {
      title: '示例值',
      key: 'example',
      render(row) {
        return h(NInput, {
          value: row.example,
          size: 'small',
          placeholder: '示例值',
          onUpdateValue: (v: string) => { row.example = v },
        })
      },
    },
    {
      title: '说明',
      key: 'desc',
      render(row) {
        return h(NInput, {
          value: row.desc,
          size: 'small',
          placeholder: '说明',
          onUpdateValue: (v: string) => { row.desc = v },
        })
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 88,
      align: 'center',
      render(row) {
        return h(
          NButton,
          { text: true, size: 'small', onClick: () => onRemove(row.key) },
          { default: () => '删除' },
        )
      },
    },
  ]
}

const debugQueryColumns = buildDebugParamColumns(removeQueryParam)
const debugHeaderColumns = buildDebugParamColumns(removeHeaderParam)

const createUid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const dbActionOptions = [
  { label: '查询', value: 'query' },
  { label: '执行', value: 'execute' },
]

const scriptLanguageOptions = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Java', value: 'java' },
  { label: 'Python', value: 'python' },
  { label: 'Groovy', value: 'groovy' },
  { label: 'Shell', value: 'shell' },
  { label: 'Lua', value: 'lua' },
]

const waitUnitOptions = [
  { label: '毫秒', value: 'ms' },
  { label: '秒', value: 's' },
  { label: '分钟', value: 'm' },
]

const defaultScriptSnippetKeys = [
  'get_env_var',
  'set_env_var',
  'get_temp_var',
  'set_temp_var',
  'request_api',
]

const scriptSnippetRegistry: Record<string, Record<string, string>> = {
  javascript: {
    get_env_var: `const token = context.getVar('token')\nconsole.log('token:', token)`,
    set_env_var: `context.setVar('token', 'your-token-value')`,
    get_temp_var: `const traceId = context.getTempVar('traceId')\nconsole.log('traceId:', traceId)`,
    set_temp_var: `context.setTempVar('traceId', Date.now())`,
    request_api: `const result = await context.request({\n  url: '/auth/token',\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json'\n  },\n  body: {\n    username: 'admin',\n    password: '123456'\n  }\n})\n\ncontext.setTempVar('loginResult', result.data)`,
  },
  java: {
    get_env_var: `String token = context.getVar("token");\nSystem.out.println("token: " + token);`,
    set_env_var: `context.setVar("token", "your-token-value");`,
    get_temp_var: `Object traceId = context.getTempVar("traceId");\nSystem.out.println("traceId: " + traceId);`,
    set_temp_var: `context.setTempVar("traceId", System.currentTimeMillis());`,
    request_api: `Map<String, Object> result = await context.request(Map.of(\n  "url", "/auth/token",\n  "method", "POST",\n  "headers", Map.of("Content-Type", "application/json"),\n  "body", Map.of("username", "admin", "password", "123456")\n));\ncontext.setTempVar("loginResult", result.get("data"));`,
  },
  python: {
    get_env_var: `token = context.getVar("token")\nprint("token:", token)`,
    set_env_var: `context.setVar("token", "your-token-value")`,
    get_temp_var: `trace_id = context.getTempVar("traceId")\nprint("traceId:", trace_id)`,
    set_temp_var: `import time\ncontext.setTempVar("traceId", int(time.time() * 1000))`,
    request_api: `result = await context.request({\n    "url": "/auth/token",\n    "method": "POST",\n    "headers": {\n        "Content-Type": "application/json"\n    },\n    "body": {\n        "username": "admin",\n        "password": "123456"\n    }\n})\ncontext.setTempVar("loginResult", result["data"])`,
  },
  groovy: {
    get_env_var: `def token = context.getVar('token')\nprintln "token: \${token}"`,
    set_env_var: `context.setVar('token', 'your-token-value')`,
    get_temp_var: `def traceId = context.getTempVar('traceId')\nprintln "traceId: \${traceId}"`,
    set_temp_var: `context.setTempVar('traceId', System.currentTimeMillis())`,
    request_api: `def result = await context.request([\n  url: '/auth/token',\n  method: 'POST',\n  headers: ['Content-Type': 'application/json'],\n  body: [username: 'admin', password: '123456']\n])\ncontext.setTempVar('loginResult', result.data)`,
  },
  shell: {
    get_env_var: `# 当前执行引擎未接入 Shell，这里是示例模板\nTOKEN=$(context.getVar "token")\necho "token: $TOKEN"`,
    set_env_var: `context.setVar "token" "your-token-value"`,
    get_temp_var: `TRACE_ID=$(context.getTempVar "traceId")\necho "traceId: $TRACE_ID"`,
    set_temp_var: `context.setTempVar "traceId" "$(date +%s)"`,
    request_api: `RESULT=$(context.request '{\n  "url": "/auth/token",\n  "method": "POST"\n}')\ncontext.setTempVar "loginResult" "$RESULT"`,
  },
  lua: {
    get_env_var: `local token = context.getVar("token")\nprint("token:", token)`,
    set_env_var: `context.setVar("token", "your-token-value")`,
    get_temp_var: `local traceId = context.getTempVar("traceId")\nprint("traceId:", traceId)`,
    set_temp_var: `context.setTempVar("traceId", os.time())`,
    request_api: `local result = await context.request({\n  url = "/auth/token",\n  method = "POST",\n  headers = {\n    ["Content-Type"] = "application/json"\n  },\n  body = {\n    username = "admin",\n    password = "123456"\n  }\n})\ncontext.setTempVar("loginResult", result.data)`,
  },
}

const scriptSnippetLabels: Record<string, string> = {
  get_env_var: '获取环境变量',
  set_env_var: '设置环境变量',
  get_temp_var: '获取临时变量',
  set_temp_var: '设置临时变量',
  request_api: '请求接口',
}

const languageScriptSnippetLabels: Record<string, string> = {
  define_function: '瀹氫箟鍑芥暟',
  print_log: '打印日志',
  condition_guard: '条件判断',
}

const languageScriptSnippetRegistry: Record<string, Record<string, string>> = {
  javascript: {
    define_function: `function buildSign(raw) {\n  return btoa(unescape(encodeURIComponent(raw)))\n}`,
    print_log: `console.log('current path:', context.path)\nconsole.log('variables:', context.variables)`,
    condition_guard: `if (!context.getVar('token')) {\n  throw new Error('token 不存在，请先登录')\n}`,
  },
  java: {
    define_function: `String buildSign(String raw) {\n  return java.util.Base64.getEncoder().encodeToString(raw.getBytes());\n}`,
    print_log: `System.out.println("current path: " + context.path);\nSystem.out.println("variables: " + context.variables);`,
    condition_guard: `if (context.getVar("token") == null) {\n  throw new RuntimeException("token 不存在，请先登录");\n}`,
  },
  python: {
    define_function: `def build_sign(raw):\n    import base64\n    return base64.b64encode(raw.encode()).decode()`,
    print_log: `print("current path:", context.path)\nprint("variables:", context.variables)`,
    condition_guard: `if not context.getVar("token"):\n    raise Exception("token 不存在，请先登录")`,
  },
  groovy: {
    define_function: `def buildSign(raw) {\n  raw.bytes.encodeBase64().toString()\n}`,
    print_log: `println "current path: \${context.path}"\nprintln "variables: \${context.variables}"`,
    condition_guard: `if (!context.getVar('token')) {\n  throw new RuntimeException('token 不存在，请先登录')\n}`,
  },
  shell: {
    define_function: `build_sign() {\n  echo -n "$1" | base64\n}`,
    print_log: `echo "current path: \${context.path}"\necho "variables: \${context.variables}"`,
    condition_guard: `if [ -z "$(context.getVar "token")" ]; then\n  echo "token 不存在，请先登录"\n  exit 1\nfi`,
  },
  lua: {
    define_function: `local function buildSign(raw)\n  return raw\nend`,
    print_log: `print("current path:", context.path)\nprint("variables:", context.variables)`,
    condition_guard: `if not context.getVar("token") then\n  error("token 不存在，请先登录")\nend`,
  },
}

const scriptDefaultTemplates: Record<string, string> = {
  javascript: `context.setVar('requestId', Date.now())\ncontext.setHeader('X-Request-Id', String(context.getVar('requestId')))`,
  java: `String requestId = String.valueOf(System.currentTimeMillis());\ncontext.setVar("requestId", requestId);\ncontext.setHeader("X-Request-Id", requestId);`,
  python: `import time\nrequest_id = str(int(time.time() * 1000))\ncontext.setVar("requestId", request_id)\ncontext.setHeader("X-Request-Id", request_id)`,
  groovy: `def requestId = String.valueOf(System.currentTimeMillis())\ncontext.setVar('requestId', requestId)\ncontext.setHeader('X-Request-Id', requestId)`,
  shell: `REQUEST_ID=$(date +%s)\ncontext.setVar "requestId" "$REQUEST_ID"\ncontext.setHeader "X-Request-Id" "$REQUEST_ID"`,
  lua: `local requestId = tostring(os.time())\ncontext.setVar("requestId", requestId)\ncontext.setHeader("X-Request-Id", requestId)`,
}

const scriptApiDocs = [
  { key: 'get_var', category: 'vars', name: 'context.getVar(name)', description: '读取环境变量。' },
  { key: 'set_var', category: 'vars', name: 'context.setVar(name, value)', description: '写入环境变量。' },
  { key: 'get_temp_var', category: 'temp', name: 'context.getTempVar(name)', description: '读取当前调试链路中的临时变量。' },
  { key: 'set_temp_var', category: 'temp', name: 'context.setTempVar(name, value)', description: '写入临时变量，仅在当前调试流程内生效。' },
  { key: 'set_header', category: 'request', name: 'context.setHeader(name, value)', description: '动态设置请求头。' },
  { key: 'set_query', category: 'request', name: 'context.setQuery(name, value)', description: '动态设置 Query 参数。' },
  { key: 'set_body', category: 'request', name: 'context.setBody(value)', description: '直接覆盖请求体。' },
  { key: 'request', category: 'network', name: 'context.request(config)', description: '在脚本中再次发起一次接口请求。' },
]

const scriptApiCategoryLabels: Record<string, string> = {
  vars: '环境变量',
  temp: '临时变量',
  request: '请求改写',
  network: '二次请求',
}

const scriptApiExampleRegistry: Record<string, Record<string, string>> = {
  javascript: {
    get_var: `const token = context.getVar('token')\nconsole.log(token)`,
    set_var: `context.setVar('token', 'your-token-value')`,
    get_temp_var: `const requestId = context.getTempVar('requestId')\nconsole.log(requestId)`,
    set_temp_var: `context.setTempVar('requestId', Date.now())`,
    set_header: `context.setHeader('Authorization', 'Bearer demo-token')`,
    set_query: `context.setQuery('page', 1)`,
    set_body: `context.setBody({\n  username: 'admin',\n  password: '123456'\n})`,
    request: `const result = await context.request({\n  url: '/auth/token',\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json'\n  },\n  body: {\n    username: 'admin',\n    password: '123456'\n  }\n})\nconsole.log(result.data)`,
  },
  java: {
    get_var: `String token = context.getVar("token");\nSystem.out.println(token);`,
    set_var: `context.setVar("token", "your-token-value");`,
    get_temp_var: `Object requestId = context.getTempVar("requestId");\nSystem.out.println(requestId);`,
    set_temp_var: `context.setTempVar("requestId", System.currentTimeMillis());`,
    set_header: `context.setHeader("Authorization", "Bearer demo-token");`,
    set_query: `context.setQuery("page", 1);`,
    set_body: `context.setBody(Map.of(\n  "username", "admin",\n  "password", "123456"\n));`,
    request: `Map<String, Object> result = await context.request(Map.of(\n  "url", "/auth/token",\n  "method", "POST"\n));\nSystem.out.println(result.get("data"));`,
  },
  python: {
    get_var: `token = context.getVar("token")\nprint(token)`,
    set_var: `context.setVar("token", "your-token-value")`,
    get_temp_var: `request_id = context.getTempVar("requestId")\nprint(request_id)`,
    set_temp_var: `import time\ncontext.setTempVar("requestId", int(time.time() * 1000))`,
    set_header: `context.setHeader("Authorization", "Bearer demo-token")`,
    set_query: `context.setQuery("page", 1)`,
    set_body: `context.setBody({\n    "username": "admin",\n    "password": "123456"\n})`,
    request: `result = await context.request({\n    "url": "/auth/token",\n    "method": "POST"\n})\nprint(result["data"])`,
  },
  groovy: {
    get_var: `def token = context.getVar('token')\nprintln token`,
    set_var: `context.setVar('token', 'your-token-value')`,
    get_temp_var: `def requestId = context.getTempVar('requestId')\nprintln requestId`,
    set_temp_var: `context.setTempVar('requestId', System.currentTimeMillis())`,
    set_header: `context.setHeader('Authorization', 'Bearer demo-token')`,
    set_query: `context.setQuery('page', 1)`,
    set_body: `context.setBody([\n  username: 'admin',\n  password: '123456'\n])`,
    request: `def result = await context.request([\n  url: '/auth/token',\n  method: 'POST'\n])\nprintln result.data`,
  },
  shell: {
    get_var: `TOKEN=$(context.getVar "token")\necho "$TOKEN"`,
    set_var: `context.setVar "token" "your-token-value"`,
    get_temp_var: `REQUEST_ID=$(context.getTempVar "requestId")\necho "$REQUEST_ID"`,
    set_temp_var: `context.setTempVar "requestId" "$(date +%s)"`,
    set_header: `context.setHeader "Authorization" "Bearer demo-token"`,
    set_query: `context.setQuery "page" "1"`,
    set_body: `context.setBody '{"username":"admin","password":"123456"}'`,
    request: `RESULT=$(context.request '{"url":"/auth/token","method":"POST"}')\necho "$RESULT"`,
  },
  lua: {
    get_var: `local token = context.getVar("token")\nprint(token)`,
    set_var: `context.setVar("token", "your-token-value")`,
    get_temp_var: `local requestId = context.getTempVar("requestId")\nprint(requestId)`,
    set_temp_var: `context.setTempVar("requestId", os.time())`,
    set_header: `context.setHeader("Authorization", "Bearer demo-token")`,
    set_query: `context.setQuery("page", 1)`,
    set_body: `context.setBody({\n  username = "admin",\n  password = "123456"\n})`,
    request: `local result = await context.request({\n  url = "/auth/token",\n  method = "POST"\n})\nprint(result.data)`,
  },
}

const publicScriptRegistry: Record<string, { label: string; description: string; script: string }> = {
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
  throw new Error(\`未找到环境变量: \${tokenVar}\`)
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
  },
}

const publicScriptOptions = Object.entries(publicScriptRegistry).map(([value, item]) => ({
  label: item.label,
  value,
}))

const preOperations = ref<any[]>([])
const editingPreOpIndex = ref<number | null>(null)

const addPreOpOptions = [
  {
    label: '数据库操作',
    key: 'db',
    description: '在请求前预置或校验数据库数据',
    icon: DatabaseOutlined,
  },
  {
    label: '脚本',
    key: 'script',
    description: '用自定义脚本动态加工请求上下文',
    icon: CodeOutlined,
  },
  {
    label: '脚本库',
    key: 'public_script',
    description: '复用内置脚本模板，快速完成签名注入',
    icon: ShareAltOutlined,
  },
  {
    label: '等待时间',
    key: 'wait',
    description: '为异步链路预留等待窗口',
    icon: ReloadOutlined,
  },
]

const preOpTypeLabels: Record<string, string> = {
  db: '数据库操作',
  script: '脚本',
  public_script: '脚本库',
  wait: '等待时间',
}

const preOpIcons: Record<string, any> = {
  db: DatabaseOutlined,
  script: CodeOutlined,
  public_script: ShareAltOutlined,
  wait: ReloadOutlined,
}

const createPreOp = (type: string) => {
  const base = {
    id: createUid('pre'),
    type,
    enabled: true,
    name: preOpTypeLabels[type] || '前置操作',
  }

  if (type === 'db') {
    return {
      ...base,
      config: {
        datasource: '',
        action: 'query',
        sql: '',
        result_var: '',
        timeout_ms: '5000',
      },
    }
  }

  if (type === 'script') {
    return {
      ...base,
      config: {
        language: 'javascript',
        script: scriptDefaultTemplates.javascript,
      },
    }
  }

  if (type === 'public_script') {
    return {
      ...base,
      config: {
        script_key: 'inject_timestamp',
        params: '{\n  "varName": "timestamp",\n  "mode": "ms"\n}',
      },
    }
  }

  return {
    ...base,
    config: {
      duration: '500',
      unit: 'ms',
      note: '',
    },
  }
}

const normalizePreOperation = (op: any) => {
  const defaults = createPreOp(op?.type || 'script')
  return {
    ...defaults,
    ...op,
    id: op?.id || createUid('pre'),
    enabled: op?.enabled ?? true,
    config: {
      ...defaults.config,
      ...(op?.config || {}),
    },
  }
}

const handleAddPreOp = (type: string) => {
  const op = createPreOp(type)
  preOperations.value.push(op)
  editingPreOpIndex.value = preOperations.value.length - 1
  activeTab.value = 'pre'
}

const removePreOp = (index: number) => {
  preOperations.value.splice(index, 1)
  if (editingPreOpIndex.value === index) {
    editingPreOpIndex.value = null
    return
  }
  if (editingPreOpIndex.value !== null && editingPreOpIndex.value > index) {
    editingPreOpIndex.value -= 1
  }
}

const preOpTypeLabel = (type: string) => preOpTypeLabels[type] || '前置操作'
const preOpIcon = (type: string) => preOpIcons[type] || CodeOutlined

const currentPublicScriptDescription = (key: string) => {
  return publicScriptRegistry[key]?.description || '选择脚本库模板后，这里会展示模板说明。'
}

const getScriptLanguageLabel = (language: string) => {
  return scriptLanguageOptions.find(item => item.value === language)?.label || '当前语言'
}

const getCommonScriptSnippetOptions = (language: string) => {
  const lang = language || 'javascript'
  const snippetMap = scriptSnippetRegistry[lang] || scriptSnippetRegistry.javascript
  return defaultScriptSnippetKeys.map(key => ({
    key,
    label: scriptSnippetLabels[key],
    code: snippetMap[key] || scriptSnippetRegistry.javascript[key],
  }))
}

const getLanguageScriptSnippetOptions = (language: string) => {
  const lang = language || 'javascript'
  const snippetMap = languageScriptSnippetRegistry[lang] || languageScriptSnippetRegistry.javascript
  return Object.keys(languageScriptSnippetLabels).map(key => ({
    key,
    label: languageScriptSnippetLabels[key],
    code: snippetMap[key] || languageScriptSnippetRegistry.javascript[key],
  }))
}

const getScriptDefaultTemplate = (language: string) => {
  return scriptDefaultTemplates[language] || scriptDefaultTemplates.javascript
}

const isDefaultScriptTemplate = (script: string) => {
  const normalized = String(script || '').trim()
  return Object.values(scriptDefaultTemplates).some(template => template.trim() === normalized)
}

const handleScriptLanguageChange = (op: any, language: string) => {
  if (!op?.config) return
  const currentScript = String(op.config.script || '')
  const shouldReplace = !currentScript.trim() || isDefaultScriptTemplate(currentScript)

  op.config.language = language

  if (shouldReplace) {
    op.config.script = getScriptDefaultTemplate(language)
  }
}

const scriptEditorRefs = ref<Record<string, HTMLElement | null>>({})
const scriptCursorMap = ref<Record<string, { start: number; end: number }>>({})
const scriptApiSearchMap = ref<Record<string, string>>({})
const scriptHistoryMap = ref<Record<string, string[]>>({})

const setScriptEditorRef = (opId: string, el: any) => {
  if (!opId) return
  scriptEditorRefs.value[opId] = el as HTMLElement | null
}

const getScriptTextarea = (opId: string) => {
  const wrapper = scriptEditorRefs.value[opId]
  return wrapper?.querySelector('textarea') || null
}

const rememberScriptCursor = (opId: string) => {
  const textarea = getScriptTextarea(opId)
  if (!textarea) return
  scriptCursorMap.value[opId] = {
    start: textarea.selectionStart ?? textarea.value.length,
    end: textarea.selectionEnd ?? textarea.value.length,
  }
}

const focusScriptCursor = async (opId: string, position: number) => {
  await nextTick()
  const textarea = getScriptTextarea(opId)
  if (!textarea) return
  textarea.focus()
  textarea.setSelectionRange(position, position)
  scriptCursorMap.value[opId] = { start: position, end: position }
}

const setScriptApiSearch = (opId: string, value: string) => {
  scriptApiSearchMap.value[opId] = value
}

const handleScriptApiSearchInput = (opId: string, event: Event) => {
  const target = event.target as HTMLInputElement | null
  setScriptApiSearch(opId, target?.value || '')
}

const getScriptApiSearch = (opId: string) => {
  return scriptApiSearchMap.value[opId] || ''
}

const getFilteredScriptApiGroups = (opId: string) => {
  const keyword = getScriptApiSearch(opId).trim().toLowerCase()
  const filtered = !keyword
    ? scriptApiDocs
    : scriptApiDocs.filter(item => {
        return item.name.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword)
      })

  return Object.keys(scriptApiCategoryLabels)
    .map(category => ({
      category,
      label: scriptApiCategoryLabels[category],
      items: filtered.filter(item => item.category === category),
    }))
    .filter(group => group.items.length > 0)
}

const pushScriptHistory = (op: any) => {
  if (!op?.id || !op?.config) return
  const current = String(op.config.script || '')
  const history = scriptHistoryMap.value[op.id] || []
  if (history[history.length - 1] === current) return
  scriptHistoryMap.value[op.id] = [...history.slice(-19), current]
}

const canUndoScriptChange = (opId: string) => {
  return (scriptHistoryMap.value[opId] || []).length > 0
}

const undoScriptChange = async (op: any) => {
  if (!op?.id || !op?.config) return
  const history = scriptHistoryMap.value[op.id] || []
  if (history.length === 0) return
  const previous = history[history.length - 1]
  scriptHistoryMap.value[op.id] = history.slice(0, -1)
  op.config.script = previous
  await focusScriptCursor(op.id, String(previous || '').length)
  message.success('已撤销上一步脚本修改')
}

const copyScriptSnippet = async (snippetCode: string) => {
  try {
    await navigator.clipboard.writeText(snippetCode)
    message.success('代码片段已复制')
  } catch (error) {
    message.error('复制失败，请重试')
  }
}

const getScriptApiExample = (language: string, key: string) => {
  const lang = language || 'javascript'
  const registry = scriptApiExampleRegistry[lang] || scriptApiExampleRegistry.javascript
  return registry[key] || scriptApiExampleRegistry.javascript[key] || ''
}

const restoreDefaultScript = async (op: any) => {
  if (!op?.config) return
  pushScriptHistory(op)
  op.config.script = getScriptDefaultTemplate(op.config.language || 'javascript')
  await focusScriptCursor(op.id, op.config.script.length)
}

const formatScriptContent = async (op: any) => {
  if (!op?.config) return
  pushScriptHistory(op)
  op.config.script = String(op.config.script || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  await focusScriptCursor(op.id, op.config.script.length)
  message.success('脚本已整理')
}

const clearScriptContent = async (op: any) => {
  if (!op?.config) return
  pushScriptHistory(op)
  op.config.script = ''
  await focusScriptCursor(op.id, 0)
}

const preOpSummary = (op: any) => {
  if (!op) return '未配置'
  if (op.type === 'db') {
    const action = dbActionOptions.find(item => item.value === op.config?.action)?.label || '查询'
    const datasource = op.config?.datasource || '未设置数据源'
    const sql = (op.config?.sql || '').split('\n')[0] || '未填写 SQL'
    return `${action} ${datasource} | ${sql}`
  }
  if (op.type === 'script') {
    return (op.config?.script || '未填写脚本').split('\n')[0]
  }
  if (op.type === 'public_script') {
    const scriptName = publicScriptRegistry[op.config?.script_key]?.label || '未选择模板'
    return `${scriptName} | ${currentPublicScriptDescription(op.config?.script_key)}`
  }
  const duration = op.config?.duration || 0
  const unit = waitUnitOptions.find(item => item.value === op.config?.unit)?.label || '毫秒'
  return `等待 ${duration} ${unit}${op.config?.note ? ` | ${op.config.note}` : ''}`
}

const addPostOpOptions = [
  {
    label: '断言',
    key: 'assertion',
    description: '校验响应状态、响应体或变量是否符合预期',
    icon: CheckCircleFilled,
  },
  {
    label: '提取变量',
    key: 'extract',
    description: '从响应中提取数据，写入环境变量或临时变量',
    icon: ThunderboltOutlined,
  },
  {
    label: '数据库操作',
    key: 'db',
    description: '执行查询或写入操作，并把结果挂到调试上下文',
    icon: DatabaseOutlined,
  },
  {
    label: '自定义脚本',
    key: 'script',
    description: '通过脚本处理响应、变量和后续链路逻辑',
    icon: CodeOutlined,
  },
  {
    label: '公共脚本',
    key: 'public_script',
    description: '选择内置公共脚本模板，快速复用常见能力',
    icon: ShareAltOutlined,
  },
  {
    label: '等待时间',
    key: 'wait',
    description: '为异步处理或链路稳定性增加等待时间',
    icon: ReloadOutlined,
  },
]
const postOpTypeLabels: Record<string, string> = {
  assertion: '断言',
  extract: '提取变量',
  db: '数据库操作',
  script: '自定义脚本',
  public_script: '公共脚本',
  wait: '等待时间',
}
const postOpIcons: Record<string, any> = {
  assertion: CheckCircleFilled,
  extract: ThunderboltOutlined,
  db: DatabaseOutlined,
  script: CodeOutlined,
  public_script: ShareAltOutlined,
  wait: ReloadOutlined,
}

const createPostOp = (type: string) => {
  const base = {
    id: createUid('post'),
    type,
    enabled: true,
    name: postOpTypeLabels[type] || '后置操作',
  }

  if (type === 'extract') {
    return {
      ...base,
      config: {
        name: 'new_variable',
        source: 'json',
        expression: '$.data.id',
        target: 'environment',
      },
    }
  }

  if (type === 'assertion') {
    return {
      ...base,
      config: {
        name: '',
        target: 'response_json',
        target_label: 'Response JSON',
        expression: '$.data.id',
        operator: 'equals',
        value: '',
      },
    }
  }

  if (type === 'db') {
    return {
      ...base,
      config: {
        datasource: '',
        action: 'query',
        sql: '',
        result_var: '',
        timeout_ms: '5000',
      },
    }
  }

  if (type === 'script') {
    return {
      ...base,
      config: {
        language: 'javascript',
        script: `if (statusCode !== 200) {\n  throw new Error('期望 HTTP 状态码为 200')\n}\n\ncontext.setTempVar('latestResponse', responseData)\ncontext.setTempVar('latestStatusCode', statusCode)`,
      },
    }
  }

  if (type === 'public_script') {
    return {
      ...base,
      config: {
        script_key: 'inject_timestamp',
        params: '{\n  "varName": "postExecutedAt",\n  "mode": "ms"\n}',
      },
    }
  }

  return {
    ...base,
    config: {
      duration: '500',
      unit: 'ms',
      note: '',
    },
  }
}

const normalizePostOperation = (op: any) => {
  const defaults = createPostOp(op?.type || 'assertion')
  return {
    ...defaults,
    ...op,
    id: op?.id || createUid('post'),
    enabled: op?.enabled ?? true,
    name: op?.name || op?.config?.name || defaults.name,
    config: {
      ...defaults.config,
      ...(op?.config || {}),
    },
  }
}

const removePostOp = (index: number) => {
  postOperations.value.splice(index, 1)
  if (editingOpIndex.value === index) {
    editingOpIndex.value = null
    return
  }
  if (editingOpIndex.value !== null && editingOpIndex.value > index) {
    editingOpIndex.value -= 1
  }
}

const postOpTypeLabel = (type: string) => postOpTypeLabels[type] || '后置操作'
const postOpIcon = (type: string) => postOpIcons[type] || CheckCircleFilled

const postOpSummary = (op: any) => {
  if (!op) return '未配置'
  if (op.type === 'extract') {
    const sourceMap: Record<string, string> = {
      json: '响应 JSON',
      header: '响应 Header',
      text: '响应文本',
    }
    const variableName = op.config?.name || op.name || '新变量'
    const source = sourceMap[op.config?.source || 'json'] || '响应 JSON'
    return `${variableName} | ${source} | ${op.config?.expression || '未填写表达式'}`
  }
  if (op.type === 'assertion') {
    const targetLabel = assertTargets.find(item => item.value === op.config?.target)?.label || '响应 JSON'
    const operatorLabel = assertOperators.find(item => item.value === op.config?.operator)?.label || '等于'
    if (['exists', 'not_exists'].includes(op.config?.operator)) {
      return `${targetLabel} | ${op.config?.expression || '当前值'} | ${operatorLabel}`
    }
    return `${targetLabel} | ${op.config?.expression || '当前值'} | ${operatorLabel} ${op.config?.value ?? ''}`.trim()
  }
  if (op.type === 'db') {
    const action = dbActionOptions.find(item => item.value === op.config?.action)?.label || '查询'
    const datasource = op.config?.datasource || '未设置数据源'
    const sql = (op.config?.sql || '').split('\n')[0] || '未填写 SQL'
    return `${action} ${datasource} | ${sql}`
  }
  if (op.type === 'script') {
    const language = getScriptLanguageLabel(op.config?.language || 'javascript')
    const firstLine = (op.config?.script || '').split('\n')[0] || '未填写脚本'
    return `${language} | ${firstLine}`
  }
  if (op.type === 'public_script') {
    const scriptName = publicScriptRegistry[op.config?.script_key]?.label || '未选择模板'
    return `${scriptName} | ${currentPublicScriptDescription(op.config?.script_key)}`
  }
  const duration = op.config?.duration || 0
  const unit = waitUnitOptions.find(item => item.value === op.config?.unit)?.label || '毫秒'
  return `等待 ${duration} ${unit}${op.config?.note ? ` | ${op.config.note}` : ''}`
}

const handleAddPostOp = (type: string) => {
  const op = createPostOp(type)
  postOperations.value.push(op)
  editingOpIndex.value = postOperations.value.length - 1
  activeTab.value = 'post'
}

const applyScriptSnippet = async (op: any, snippetCode: string) => {
  if (!op?.config) return
  pushScriptHistory(op)

  const currentScript = String(op.config.script || '')
  const cursor = scriptCursorMap.value[op.id]

  if (!cursor) {
    const trimmed = currentScript.trim()
    op.config.script = trimmed ? `${trimmed}\n\n${snippetCode}` : snippetCode
    await focusScriptCursor(op.id, op.config.script.length)
    return
  }

  const before = currentScript.slice(0, cursor.start)
  const after = currentScript.slice(cursor.end)
  const insertPrefix = before && !before.endsWith('\n') ? '\n' : ''
  const insertSuffix = after && !after.startsWith('\n') ? '\n' : ''
  const inserted = `${insertPrefix}${snippetCode}${insertSuffix}`
  op.config.script = `${before}${inserted}${after}`

  const nextPosition = before.length + inserted.length
  await focusScriptCursor(op.id, nextPosition)
}

const postOperations = ref<any[]>([])
const editingOpIndex = ref<number | null>(null)

const assertTargets = [
  { label: 'Response Text', value: 'response_text' },
  { label: 'Response JSON', value: 'response_json' },
  { label: 'Response XML', value: 'response_xml' },
  { label: 'Response Header', value: 'response_header' },
  { label: 'Response Cookie', value: 'response_cookie' },
  { label: 'HTTP Code', value: 'status_code' },
  { label: '环境变量', value: 'env_var' },
  { label: '全局变量', value: 'global_var' }
]

const assertOperators = [
  { label: '等于', value: 'equals' },
  { label: '不等于', value: 'not_equals' },
  { label: '存在', value: 'exists' },
  { label: '不存在', value: 'not_exists' },
  { label: '小于', value: 'less_than' },
  { label: '小于或等于', value: 'less_than_or_equals' },
  { label: '大于', value: 'greater_than' },
  { label: '大于或等于', value: 'greater_than_or_equals' },
  { label: '正则匹配', value: 'regex' },
  { label: '包含', value: 'contains' }
]

const bodyType = ref('json')
const bodyJsonContent = ref('')
const activeTab = ref('body')
const responseActiveTab = ref('body')

// --- Cookies ---
interface CookieItem {
  _key: string
  enabled: boolean
  name: string
  value: string
  domain: string
  path: string
  expires: string
  secure: boolean
  httpOnly: boolean
}
let _ckCounter = 0
const newCkKey = () => `ck_${++_ckCounter}_${Date.now()}`
const cookies = ref<CookieItem[]>([])

function addCookie() {
  cookies.value.push({
    _key: newCkKey(), enabled: true,
    name: '', value: '', domain: '', path: '/', expires: '', secure: false, httpOnly: false
  })
}
function removeCookie(idx: number) {
  cookies.value.splice(idx, 1)
}

// --- Auth ---
const authType = ref<'none' | 'bearer' | 'basic' | 'apikey' | 'oauth2'>('none')

const authBearer = ref({ token: '', prefix: 'Bearer' })

const authBasic = ref({ username: '', password: '' })
const basicAuthEncoded = computed(() => {
  if (!authBasic.value.username) return '（请输入用户名）'
  const raw = `${authBasic.value.username}:${authBasic.value.password}`
  return btoa(unescape(encodeURIComponent(raw)))
})

const authApiKey = ref({ key: 'X-API-Key', value: '', in: 'header' })

const authOAuth2 = ref({
  grantType: 'client_credentials',
  tokenUrl: '',
  clientId: '',
  clientSecret: '',
  username: '',
  password: '',
  scope: '',
  accessToken: ''
})
const oauthLoading = ref(false)
const fetchOAuth2Token = async () => {
  if (!authOAuth2.value.tokenUrl) {
    message.warning('请填写 Token URL')
    return
  }
  oauthLoading.value = true
  try {
    const params = new URLSearchParams()
    params.set('grant_type', authOAuth2.value.grantType)
    if (authOAuth2.value.clientId) params.set('client_id', authOAuth2.value.clientId)
    if (authOAuth2.value.clientSecret) params.set('client_secret', authOAuth2.value.clientSecret)
    if (authOAuth2.value.scope) params.set('scope', authOAuth2.value.scope)
    if (authOAuth2.value.grantType === 'password') {
      params.set('username', authOAuth2.value.username)
      params.set('password', authOAuth2.value.password)
    }
    const res: any = await execRequest.post('/proxy', {
      url: authOAuth2.value.tokenUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: Object.fromEntries(params)
    })
    const token = res?.data?.access_token || res?.access_token
    if (token) {
      authOAuth2.value.accessToken = token
      message.success('Token 获取成功')
    } else {
      message.error('未能从响应中解析 access_token')
    }
  } catch {
    message.error('Token 获取失败')
  } finally {
    oauthLoading.value = false
  }
}

const authTypeOptions = [
  {
    value: 'none', label: '无认证', color: 'linear-gradient(135deg,#9ca3af,#6b7280)',
    svgInner: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
  },
  {
    value: 'bearer', label: 'Bearer Token', color: 'linear-gradient(135deg,#7d33ff,#a855f7)',
    svgInner: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
  },
  {
    value: 'basic', label: 'Basic Auth', color: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
    svgInner: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
  },
  {
    value: 'apikey', label: 'API Key', color: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
    svgInner: '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>'
  },
  {
    value: 'oauth2', label: 'OAuth 2.0', color: 'linear-gradient(135deg,#10b981,#34d399)',
    svgInner: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>'
  }
]

// --- Request Settings ---
interface ReqSettings {
  timeout: number
  maxRedirects: number
  followRedirects: boolean
  sslVerify: boolean
  keepCookies: boolean
  autoContentType: boolean
  useProxy: boolean
  proxyUrl: string
  proxyUser: string
  proxyPass: string
  responseEncoding: string
  maxResponseSize: number
  autoParseJson: boolean
  showTiming: boolean
}
const defaultSettings: ReqSettings = {
  timeout: 30000,
  maxRedirects: 5,
  followRedirects: true,
  sslVerify: true,
  keepCookies: true,
  autoContentType: true,
  useProxy: false,
  proxyUrl: '',
  proxyUser: '',
  proxyPass: '',
  responseEncoding: 'utf-8',
  maxResponseSize: 10240,
  autoParseJson: true,
  showTiming: true
}
const reqSettings = ref<ReqSettings>({ ...defaultSettings })
const resetSettings = () => { reqSettings.value = { ...defaultSettings } }

const encodingOptions = [
  { label: 'UTF-8', value: 'utf-8' },
  { label: 'GBK', value: 'gbk' },
  { label: 'GB2312', value: 'gb2312' },
  { label: 'ISO-8859-1', value: 'iso-8859-1' },
  { label: 'ASCII', value: 'ascii' }
]
const validateResponse = ref(true)
const responseStatus = ref('200')
const sending = ref(false)
const responseResult = ref<any>(null)
const actualRequest = ref<any>(null)
const responseTime = ref(0)
const responseSize = ref('')
const assertionResults = ref<any[]>([])
const consoleLogs = ref<any[]>([])
// 控制台日志
// 响应区域宽度控制
const validationPanelWidth = ref(300)
const isResizing = ref(false)

// 调试区高度
const debugContentHeight = ref(400)
const isResizingV = ref(false)

const startResizeV = (e: MouseEvent) => {
  isResizingV.value = true
  document.addEventListener('mousemove', handleResizeV)
  document.addEventListener('mouseup', stopResizeV)
  document.body.style.cursor = 'row-resize'
}

const handleResizeV = (e: MouseEvent) => {
  if (!isResizingV.value) return
  const container = document.querySelector('.api-debug-container')
  if (container) {
    const containerRect = container.getBoundingClientRect()
    // 相对容器顶部偏移，减去地址栏高度（约 56px）
    const headerHeight = 56
    const newHeight = e.clientY - containerRect.top - headerHeight
    if (newHeight > 150 && newHeight < containerRect.height - 150) {
      debugContentHeight.value = newHeight
    }
  }
}

const stopResizeV = () => {
  isResizingV.value = false
  document.removeEventListener('mousemove', handleResizeV)
  document.removeEventListener('mouseup', stopResizeV)
  document.body.style.cursor = ''
}

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  // 获取容器宽度并计算右侧面板宽度
  const container = document.querySelector('.response-content-wrapper')
  if (container) {
    const containerRect = container.getBoundingClientRect()
    const newWidth = containerRect.right - e.clientX
    if (newWidth > 200 && newWidth < 600) {
      validationPanelWidth.value = newWidth
    }
  }
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
}

const selectedCodeLang = ref('Python')
const selectedCodeLib = ref('http.client')
const codeLangs = ['Shell', 'JavaScript', 'Java', 'Swift', 'Go', 'PHP', 'Python', 'HTTP', 'C', 'C#', 'Objective-C', 'Ruby', 'OCaml', 'Dart', 'R']
const codeLibs: Record<string, string[]> = {
  'Python': ['http.client', 'Requests'],
  'JavaScript': ['Fetch', 'Axios', 'XHR'],
  'Go': ['Native'],
  'Java': ['OkHttp', 'Unirest']
}

watch(selectedCodeLang, (newLang) => {
  if (codeLibs[newLang] && codeLibs[newLang].length > 0) {
    selectedCodeLib.value = codeLibs[newLang][0]
  } else {
    selectedCodeLib.value = ''
  }
})

const generatedCode = computed(() => {
  if (!actualRequest.value) return ''
  
  const req = actualRequest.value
  const urlObj = new URL(req.url)
  const host = urlObj.host
  const pathWithQuery = urlObj.pathname + urlObj.search
  
  // Shell / cURL
  if (selectedCodeLang.value === 'Shell') {
    let code = `curl --request ${req.method} \\\n`
    code += `  --url ${req.url} \\\n`
    Object.entries(req.headers).forEach(([key, val]) => {
      code += `  --header '${key}: ${val}' \\\n`
    })
    if (req.body) {
      code += `  --data '${req.body}'`
    } else {
      code = code.trim().slice(0, -1)
    }
    return code
  }

  // JavaScript
  if (selectedCodeLang.value === 'JavaScript') {
    if (selectedCodeLib.value === 'Fetch') {
      let code = `fetch("${req.url}", {\n`
      code += `  method: "${req.method}",\n`
      code += `  headers: {\n`
      Object.entries(req.headers).forEach(([key, val]) => {
        code += `    "${key}": "${val}",\n`
      })
      code += `  }${req.body ? ',\n  body: JSON.stringify(' + req.body + ')' : ''}\n`
      code += `})\n.then(response => response.json())\n.then(data => console.log(data));`
      return code
    } else if (selectedCodeLib.value === 'Axios') {
      let code = `const axios = require('axios');\n\n`
      code += `let config = {\n`
      code += `  method: '${req.method.toLowerCase()}',\n`
      code += `  maxBodyLength: Infinity,\n`
      code += `  url: '${req.url}',\n`
      code += `  headers: {\n`
      Object.entries(req.headers).forEach(([key, val]) => {
        code += `    '${key}': '${val}',\n`
      })
      code += `  }${req.body ? ',\n  data: ' + req.body : ''}\n`
      code += `};\n\n`
      code += `axios.request(config)\n.then((response) => {\n  console.log(JSON.stringify(response.data));\n})\n.catch((error) => {\n  console.log(error);\n});`
      return code
    }
  }

  // Go
  if (selectedCodeLang.value === 'Go') {
    let code = `package main\n\nimport (\n  "fmt"\n  "net/http"\n  "io/ioutil"\n${req.body ? '  "strings"\n' : ''})\n\n`
    code += `func main() {\n  url := "${req.url}"\n  method := "${req.method}"\n\n`
    if (req.body) {
      code += `  payload := strings.NewReader(\`${req.body}\`)\n`
    }
    code += `  client := &http.Client {}\n`
    code += `  req, _ := http.NewRequest(method, url, ${req.body ? 'payload' : 'nil'})\n\n`
    Object.entries(req.headers).forEach(([key, val]) => {
      code += `  req.Header.Add("${key}", "${val}")\n`
    })
    code += `\n  res, _ := client.Do(req)\n  defer res.Body.Close()\n\n  body, _ := ioutil.ReadAll(res.Body)\n  fmt.Println(string(body))\n}`
    return code
  }

  // Java
  if (selectedCodeLang.value === 'Java') {
    if (selectedCodeLib.value === 'OkHttp') {
      let code = `OkHttpClient client = new OkHttpClient().newBuilder().build();\n`
      if (req.body) {
        code += `MediaType mediaType = MediaType.parse("${req.headers['Content-Type'] || 'application/json'}");\n`
        code += `RequestBody body = RequestBody.create(mediaType, "${req.body.replace(/"/g, '\\"')}");\n`
      }
      code += `Request request = new Request.Builder()\n`
      code += `  .url("${req.url}")\n`
      code += `  .method("${req.method}", ${req.body ? 'body' : 'null'})\n`
      Object.entries(req.headers).forEach(([key, val]) => {
        code += `  .addHeader("${key}", "${val}")\n`
      })
      code += `  .build();\n`
      code += `Response response = client.newCall(request).execute();`
      return code
    }
  }

  // Python
  if (selectedCodeLang.value === 'Python') {
    if (selectedCodeLib.value === 'http.client') {
      let code = `import http.client\nimport json\n\n`
      code += `conn = http.client.HTTPSConnection("${host}")\n`
      code += `payload = '${req.body || ''}'\n`
      code += `headers = {\n`
      Object.entries(req.headers).forEach(([key, val]) => {
        code += `    '${key}': '${val}',\n`
      })
      code += `}\n`
      code += `conn.request("${req.method}", "${pathWithQuery}", payload, headers)\n`
      code += `res = conn.getresponse()\n`
      code += `data = res.read()\n`
      code += `print(data.decode("utf-8"))`
      return code
    } else if (selectedCodeLib.value === 'Requests') {
      let code = `import requests\nimport json\n\n`
      code += `url = "${req.url}"\n\n`
      code += `payload = ${req.body ? JSON.stringify(JSON.parse(req.body), null, 4) : 'json.dumps({})'}\n`
      code += `headers = {\n`
      Object.entries(req.headers).forEach(([key, val]) => {
        code += `    '${key}': '${val}',\n`
      })
      code += `}\n\n`
      code += `response = requests.request("${req.method}", url, headers=headers, data=payload)\n\n`
      code += `print(response.text)`
      return code
    }
  }
  
  return '# 暂未实现 ' + selectedCodeLang.value + ' - ' + selectedCodeLib.value + ' 的代码生成'
})
const codeLineCount = computed(() => {
  return generatedCode.value.split('\n').length
})

const responseLineCount = computed(() => {
  if (!responseResult.value) return 0
  const str = formatResponse(responseResult.value)
  return str.split('\n').length
})

const statusOptions = computed(() => {
  const code = String(responseStatus.value || '200')
  const label = code.startsWith('2') ? '成功 (' + code + ')' : '失败 (' + code + ')'
  return [{ label, value: code }]
})

const formatResponse = (data: any) => {
  if (!data) return ''
  // 如果是 proxy 返回的完整对象，优先取 data
  const realData = data.data || data
  if (typeof realData === 'string') return realData
  try {
    return JSON.stringify(realData, null, 2)
  } catch (e) {
    return String(realData)
  }
}

const pushConsoleLog = (type: string, messageText: string) => {
  consoleLogs.value.push({
    time: new Date().toLocaleTimeString(),
    type,
    message: messageText,
  })
}

const parseJsonConfig = (raw: string | undefined, fallback: any = {}) => {
  if (!raw || !String(raw).trim()) return fallback
  return JSON.parse(raw)
}

const toWaitMilliseconds = (duration: string | number, unit: string) => {
  const numericDuration = Number(duration || 0)
  if (unit === 'm') return numericDuration * 60 * 1000
  if (unit === 's') return numericDuration * 1000
  return numericDuration
}

const cloneEditableParamRows = (rows: any[]) => {
  return rows.map((item, index) => ensureParamRow(item, index))
}

const upsertParamRow = (rows: any[], name: string, value: any) => {
  const index = rows.findIndex(row => row.name === name)
  if (index > -1) {
    rows[index].example = String(value ?? '')
    return
  }
  rows.push(ensureParamRow({
    name,
    type: 'string',
    example: String(value ?? ''),
    desc: '',
  }, rows.length))
}

const removeParamRow = (rows: any[], name: string) => {
  const index = rows.findIndex(row => row.name === name)
  if (index > -1) {
    rows.splice(index, 1)
  }
}

const createPreOpRuntimeContext = (draft: any) => {
  return {
    get method() {
      return draft.method
    },
    set method(value: string) {
      draft.method = String(value || 'GET').toUpperCase()
    },
    get path() {
      return draft.path
    },
    set path(value: string) {
      draft.path = String(value || '')
    },
    get bodyText() {
      return draft.bodyText
    },
    set bodyText(value: string) {
      draft.bodyText = String(value ?? '')
    },
    get queryParams() {
      return draft.queryParams
    },
    get headerParams() {
      return draft.headerParams
    },
    get variables() {
      return draft.variables
    },
    get tempVariables() {
      return draft.tempVariables
    },
    get envBaseUrl() {
      return draft.envBaseUrl
    },
    setVar(name: string, value: any) {
      draft.variables[name] = String(value ?? '')
    },
    getVar(name: string) {
      return draft.variables[name]
    },
    setTempVar(name: string, value: any) {
      draft.tempVariables[name] = value
    },
    getTempVar(name: string) {
      return draft.tempVariables[name]
    },
    setHeader(name: string, value: any) {
      upsertParamRow(draft.headerParams, name, value)
    },
    removeHeader(name: string) {
      removeParamRow(draft.headerParams, name)
    },
    setQuery(name: string, value: any) {
      upsertParamRow(draft.queryParams, name, value)
    },
    removeQuery(name: string) {
      removeParamRow(draft.queryParams, name)
    },
    setBody(value: any) {
      draft.bodyText = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    },
    async request(config: any) {
      const requestUrl = String(config?.url || '')
      const baseUrl = String(draft.envBaseUrl || '')
      const fullUrl = /^https?:\/\//i.test(requestUrl) ? requestUrl : baseUrl + requestUrl
      return await execRequest.post('/proxy', {
        url: fullUrl,
        method: String(config?.method || 'GET').toUpperCase(),
        headers: config?.headers || {},
        body: config?.body ?? null,
      })
    },
  }
}

const executeJavaScriptPreOp = async (script: string, context: any, params: any = {}) => {
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
  const runner = new AsyncFunction('context', 'params', script)
  await runner(context, params)
}

const executePreOperations = async (draft: any) => {
  if (preOperations.value.length === 0) return

  const context = createPreOpRuntimeContext(draft)
  pushConsoleLog('info', '开始执行前置操作...')

  for (const op of preOperations.value) {
    if (!op.enabled) {
      pushConsoleLog('wait', '跳过未启用的前置操作：' + (op.name || preOpTypeLabel(op.type)))
      continue
    }

    try {
      if (op.type === 'wait') {
        const waitMs = toWaitMilliseconds(op.config?.duration || 0, op.config?.unit || 'ms')
        pushConsoleLog('info', '[等待时间] ' + (op.name || '等待') + '，耗时 ' + waitMs + ' ms')
        await new Promise(resolve => setTimeout(resolve, waitMs))
        pushConsoleLog('success', '[等待时间] ' + (op.name || '等待') + ' 执行完成')
        continue
      }

      if (op.type === 'script') {
        const currentLanguage = op.config?.language || 'javascript'
        if (currentLanguage !== 'javascript') {
          const languageLabel = scriptLanguageOptions.find(item => item.value === currentLanguage)?.label || currentLanguage
          pushConsoleLog('wait', '[脚本] 当前选择 ' + languageLabel + '，执行引擎暂未接入，现阶段仅支持 JavaScript')
          continue
        }
        await executeJavaScriptPreOp(op.config?.script || '', context)
        pushConsoleLog('success', '[脚本] ' + (op.name || '自定义脚本') + ' 执行完成')
        continue
      }

      if (op.type === 'public_script') {
        const scriptItem = publicScriptRegistry[op.config?.script_key]
        if (!scriptItem) {
          throw new Error('未找到脚本库模板')
        }
        await executeJavaScriptPreOp(scriptItem.script, context, parseJsonConfig(op.config?.params, {}))
        pushConsoleLog('success', '[脚本库] ' + scriptItem.label + ' 执行完成')
        continue
      }

      if (op.type === 'db') {
        const actionLabel = dbActionOptions.find(item => item.value === op.config?.action)?.label || '查询'
        const datasource = op.config?.datasource || '未设置数据源'
        pushConsoleLog('info', '[数据库操作] ' + actionLabel + ' ' + datasource + '，当前为前端编排占位，待后端执行引擎接入')
        if (op.config?.result_var) {
          context.setVar(op.config.result_var, '__db_pending__')
        }
      }
    } catch (error: any) {
      pushConsoleLog('error', '[前置操作失败] ' + (op.name || preOpTypeLabel(op.type)) + ': ' + (error?.message || error))
      throw error
    }
  }

  pushConsoleLog('info', '前置操作执行完成')
}

const handleSend = async () => {
  if (!path.value) {
    message.warning('请输入接口路径')
    return
  }
  
  sending.value = true
  responseResult.value = null
  actualRequest.value = null
  responseTime.value = 0
  responseSize.value = ''
  assertionResults.value = []
  
  try {
    // 获取环境变量并执行替换
    let variables: Record<string, string> = {}
    if (props.envId) {
      try {
        const envRes: any = await execRequest.get('/environments/' + props.envId)
        if (envRes && envRes.variables) {
          envRes.variables.forEach((v: any) => {
            variables[v.name] = v.local_value || v.remote_value || ''
          })
        }
      } catch (e) {
        console.warn('获取环境变量失败，跳过变量替换')
      }
    }

    const replaceVars = (str: string) => {
      if (!str) return str
      return str.replace(/\{\{(.+?)\}\}/g, (match, name) => {
        return variables[name.trim()] !== undefined ? variables[name.trim()] : match
      })
    }

    // 1. 构建完整 URL（包含 query params）
    const draft = {
      method: method.value,
      path: path.value,
      queryParams: cloneEditableParamRows(queryParams.value),
      headerParams: cloneEditableParamRows(headerParams.value),
      bodyText: bodyJsonContent.value,
      variables,
      tempVariables: {},
      envBaseUrl: props.envBaseUrl || '',
    }

    await executePreOperations(draft)

    method.value = draft.method
    path.value = draft.path
    queryParams.value = draft.queryParams
    headerParams.value = draft.headerParams
    bodyJsonContent.value = draft.bodyText
    variables = draft.variables

    let fullUrl = String(props.envBaseUrl || '') + replaceVars(draft.path)
    const qp = draft.queryParams
      .filter(p => p.name && (p.example || p.value))
      .map(p => {
        const name = replaceVars(p.name)
        const val = replaceVars(p.example || p.value)
        return encodeURIComponent(name) + '=' + encodeURIComponent(val)
      })
      .join('&')
    
    // API Key in query
    if (authType.value === 'apikey' && authApiKey.value.in === 'query' && authApiKey.value.key && authApiKey.value.value) {
      const apiKeyQp = encodeURIComponent(authApiKey.value.key) + '=' + encodeURIComponent(authApiKey.value.value)
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + apiKeyQp
    }

    if (qp) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + qp
    }

    // 2. 构建 Headers（含 Cookie / Auth 注入）
    const headers: Record<string, string> = {}
    draft.headerParams.forEach(p => {
      if (p.enabled !== false && p.name && (p.example || p.value)) {
        headers[replaceVars(p.name)] = replaceVars(p.example || p.value)
      }
    })

    // 注入 Cookies（已启用且有名称的条目）
    const enabledCookies = cookies.value.filter(ck => ck.enabled && ck.name)
    if (enabledCookies.length > 0 && !headers['Cookie']) {
      headers['Cookie'] = enabledCookies.map(ck => ck.name + '=' + ck.value).join('; ')
    }

    // 注入 Auth
    if (authType.value === 'bearer' && authBearer.value.token) {
      headers['Authorization'] = String(authBearer.value.prefix || 'Bearer') + ' ' + authBearer.value.token
    } else if (authType.value === 'basic' && authBasic.value.username) {
      const encoded = btoa(unescape(encodeURIComponent(String(authBasic.value.username) + ':' + String(authBasic.value.password || ''))))
      headers['Authorization'] = 'Basic ' + encoded
    } else if (authType.value === 'apikey' && authApiKey.value.key && authApiKey.value.value) {
      if (authApiKey.value.in === 'header') {
        headers[authApiKey.value.key] = authApiKey.value.value
      }
    } else if (authType.value === 'oauth2' && authOAuth2.value.accessToken) {
      headers['Authorization'] = 'Bearer ' + authOAuth2.value.accessToken
    }

    // 3. 构建 Body
    let bodyText = draft.bodyText
    if (bodyType.value === 'json') {
      bodyText = replaceVars(draft.bodyText)
    }
    
    let body: any = null
    if (bodyType.value === 'json' && bodyText) {
      try {
        body = JSON.parse(bodyText)
      } catch (e) {
        body = bodyText
      }
    }

    // 保存实际请求信息供展示
    actualRequest.value = {
      url: fullUrl,
      method: draft.method,
      headers: {
        'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
        'Content-Type': bodyType.value === 'json' ? 'application/json' : 'text/plain',
        'Accept': '*/*',
        ...headers
      },
      body: bodyText,
      bodyType: bodyType.value
    }

    // 4. 发送代理请求（携带 Settings 参数）
    const proxyPayload: Record<string, any> = {
      url: fullUrl,
      method: draft.method,
      headers: headers,
      body: body,
      timeout: reqSettings.value.timeout > 0 ? reqSettings.value.timeout / 1000 : null,
      follow_redirects: reqSettings.value.followRedirects,
      max_redirects: reqSettings.value.maxRedirects,
      verify_ssl: reqSettings.value.sslVerify
    }
    if (reqSettings.value.useProxy && reqSettings.value.proxyUrl) {
      proxyPayload.proxy = reqSettings.value.proxyUrl
    }
    const res: any = await execRequest.post('/proxy', proxyPayload)

    if (res.error) {
      message.error('请求失败: ' + res.error)
      responseResult.value = res
    } else {
      responseResult.value = res
      responseStatus.value = String(res.status_code)
      responseTime.value = res.elapsed
      // 简单估算大小
      const sizeBytes = JSON.stringify(res.data).length
      responseSize.value = sizeBytes > 1024 ? (sizeBytes / 1024).toFixed(2) + 'K' : sizeBytes + 'B'
      message.success('请求发送成功')

      // 执行后置操作
      if (postOperations.value.length > 0) {
        await handlePostOperationsV2(res)
      }
    }
  } catch (err) {
    console.error('发送请求失败', err)
    message.error('请求发送失败，请检查网络或执行引擎状态')
  } finally {
    sending.value = false
  }
}

const serializeParamRows = (rows: any[]) => rows.map(({ key, ...item }: any) => item)

const buildBodyDefinitionPayload = () => ({
  type: bodyType.value,
  content: ['json', 'text', 'xml'].includes(bodyType.value) ? bodyJsonContent.value : '',
})

function getInterfacePersistRef(data: Record<string, any> | null | undefined): string | number | null {
  if (!data) return null
  const id = data.id
  const code = data.code
  if (id != null && String(id).trim() !== '') return id
  if (code != null && String(code).trim() !== '') return code
  return null
}

function folderIdForSavePayload(data: Record<string, any> | null | undefined): string | null {
  if (!data) return null
  const parentId = data.parent_id
  if (parentId == null || parentId === '' || parentId === 0 || parentId === '0') return null
  return String(parentId).trim() || null
}

const buildInterfacePayload = () => {
  const fallbackName = props.data?.label || props.data?.name || '新接口'
  const payload: Record<string, any> = {
    name: String(editableName.value || fallbackName).trim() || fallbackName,
    method: String(method.value || 'GET').toUpperCase(),
    path: path.value || '/',
    status: 'developing',
    owner: 'admin',
    query_params: serializeParamRows(queryParams.value),
    header_params: serializeParamRows(headerParams.value),
    pre_operations: preOperations.value,
    post_operations: postOperations.value,
    body_definition: buildBodyDefinitionPayload(),
  }
  const folderId = folderIdForSavePayload(props.data)
  if (folderId != null) payload.folder_id = folderId
  return payload
}

const applySavedInterfaceToLocal = (saved?: Record<string, any>) => {
  const ref = getInterfacePersistRef(saved) ?? getInterfacePersistRef(props.data)
  const savedName = saved?.name ?? (String(editableName.value || props.data?.label || props.data?.name || '新接口').trim() || '新接口')
  props.data.label = savedName
  props.data.name = savedName
  props.data.method = saved?.method ?? String(method.value || 'GET').toUpperCase()
  props.data.path = saved?.path ?? (path.value || '/')
  props.data.query_params = serializeParamRows(queryParams.value)
  props.data.header_params = serializeParamRows(headerParams.value)
  props.data.pre_operations = preOperations.value
  props.data.post_operations = postOperations.value
  props.data.body_definition = buildBodyDefinitionPayload()
  props.data.isNew = false
  if (ref != null && ref !== '') props.data.id = ref
  if (saved?.code != null) props.data.code = saved.code
}

/** 在当前页面直接保存接口定义，替代原来的独立编辑页与暂存流程 */
const handleSaveInterface = async () => {
  if (props.data?.isTestCase) return
  if (interfaceSaving.value) return

  interfaceSaving.value = true
  try {
    const payload = buildInterfacePayload()
    method.value = payload.method
    path.value = payload.path
    editableName.value = payload.name

    const persistRef = getInterfacePersistRef(props.data)
    const shouldUpdate = !!persistRef && props.data?.isNew !== true
    const saved: any = shouldUpdate
      ? await execRequest.patch('/interfaces/' + persistRef, payload)
      : await execRequest.post('/interfaces', payload)

    applySavedInterfaceToLocal(saved && typeof saved === 'object' ? saved : undefined)
    message.success(shouldUpdate ? '保存成功' : '接口创建成功')
    emit('save-success', saved && typeof saved === 'object' ? saved : undefined)
  } catch (err) {
    message.error('保存失败')
  } finally {
    interfaceSaving.value = false
  }
}

// 保存 / 更新用例
const handleUpdateCase = async () => {
  if (!props.data?.id) return
  try {
    const isTestCase = props.data.isTestCase
    const url = isTestCase ? '/test-cases/' + props.data.id : '/interfaces/' + props.data.id
    
    // 如果名称没有变化，则不传 name 字段
    const originalName = props.data.label || props.data.name
    const payload: any = {
      method: method.value,
      path: path.value,
      query_params: queryParams.value,
      header_params: headerParams.value,
      pre_operations: preOperations.value,
      post_operations: postOperations.value,
      body_definition: {
        type: bodyType.value,
        content: bodyJsonContent.value
      }
    }

    if (editableName.value && editableName.value !== originalName) {
      payload.name = editableName.value
    }
    
    const saved: any = await execRequest.patch(url, payload)
    message.success('更新成功')
    emit('save-success', saved && typeof saved === 'object' ? saved : undefined)
  } catch (err) {
    message.error('更新失败')
  }
}

const handleSaveNewCase = async () => {
  if (!caseName.value) {
    message.warning('请输入用例名称')
    return
  }
  
  saving.value = true
  try {
    const payload = {
      interface_id: props.data.id,
      name: caseName.value,
      case_type: caseType.value,
      method: method.value,
      path: path.value,
      query_params: queryParams.value.filter(p => p.name),
      header_params: headerParams.value.filter(p => p.name),
      pre_operations: preOperations.value,
      post_operations: postOperations.value,
      body_definition: {
        type: bodyType.value,
        content: bodyJsonContent.value
      },
      assertions: []
    }
    
    await execRequest.post('/test-cases', payload)
    message.success('保存成功')
    showSaveCaseModal.value = false
    emit('save-success')
  } catch (err) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleDeleteCase = async () => {
  if (!props.data?.id) return
  try {
    await execRequest.delete('/test-cases/' + props.data.id)
    message.success('用例删除成功')
    emit('delete-success')
  } catch (err) {
    message.error('删除失败')
  }
}

// 用例弹窗相关
const showSaveCaseModal = ref(false)
const saving = ref(false)
const caseName = ref('成功')
const caseType = ref('debug')
const saveResponse = ref(true)
const caseNameOptions = [
  { label: '成功', value: '成功' },
  { label: '失败', value: '失败' },
  { label: '记录不存在', value: '记录不存在' },
  { label: '数据为空', value: '数据为空' },
  { label: '缺少参数', value: '缺少参数' },
  { label: '参数有误', value: '参数有误' },
  { label: '已登录', value: '已登录' },
  { label: '未登录', value: '未登录' }
]

const getByExpression = (source: any, expression: string) => {
  if (!expression) return source
  const normalized = String(expression)
    .trim()
    .replace(/^\$\./, '')
    .replace(/^\$/, '')

  if (!normalized) return source

  const segments = normalized
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)

  let current = source
  for (const segment of segments) {
    if (current === null || current === undefined) return undefined
    current = current[segment]
  }
  return current
}

const evaluateAssertionResult = (actualValue: any, operator: string, expectedValue: any) => {
  if (operator === 'equals') return String(actualValue) === String(expectedValue)
  if (operator === 'not_equals') return String(actualValue) !== String(expectedValue)
  if (operator === 'contains') return String(actualValue ?? '').includes(String(expectedValue ?? ''))
  if (operator === 'exists') return actualValue !== undefined && actualValue !== null && actualValue !== ''
  if (operator === 'not_exists') return actualValue === undefined || actualValue === null || actualValue === ''

  const actualNumber = Number(actualValue)
  const expectedNumber = Number(expectedValue)

  if (operator === 'less_than') return actualNumber < expectedNumber
  if (operator === 'less_than_or_equals') return actualNumber <= expectedNumber
  if (operator === 'greater_than') return actualNumber > expectedNumber
  if (operator === 'greater_than_or_equals') return actualNumber >= expectedNumber
  if (operator === 'regex') return new RegExp(String(expectedValue || '')).test(String(actualValue ?? ''))

  return false
}

const createPostOpRuntimeContext = (response: any, variables: Record<string, string>, tempVariables: Record<string, any>) => {
  const responseHeaders = response?.headers || {}
  return {
    response,
    responseData: response?.data,
    responseHeaders,
    statusCode: response?.status_code,
    variables,
    tempVariables,
    getVar(name: string) {
      return variables[name]
    },
    setVar(name: string, value: any) {
      variables[name] = String(value ?? '')
    },
    getTempVar(name: string) {
      return tempVariables[name]
    },
    setTempVar(name: string, value: any) {
      tempVariables[name] = value
    },
    getHeader(name: string) {
      return responseHeaders?.[name]
    },
    getCookie(name: string) {
      return responseHeaders?.['set-cookie']?.[name]
    },
    async request(config: any) {
      return await execRequest.post('/proxy', {
        url: config?.url,
        method: String(config?.method || 'GET').toUpperCase(),
        headers: config?.headers || {},
        body: config?.body ?? null,
      })
    },
  }
}

const handlePostOperations = async (response: any) => {
  await handlePostOperationsV2(response)
}

const handlePostOperationsV2 = async (response: any) => {
  if (!response) return

  const responseData = response.data || {}
  assertionResults.value = []

  const variables: Record<string, string> = {}
  const tempVariables: Record<string, any> = {}

  if (props.envId) {
    try {
      const envRes: any = await execRequest.get('/environments/' + props.envId)
      if (Array.isArray(envRes?.variables)) {
        envRes.variables.forEach((item: any) => {
          variables[item.name] = item.local_value || item.remote_value || ''
        })
      }
    } catch (error) {
      pushConsoleLog('wait', '加载环境变量失败，后置脚本将继续使用当前内存上下文')
    }
  }

  const context = createPostOpRuntimeContext(response, variables, tempVariables)
  pushConsoleLog('info', '开始执行后置操作...')

  for (const op of postOperations.value) {
    if (!op.enabled) {
      pushConsoleLog('wait', '跳过未启用的后置操作：' + (op.name || postOpTypeLabel(op.type)))
      continue
    }

    try {
      if (op.type === 'wait') {
        const waitMs = toWaitMilliseconds(op.config?.duration || 0, op.config?.unit || 'ms')
        pushConsoleLog('info', '[等待时间] ' + (op.name || '等待时间') + '，耗时 ' + waitMs + ' ms')
        await new Promise(resolve => setTimeout(resolve, waitMs))
        pushConsoleLog('success', '[等待时间] ' + (op.name || '等待时间') + ' 执行完成')
        continue
      }

      if (op.type === 'extract') {
        const expression = op.config?.expression || ''
        const variableName = op.config?.name || op.name || 'new_variable'
        let value: any

        if (op.config?.source === 'header') {
          value = response?.headers?.[expression]
        } else if (op.config?.source === 'text') {
          value = String(responseData ?? '')
        } else {
          value = getByExpression(responseData, expression)
        }

        if (value === undefined) {
          pushConsoleLog('error', '[提取变量] ' + variableName + ' 失败，未找到 ' + (expression || '目标表达式'))
          continue
        }

        if (op.config?.target === 'temporary') {
          context.setTempVar(variableName, value)
        } else {
          context.setVar(variableName, value)
          if (props.envId) {
            await saveVariableToEnvironment(variableName, value)
          }
        }

        pushConsoleLog('success', '[提取变量] ' + variableName + ' = ' + String(value))
        continue
      }

      if (op.type === 'assertion') {
        const target = op.config?.target
        const expression = op.config?.expression || ''
        const expected = op.config?.value
        const operator = op.config?.operator || 'equals'
        let actualValue: any = null

        if (target === 'status_code') {
          actualValue = response.status_code
        } else if (target === 'response_json') {
          actualValue = getByExpression(responseData, expression)
        } else if (target === 'response_text' || target === 'response_xml') {
          actualValue = typeof responseData === 'string' ? responseData : JSON.stringify(responseData)
        } else if (target === 'response_header') {
          actualValue = response?.headers?.[expression]
        } else if (target === 'response_cookie') {
          actualValue = response?.headers?.['set-cookie']?.[expression]
        } else if (target === 'env_var' || target === 'global_var') {
          actualValue = context.getVar(expression)
        }

        const passed = evaluateAssertionResult(actualValue, operator, expected)
        const result = {
          name: op.config?.name || op.name || ('断言 ' + String(target || '')),
          status: passed ? 'pass' : 'fail',
          message: passed ? '校验通过' : ('期望 "' + String(expected) + '"，实际为 "' + String(actualValue) + '"'),
        }
        assertionResults.value.push(result)
        pushConsoleLog(passed ? 'success' : 'error', '[断言] ' + result.name + ': ' + result.message)
        continue
      }

      if (op.type === 'script') {
        const currentLanguage = op.config?.language || 'javascript'
        if (currentLanguage !== 'javascript') {
          pushConsoleLog('wait', '[自定义脚本] 当前选择 ' + getScriptLanguageLabel(currentLanguage) + '，已提供模板和代码片段，但运行时暂仅支持 JavaScript')
          continue
        }

        await executeJavaScriptPreOp(
          op.config?.script || '',
          {
            ...context,
            response,
            responseData,
            statusCode: response.status_code,
          },
          {},
        )

        pushConsoleLog('success', '[自定义脚本] ' + (op.name || '自定义脚本') + ' 执行完成')
        continue
      }

      if (op.type === 'public_script') {
        const scriptItem = publicScriptRegistry[op.config?.script_key]
        if (!scriptItem) {
          throw new Error('未找到公共脚本模板')
        }

        const params = parseJsonConfig(op.config?.params, {})
        await executeJavaScriptPreOp(
          scriptItem.script,
          {
            ...context,
            response,
            responseData,
            statusCode: response.status_code,
          },
          params,
        )

        pushConsoleLog('success', '[公共脚本] ' + scriptItem.label + ' 执行完成')
        continue
      }

      if (op.type === 'db') {
        const actionLabel = dbActionOptions.find(item => item.value === op.config?.action)?.label || '查询'
        const datasource = op.config?.datasource || '未设置数据源'
        pushConsoleLog('info', '[数据库操作] ' + actionLabel + ' ' + datasource + '，当前为前端可用占位实现，等待后端执行引擎接入')
        if (op.config?.result_var) {
          context.setTempVar(op.config.result_var, '__db_pending__')
          pushConsoleLog('info', '[数据库操作] 已写入结果变量 ' + op.config.result_var + ' = __db_pending__')
        }
      }
    } catch (err: any) {
      pushConsoleLog('error', '[后置操作失败] ' + (op.name || postOpTypeLabel(op.type)) + ': ' + (err?.message || err))
    }
  }

  pushConsoleLog('info', '后置操作执行完成')
}

const saveVariableToEnvironment = async (name: string, value: any) => {
  if (!props.envId) return
  try {
    // 1. 获取当前环境详情
    const envRes: any = await execRequest.get('/environments/' + props.envId)
    if (envRes) {
      const variables = Array.isArray(envRes.variables) ? [...envRes.variables] : []
      // 2. 查找并更新，如不存在则新增
      const existingIdx = variables.findIndex(v => v.name === name)
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
      // 3. 提交更新
      await execRequest.patch('/environments/' + props.envId, { variables })
      console.log('变量 ' + name + ' 已持久化到环境')
    }
  } catch (err) {
    console.error('持久化变量失败', err)
  }
}

const handleSaveCase = async () => {
  if (!props.data?.id) {
    message.error('接口 ID 不存在，无法保存用例')
    return
  }

  try {
    const payload = {
      interface_id: props.data.id,
      name: caseName.value,
      case_type: caseType.value,
      query_params: queryParams.value.map(({ key, ...item }: any) => item),
      header_params: headerParams.value.map(({ key, ...item }: any) => item),
      pre_operations: preOperations.value,
      post_operations: postOperations.value,
      body_definition: {
        type: bodyType.value,
        content: bodyType.value === 'json' ? bodyJsonContent.value : ''
      },
      assertions: saveResponse.value ? [
        { type: 'status_code', value: 200 }
      ] : []
    }

    await execRequest.post('/test-cases', payload)
    message.success('用例保存成功')
    showSaveCaseModal.value = false
    emit('save-success')
  } catch (err) {
    console.error('保存用例失败:', err)
    message.error('保存用例失败')
  }
}

const bodyTypeOptions = [
  { label: 'none', value: 'none' },
  { label: 'form-data', value: 'form-data' },
  { label: 'x-www-form-urlencoded', value: 'x-www-form-urlencoded' },
  { label: 'JSON', value: 'json' },
  { label: 'XML', value: 'xml' },
  { label: 'Text', value: 'text' },
  { label: 'Binary', value: 'binary' },
  { label: 'GraphQL', value: 'graphql' },
  { label: 'msgpack', value: 'msgpack' },
]

function pickBodyDefinition(data: Record<string, any>) {
  let bd: any = data.body_definition ?? data.bodyDefinition
  if (bd == null) return { type: 'none', content: '' }
  if (typeof bd === 'string') {
    try {
      bd = JSON.parse(bd)
    } catch {
      return { type: 'none', content: '' }
    }
  }
  if (typeof bd !== 'object') return { type: 'none', content: '' }
  try {
    bd = JSON.parse(JSON.stringify(toRaw(bd)))
  } catch {
    bd = toRaw(bd) as Record<string, any>
  }
  const c = bd.content != null ? (typeof bd.content === 'string' ? bd.content : JSON.stringify(bd.content, null, 2)) : ''
  const cTrim = c.trim()
  let t =
    bd.type != null && String(bd.type).trim() !== ''
      ? String(bd.type).trim().toLowerCase()
      : 'none'
  // 与 bodyTypeOptions 对齐；避免存成 JSON 大写导致 includes 失败而不渲染编辑器
  if (t === 'json' || t === 'application/json' || t.endsWith('+json')) t = 'json'
  if (t === 'xml' || t.includes('xml')) t = 'xml'
  if (t === 'text' || t === 'plain' || t === 'text/plain') t = 'text'
  // type 为 none/空但已有正文时，按内容推断，否则会出现「有 content 仍走 none 分支」页面像没数据
  if ((t === 'none' || t === '') && cTrim) {
    if (cTrim.startsWith('{') || cTrim.startsWith('[')) t = 'json'
    else t = 'text'
  }
  return { type: t, content: c }
}

const initData = (data: any) => {
  if (!data) return
  editableName.value = data.label || data.name || ''
  method.value = data.method || 'GET'
  path.value = data.path || ''

  const qp = data.query_params ?? data.queryParams
  const hp = data.header_params ?? data.headerParams
  queryParams.value = Array.isArray(qp)
    ? qp.map((item: any, i: number) => ensureParamRow(item, i))
    : []
  headerParams.value = Array.isArray(hp)
    ? hp.map((item: any, i: number) => ensureParamRow(item, i))
    : []
  preOperations.value = Array.isArray(data.pre_operations)
    ? data.pre_operations.map((item: any) => normalizePreOperation(item))
    : []
  postOperations.value = Array.isArray(data.post_operations)
    ? data.post_operations.map((item: any) => normalizePostOperation(item))
    : []

  const bd = pickBodyDefinition(data)
  // 禁止 bd.type || 'json'：当 type 为字符串 'none' 时也是 truthy，会错误保持 none，导致 JSON 编辑区不渲染
  bodyType.value = bd.type
  bodyJsonContent.value = bd.content ?? ''
}

watch(
  () => {
    const d = props.data
    if (!d) return null
    return [d.id ?? d.code, d.body_definition, d.bodyDefinition, d.post_operations, d.pre_operations]
  },
  () => {
    if (props.data) initData(props.data)
  },
  { deep: true, immediate: true },
)

watch(() => props.envId, () => {
  fetchHeaderVariableNames()
}, { immediate: true })

onMounted(() => {
  fetchHeaderVariableNames()
})
</script>

<style scoped>
.api-debug-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.debug-url-bar {
  flex-shrink: 0;
  padding: 8px 0 16px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.debug-request-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  width: 100%;
  min-width: 0;
}

.debug-url-actions {
  flex-shrink: 0;
  margin-left: auto;
}

.param-add-btn {
  margin-top: 8px;
}

.param-data-table :deep(.n-data-table-th) {
  font-size: 12px;
  font-weight: normal;
  color: #8792a2;
}

.debug-title-row {
  width: 100%;
  max-width: 360px;
}

.debug-name-input :deep(.n-input__input-el) {
  font-size: 18px;
  font-weight: 600;
}

.method-url-group {
  flex: 1;
  min-width: 0;
  max-width: none;
  width: auto;
}

.delete-btn {
  color: #ff4d4f !important;
}

.delete-btn:hover {
  background-color: rgba(255, 77, 79, 0.1) !important;
}

.method-select :deep(.n-base-selection) {
  border-radius: 4px 0 0 4px;
  font-weight: 700;
}

.method-select :deep(.n-base-selection-label) {
  justify-content: center;
}

.method-select.post :deep(.n-base-selection-label) { color: #faad14; }
.method-select.get :deep(.n-base-selection-label) { color: #52c41a; }
.method-select.put :deep(.n-base-selection-label) { color: #1890ff; }
.method-select.delete :deep(.n-base-selection-label) { color: #ff4d4f; }
.method-select.patch :deep(.n-base-selection-label) { color: #722ed1; }

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

.send-btn {
  padding: 0 24px;
}

/* 2. 閸欏倹鏆?Tabs 閺嶅嘲绱?*/
.debug-content {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  min-height: 200px;
}

:deep(.param-tabs .n-tabs-nav) {
  padding: 0;
}

:deep(.param-tabs .n-tabs-tab) {
  font-size: 13px;
  padding: 12px 0;
  margin-right: 24px;
}

.pane-content {
  padding: 12px 0;
}

.header-pane {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.header-hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid #e8ecf4;
  border-radius: 18px;
  background: linear-gradient(135deg, #fbfcff 0%, #f3f7ff 100%);
}

.header-hero-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2a44;
  margin-bottom: 6px;
}

.header-stats-line {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.header-stats-line span {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #dde7f4;
  background: rgba(255, 255, 255, 0.82);
  color: #64748b;
  font-size: 12px;
}

.header-hero-desc {
  font-size: 12px;
  line-height: 1.7;
  color: #667085;
}

.header-hero-desc code,
.header-empty-desc code {
  background: rgba(60, 92, 220, 0.08);
  color: #335cff;
  padding: 2px 6px;
  border-radius: 8px;
}

.header-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
  justify-content: flex-end;
  min-width: 260px;
}

.header-preset-pill {
  border: 1px solid #d7def0;
  background: #fff;
  color: #40506a;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-preset-pill:hover {
  border-color: #98a8ff;
  color: #335cff;
}

.header-preset-pill.primary {
  background: linear-gradient(135deg, #335cff 0%, #5b7cff 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 10px 20px rgba(51, 92, 255, 0.18);
}

.header-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-search-input {
  max-width: 360px;
}

.header-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.header-toolbar-btn {
  border: 1px solid #dbe4f0;
  background: #fff;
  color: #334155;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.header-toolbar-btn:hover {
  border-color: #98a8ff;
  color: #335cff;
  background: #f8fbff;
}

.header-toolbar-btn.danger {
  color: #b42318;
  border-color: #f3d1cc;
  background: #fff7f6;
}

.header-variable-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 14px;
  border: 1px dashed #d6def5;
  border-radius: 14px;
  background: #fcfdff;
}

.header-variable-label {
  font-size: 12px;
  color: #5c6676;
  margin-right: 4px;
}

.header-variable-chip,
.header-inline-chip,
.header-inline-btn,
.header-icon-btn {
  border: none;
  background: none;
  cursor: pointer;
}

.header-variable-chip,
.header-inline-chip {
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(51, 92, 255, 0.08);
  color: #335cff;
  font-size: 12px;
}

.header-inline-btn {
  padding: 5px 10px;
  border-radius: 999px;
  background: #eef3ff;
  color: #335cff;
  font-size: 12px;
}

.header-board {
  border: 1px solid #e8ecf4;
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
}

.header-board-head,
.header-row {
  display: grid;
  grid-template-columns: 44px 1.15fr 24px 1.5fr 140px 1fr 88px;
  gap: 12px;
  align-items: start;
  padding: 14px 16px;
}

.header-board-head {
  background: #f8faff;
  border-bottom: 1px solid #eef2f8;
  font-size: 12px;
  color: #63708a;
  font-weight: 600;
}

.header-board-body .header-row + .header-row {
  border-top: 1px solid #f2f4f8;
}

.header-row {
  transition: background 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
}

.header-row.active {
  background: linear-gradient(180deg, rgba(239, 246, 255, 0.95), rgba(248, 250, 255, 0.98));
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.16);
}

.header-row.disabled {
  opacity: 0.58;
}

.col-check,
.col-eq,
.col-action {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
}

.col-eq {
  color: #98a2b3;
  font-weight: 700;
}

.header-enable-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #335cff;
}

.header-row-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.header-icon-btn {
  color: #667085;
  font-size: 12px;
}

.header-icon-btn.danger {
  color: #e5484d;
}

.header-empty-state {
  padding: 36px 18px;
  text-align: center;
}

.header-empty-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2a44;
  margin-bottom: 8px;
}

.header-empty-desc {
  font-size: 12px;
  line-height: 1.8;
  color: #667085;
  max-width: 680px;
  margin: 0 auto;
}

.header-empty-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.header-preview-card {
  padding: 14px 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, #f8fbff 0%, #f5f8ff 100%);
  border: 1px solid #e6ecfb;
}

.header-preview-title {
  font-size: 12px;
  font-weight: 700;
  color: #43506b;
  margin-bottom: 10px;
}

.header-preview-line {
  display: flex;
  gap: 8px;
  font-size: 12px;
  line-height: 1.8;
}

.header-preview-name {
  color: #344054;
  font-weight: 600;
}

.header-preview-sep {
  color: #98a2b3;
}

.header-preview-value {
  color: #335cff;
  word-break: break-all;
}

@media (max-width: 960px) {
  .header-hero {
    flex-direction: column;
  }

  .header-hero-actions {
    justify-content: flex-start;
    min-width: auto;
  }

  .header-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .header-search-input {
    max-width: none;
  }

  .header-board-head,
  .header-row {
    grid-template-columns: 36px 1fr;
  }

  .header-board-head .col-eq,
  .header-board-head .col-action,
  .header-row .col-eq {
    display: none;
  }

  .col-name,
  .col-value,
  .col-type,
  .col-desc,
  .col-action {
    grid-column: 2 / 3;
  }

  .col-action {
    justify-content: flex-start;
  }
}

/* Body 类型选择行 */
.body-type-selector {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.type-item {
  font-size: 12px;
  color: #5c6676;
  cursor: pointer;
  padding: 2px 0;
}

.type-item.active {
  color: #1a1f36;
  font-weight: 500;
}

/* JSON 类型选中态胶囊 */
.type-item.active[data-type="json"] {
  background: #1890ff;
  color: #fff;
  padding: 2px 8px;
  border-radius: 12px;
}

.type-item:hover {
  color: #1890ff;
}

/* JSON 编辑器容器 */
.json-editor-container {
  border: 1px solid #eef1f6;
  border-radius: 4px;
}

.json-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: #fafafa;
  border-bottom: 1px solid #eef1f6;
}

.dynamic-value-btn {
  font-size: 11px;
  height: 24px;
}

.json-toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #8792a2;
}

.warning-tag {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  color: #faad14;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.more-icon {
  cursor: pointer;
  font-size: 14px;
}

.editor-area {
  display: flex;
  height: 300px;
}

.line-numbers {
  width: 32px;
  background: #fafafa;
  border-right: 1px solid #eef1f6;
  color: #9aa3b2;
  text-align: center;
  padding-top: 8px;
  font-size: 12px;
  font-family: monospace;
}

.json-textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  padding: 8px 12px;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
}

/* 3. 底部响应区布局与交互 */
.debug-footer {
  border-top: 1px solid #f0f0f0;
  padding: 0 24px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  overflow: hidden;
}

.footer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  flex-shrink: 0;
}

.footer-tabs {
  flex: 1;
}

.footer-actions {
  display: flex;
  align-items: center;
}

.status-info-group {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 2px 8px;
  background: #f5f7fa;
  border-radius: 12px;
}

.status-code-tag {
  font-weight: 600;
  color: #faad14;
}
.status-code-tag.success { color: #52c41a; }

.res-meta-item {
  color: #8792a2;
  font-size: 12px;
}

.share-icon {
  color: #8792a2;
  cursor: pointer;
  font-size: 14px;
}

/* 校验响应开关组 */
.validation-control-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #5c6676;
}

.v-label {
  white-space: nowrap;
}

.pass-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  height: 24px;
}

.response-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: row; /* 主区域 + 右侧面板横向排列 */
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.response-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #f0f0f0;
  overflow: hidden;
}

.validation-side-panel {
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: auto;
  position: relative;
  min-width: 200px;
}

/* 左右分栏拖拽条 */
.panel-resizer {
  width: 4px;
  background: transparent;
  cursor: col-resize;
  transition: background 0.2s;
  z-index: 10;
}

.panel-resizer:hover, .panel-resizer:active {
  background: #7d33ff;
}

/* 上下分栏拖拽条 */
.panel-resizer-v {
  height: 4px;
  background: transparent;
  cursor: row-resize;
  transition: background 0.2s;
  z-index: 10;
  margin: 0 24px;
}

.panel-resizer-v:hover, .panel-resizer-v:active {
  background: #7d33ff;
}

.brief-item-wrapper {
  margin-bottom: 12px;
}

.assertion-error-detail {
  margin-left: 40px;
  margin-top: 4px;
  color: #ff4d4f;
  font-size: 12px;
  font-family: monospace;
  background: #fff1f0;
  padding: 4px 8px;
  border-radius: 4px;
  word-break: break-all;
}

.validation-panel-header {
  font-size: 14px;
  font-weight: 600;
  color: #1a1f36;
  margin-bottom: 16px;
}

.validation-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.validation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.validation-item.success { color: #52c41a; }

.v-icon { font-size: 16px; }
.v-icon.pass { color: #52c41a; }
.v-icon.fail { color: #ff4d4f; }

.assertion-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1f36;
}

.assertion-brief-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.brief-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.brief-index {
  color: #8792a2;
  width: 16px;
}

.brief-name {
  color: #5c6676;
}

/* 右侧校验面板（与主区域 1:1 风格） */
.validation-side-panel {
  background: #fff;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #f0f0f0;
  position: relative;
  min-width: 220px;
}

.validation-header-new {
  padding: 16px 20px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.v-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.v-header-title {
  font-size: 14px;
  color: #1a1f36;
}

.v-status-select-wrap {
  margin-left: -8px; /* 与紧凑状态选择器对齐 */
}

.compact-status-select :deep(.n-base-selection-label) {
  padding-left: 8px !important;
  color: #5c6676 !important;
  font-size: 13px !important;
}

.validation-body-new {
  padding: 12px 20px;
  flex: 1;
  overflow-y: auto;
}

.v-section-item {
  margin-bottom: 20px;
}

.v-section-label {
  font-size: 14px;
  color: #5c6676;
  margin-bottom: 12px;
}

.v-result-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  line-height: 1.5;
}

.v-icon-new {
  font-size: 16px;
  margin-top: 2px;
}

.v-icon-new.pass { color: #52c41a; }
.v-icon-new.fail { color: #ff4d4f; }

.v-text {
  color: #1a1f36;
  font-weight: 400;
}

.v-index {
  color: #8792a2;
  min-width: 14px;
}

.v-assertion-list {
  display: flex;
  flex-direction: column;
}

.v-error-detail {
  margin-top: 4px;
  margin-left: 42px; /* 序号 + 图标 + 文案缩进 */
  color: #ff4d4f;
  font-size: 12px;
  font-family: monospace;
  background: #fff1f0;
  padding: 4px 8px;
  border-radius: 4px;
  word-break: break-all;
}

.v-empty-text {
  color: #ccc;
  font-size: 12px;
  padding: 8px 0;
}

.mt-20 { margin-top: 20px; }

.brief-empty {
  color: #ccc;
  font-size: 12px;
  font-style: italic;
}

.response-toolbar {
  height: 32px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tool-item {
  font-size: 12px;
  color: #8792a2;
  cursor: pointer;
}

.tool-item.active {
  color: #1a1f36;
  font-weight: 500;
}

.toolbar-right {
  display: flex;
  gap: 16px;
  color: #8792a2;
}

.tool-icon {
  cursor: pointer;
  font-size: 14px;
}

.response-body-area {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.response-result {
  display: flex;
  flex: 1;
  overflow: auto;
}

.line-numbers-col {
  width: 32px;
  background: #fafafa;
  border-right: 1px solid #f0f0f0;
  padding-top: 8px;
  text-align: center;
}

.ln {
  font-size: 12px;
  color: #ccc;
  line-height: 1.6;
  font-family: monospace;
}

.json-display {
  margin: 0;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #1a1f36;
  padding: 8px 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Header 响应表格 */
.header-table-wrapper {
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
}

.header-simple-table {
  width: 100%;
  border-collapse: collapse;
}

.header-simple-table th {
  text-align: left;
  font-size: 12px;
  color: #8792a2;
  font-weight: normal;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.header-simple-table td {
  padding: 8px 0;
  font-size: 12px;
  line-height: 1.6;
  vertical-align: top;
}

.h-key {
  width: 200px;
  color: #1a1f36;
  font-weight: 500;
}

.h-val {
  color: #5c6676;
  word-break: break-all;
}

/* 实际请求详情区 */
.actual-request-wrapper {
  flex: 1;
  padding: 16px 24px;
  overflow-y: auto;
  background: #fff;
}

.request-section {
  margin-bottom: 24px;
}

.section-label {
  font-size: 12px;
  color: #8792a2;
  margin-bottom: 12px;
}

.url-line {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-family: monospace;
  font-size: 12px;
}

.url-text {
  color: #5c6676;
  word-break: break-all;
  line-height: 1.6;
}

.request-body-pre {
  background: #f8f9fc;
  border-radius: 4px;
  padding: 12px !important;
  border: 1px solid #eef1f6;
}

.body-type-small {
  color: #1890ff;
  margin-left: 8px;
}

/* 请求代码生成区 */
.code-generation-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.lang-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.lang-item {
  font-size: 13px;
  color: #5c6676;
  cursor: pointer;
  padding-bottom: 8px;
  position: relative;
  transition: all 0.2s;
}

.lang-item:hover {
  color: #1a1f36;
}

.lang-item.active {
  color: #7d33ff;
  font-weight: 500;
}

.lang-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #7d33ff;
}

.lib-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.lib-item {
  font-size: 12px;
  color: #8792a2;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.lib-item:hover {
  background: #f5f7fa;
  color: #1a1f36;
}

.lib-item.active {
  background: #f0f4ff;
  color: #1890ff;
}

.generated-code-container {
  display: flex;
  background: #fff;
  border: 1px solid #eef1f6;
  border-radius: 4px;
  min-height: 100px;
  font-family: 'Fira Code', monospace;
}

.code-line-numbers {
  width: 32px;
  background: #fafafa;
  border-right: 1px solid #eef1f6;
  padding: 8px 0;
  text-align: center;
}

.code-display {
  flex: 1;
  margin: 0;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.6;
  color: #1a1f36;
  overflow-x: auto;
  white-space: pre;
}

.response-body-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
}

.res-dots {
  color: #ccc;
  font-size: 20px;
  letter-spacing: 2px;
}

.param-table :deep(th) {
  background: #f8f9fc !important;
  color: #8792a2 !important;
  font-weight: normal !important;
  font-size: 12px;
}

.json-display {
  margin: 0;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #1a1f36;
  white-space: pre-wrap;
  word-break: break-all;
}

.response-body-placeholder {
  height: 40px;
  display: flex;
  align-items: center;
}

.res-dots {
  color: #ccc;
  font-size: 20px;
  letter-spacing: 2px;
}

.param-table :deep(th) {
  background: #f8f9fc !important;
  color: #8792a2 !important;
  font-weight: normal !important;
  font-size: 12px;
}

/* 保存用例弹窗表单 */
.modal-form {
  padding: 4px 0;
}

.form-item {
  margin-bottom: 24px;
}

.form-label {
  font-size: 14px;
  color: #1a1f36;
  margin-bottom: 12px;
}

.required {
  color: #ff4d4f;
  margin-left: 4px;
}

.case-name-input-group {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 4px 12px;
  border: 1px solid #eef1f6;
}

.prefix, .suffix {
  color: #1a1f36;
  font-size: 14px;
  white-space: nowrap;
}

.case-name-select {
  flex: 1;
}

:deep(.case-name-select .n-base-selection) {
  --n-border: none !important;
  --n-border-hover: none !important;
  --n-border-focus: none !important;
  --n-box-shadow-focus: none !important;
  background: transparent !important;
}

.checkbox-item {
  margin-bottom: 8px;
}

:deep(.n-radio) {
  --n-radio-size: 16px;
}

:deep(.n-checkbox) {
  --n-size: 16px;
}

.modal-footer {
  padding-top: 12px;
}

/* 后置操作面板（与前置 1:1 风格） */
.post-ops-pane {
  padding: 16px 0 !important;
}

.post-ops-list {
  margin-bottom: 12px;
}

.post-op-item-wrapper {
  margin-bottom: 8px;
  padding: 0 4px;
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
}

.post-op-item:hover {
  border-color: #7d33ff;
  background: #fff;
  box-shadow: 0 2px 8px rgba(125, 51, 255, 0.08);
}

.op-drag-handle {
  color: #ccc;
  cursor: grab;
  font-size: 14px;
}

.post-op-item.is-editing {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-color: #7d33ff;
  background: #fff;
}

.op-edit-panel {
  border: 1px solid #7d33ff;
  border-top: none;
  border-radius: 0 0 6px 6px;
  padding: 16px;
  background: #fff;
  margin-top: -1px;
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

/* 1:1 閺傤叀鈻堢悰銊ュ礋閺嶅嘲绱?*/
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

.mt-12 { margin-top: 12px; }

.editing-text {
  color: #7d33ff;
  font-style: italic;
}

.action-icon.delete:hover {
  color: #ff4d4f;
}

.op-main-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  cursor: pointer;
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
  gap: 12px;
  color: #8792a2;
}

.action-icon {
  cursor: pointer;
  font-size: 14px;
}

.action-icon:hover { color: #1a1f36; }

/* 添加操作虚线框 */
.add-op-dashed-box {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  margin: 0 4px 24px;
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

/* 韫囶偊鈧喖娼伴弶?*/
.quick-op-panel {
  padding: 0 4px;
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

.import-item {
  color: #1890ff;
}

.import-item:hover {
  color: #40a9ff;
}

/* 閺傤叀鈻堢紒鎾寸亯閺嶅嘲绱?1:1 鏉╂ê甯?*/
.assertion-results-wrapper {
  flex: 1;
  padding: 16px 24px;
  background: #fff;
  overflow-y: auto;
}

.assertion-result-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.res-icon {
  font-size: 18px;
  margin-top: 2px;
}

.res-icon.pass { color: #52c41a; }
.res-icon.fail { color: #ff4d4f; }

.res-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.res-name {
  font-size: 14px;
  color: #1a1f36;
  font-weight: 500;
}

.res-msg {
  font-size: 12px;
  color: #8792a2;
}

.no-assertion {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Console Pane Style */
.console-pane {
  flex: 1;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  overflow-y: auto;
  padding: 12px;
}

.console-log-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.console-log-line {
  display: flex;
  gap: 12px;
  padding: 2px 8px;
  border-radius: 2px;
}

.console-log-line:hover {
  background: rgba(255, 255, 255, 0.05);
}

.log-time {
  color: #858585;
  min-width: 80px;
}

.console-log-line.info { border-left: 3px solid #007acc; }
.console-log-line.success { border-left: 3px solid #4ec9b0; color: #4ec9b0; }
.console-log-line.error { border-left: 3px solid #f44747; color: #f44747; }
.console-log-line.wait { border-left: 3px solid #858585; color: #858585; }

.no-console {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.pre-ops-pane {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pre-ops-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 20px;
  border: 1px solid #e8edf7;
  border-radius: 18px;
  background:
    radial-gradient(circle at top right, rgba(74, 144, 226, 0.15), transparent 32%),
    linear-gradient(135deg, #fbfcfe 0%, #f5f8ff 100%);
}

.pre-ops-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1f36;
}

.pre-ops-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #5c6676;
  line-height: 1.6;
}

.pre-ops-pill {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.06);
  color: #3f4a5a;
  font-size: 12px;
  white-space: nowrap;
}

.pre-op-quick-add {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.pre-op-add-card {
  border: 1px solid #e8edf7;
  border-radius: 16px;
  background: #fff;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  text-align: left;
}

.pre-op-add-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(31, 45, 61, 0.08);
}

.pre-op-add-card.type-db:hover {
  border-color: #2b6cb0;
}

.pre-op-add-card.type-script:hover {
  border-color: #dd6b20;
}

.pre-op-add-card.type-public_script:hover {
  border-color: #2f855a;
}

.pre-op-add-card.type-wait:hover {
  border-color: #805ad5;
}

.pre-op-add-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f7fb;
  color: #1f2937;
  font-size: 18px;
  flex-shrink: 0;
}

.pre-op-add-card.type-db .pre-op-add-icon {
  background: rgba(43, 108, 176, 0.12);
  color: #2b6cb0;
}

.pre-op-add-card.type-script .pre-op-add-icon {
  background: rgba(221, 107, 32, 0.12);
  color: #dd6b20;
}

.pre-op-add-card.type-public_script .pre-op-add-icon {
  background: rgba(47, 133, 90, 0.12);
  color: #2f855a;
}

.pre-op-add-card.type-wait .pre-op-add-icon {
  background: rgba(128, 90, 213, 0.12);
  color: #805ad5;
}

.pre-op-add-body {
  min-width: 0;
}

.pre-op-add-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1f36;
}

.pre-op-add-desc {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.6;
  color: #6b7280;
}

.pre-ops-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pre-op-card {
  position: relative;
  border: 1px solid #e8edf7;
  border-radius: 18px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.pre-op-strip {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #94a3b8;
}

.pre-op-card.type-db .pre-op-strip {
  background: linear-gradient(180deg, #2b6cb0 0%, #63b3ed 100%);
}

.pre-op-card.type-script .pre-op-strip {
  background: linear-gradient(180deg, #dd6b20 0%, #f6ad55 100%);
}

.pre-op-card.type-public_script .pre-op-strip {
  background: linear-gradient(180deg, #2f855a 0%, #68d391 100%);
}

.pre-op-card.type-wait .pre-op-strip {
  background: linear-gradient(180deg, #805ad5 0%, #b794f4 100%);
}

.pre-op-shell {
  padding: 14px 16px 16px 18px;
}

.pre-op-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
}

.pre-op-summary-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.pre-op-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: #f4f7fb;
  color: #334155;
  flex-shrink: 0;
}

.pre-op-card.type-db .pre-op-icon {
  background: rgba(43, 108, 176, 0.12);
  color: #2b6cb0;
}

.pre-op-card.type-script .pre-op-icon {
  background: rgba(221, 107, 32, 0.12);
  color: #dd6b20;
}

.pre-op-card.type-public_script .pre-op-icon {
  background: rgba(47, 133, 90, 0.12);
  color: #2f855a;
}

.pre-op-card.type-wait .pre-op-icon {
  background: rgba(128, 90, 213, 0.12);
  color: #805ad5;
}

.pre-op-texts {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pre-op-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.pre-op-type {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #475569;
}

.pre-op-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1f36;
}

.pre-op-disabled-tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
}

.pre-op-description {
  font-size: 13px;
  color: #5c6676;
  line-height: 1.6;
  word-break: break-all;
}

.pre-op-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.pre-op-editor {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #dbe4f0;
}

.pre-op-editor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 16px;
  margin-bottom: 14px;
}

.pre-op-editor-grid.two-cols {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.pre-op-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pre-op-label {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}

.pre-op-type-chip {
  align-self: flex-start;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: #eef2f7;
  color: #334155;
}

.pre-op-type-chip.type-db {
  background: rgba(43, 108, 176, 0.12);
  color: #2b6cb0;
}

.pre-op-type-chip.type-script {
  background: rgba(221, 107, 32, 0.12);
  color: #dd6b20;
}

.pre-op-type-chip.type-public_script {
  background: rgba(47, 133, 90, 0.12);
  color: #2f855a;
}

.pre-op-type-chip.type-wait {
  background: rgba(128, 90, 213, 0.12);
  color: #805ad5;
}

.pre-op-hint {
  min-height: 34px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #f8fafc;
  color: #5c6676;
  font-size: 12px;
  line-height: 1.6;
}

.script-snippet-groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.script-engine-warning {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: linear-gradient(180deg, #fff8e8 0%, #fff4d6 100%);
  border: 1px solid #f7d58b;
}

.script-engine-warning-title {
  font-size: 12px;
  font-weight: 700;
  color: #9a6700;
}

.script-engine-warning-text {
  font-size: 12px;
  line-height: 1.6;
  color: #7c5a12;
}

.script-snippet-group {
  padding: 10px 12px;
  border-radius: 12px;
  background: linear-gradient(180deg, #fcfcff 0%, #f7f8fd 100%);
  border: 1px solid #e6eaf2;
}

.script-snippet-group-title {
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.02em;
}

.script-snippet-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.script-snippet-list.secondary {
  gap: 10px;
}

.script-snippet-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.script-snippet-item {
  border: none;
  background: transparent;
  color: #8b5cf6;
  font-size: 13px;
  line-height: 1.6;
  text-align: left;
  padding: 0;
  cursor: pointer;
  transition: color 0.18s ease, transform 0.18s ease;
}

.script-snippet-item:hover {
  color: #6d28d9;
  transform: translateX(2px);
}

.script-snippet-item.secondary {
  color: #2563eb;
}

.script-snippet-item.secondary:hover {
  color: #1d4ed8;
}

.script-snippet-copy {
  border: none;
  background: #eef2ff;
  color: #4f46e5;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.18s ease, color 0.18s ease;
}

.script-snippet-copy:hover {
  background: #e0e7ff;
  color: #3730a3;
}

.script-editor-wrapper {
  position: relative;
}

.script-editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.script-toolbar-btn {
  border: 1px solid #dbe4f0;
  background: #fff;
  color: #334155;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.script-toolbar-btn:hover {
  border-color: #94a3b8;
  color: #0f172a;
  background: #f8fafc;
}

.script-toolbar-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  background: #f8fafc;
  color: #94a3b8;
}

.script-toolbar-btn.danger {
  color: #b42318;
  border-color: #f3d1cc;
  background: #fff7f6;
}

.script-toolbar-btn.danger:hover {
  color: #912018;
  border-color: #e7b7b0;
  background: #fff1ef;
}

.script-editor-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.6;
}

.script-api-panel {
  margin-top: 14px;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, #f8fbff 0%, #f3f7fd 100%);
  border: 1px solid #dbe7f5;
}

.script-api-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.script-api-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e3a5f;
}

.script-api-search {
  width: 220px;
  max-width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #fff;
  color: #334155;
  padding: 7px 10px;
  font-size: 12px;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.script-api-search:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.25);
}

.script-api-group + .script-api-group {
  margin-top: 12px;
}

.script-api-group-title {
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.script-api-empty {
  padding: 14px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px dashed #cbd5e1;
  color: #64748b;
  font-size: 12px;
  text-align: center;
}

.script-api-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
}

.script-api-item {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(191, 219, 254, 0.9);
}

.script-api-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.script-api-name {
  font-size: 12px;
  font-weight: 700;
  color: #1d4ed8;
  word-break: break-word;
}

.script-api-action {
  border: none;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.18s ease, color 0.18s ease;
}

.script-api-action:hover {
  background: #bfdbfe;
  color: #1e40af;
}

.script-api-desc {
  font-size: 12px;
  line-height: 1.6;
  color: #475569;
}

.pre-op-empty-state {
  padding: 12px 0 4px;
}

.pre-op-empty-card {
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  padding: 26px 20px;
  background:
    linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.8)),
    #fff;
  text-align: center;
}

.pre-op-empty-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.pre-op-empty-desc {
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.7;
}

@media (max-width: 1200px) {
  .pre-op-quick-add {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .pre-ops-header {
    flex-direction: column;
  }

  .pre-op-quick-add {
    grid-template-columns: 1fr;
  }

  .pre-op-editor-grid,
  .pre-op-editor-grid.two-cols {
    grid-template-columns: 1fr;
  }

  .pre-op-summary {
    flex-direction: column;
    align-items: stretch;
  }

  .pre-op-actions {
    justify-content: flex-end;
  }

  .script-snippet-groups {
    grid-template-columns: 1fr;
  }

  .script-api-grid {
    grid-template-columns: 1fr;
  }

  .script-api-topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .script-api-search {
    width: 100%;
  }
}

/* Cookies Tab */
.cookies-pane {
  padding-top: 12px;
}

.cookies-tip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  margin-bottom: 14px;
  background: #f8f9fc;
  border: 1px solid #e8eaef;
  border-radius: 8px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}
.cookies-tip code {
  background: #eef1f8;
  border-radius: 4px;
  padding: 1px 5px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 11px;
  color: var(--color-primary-500);
}

.cookie-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-bottom: 10px;
  border: 1px solid #e8eaef;
  border-radius: 8px;
  overflow: hidden;
}
.cookie-table thead tr {
  background: #f8f9fc;
}
.cookie-table th {
  padding: 8px 10px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.03em;
  border-bottom: 1px solid #e8eaef;
}
.cookie-row td {
  padding: 5px 8px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}
.cookie-row:last-child td { border-bottom: none; }
.cookie-row:hover { background: #fafbff; }
.cookie-row.ck-disabled { opacity: 0.45; }

.ck-col-check  { width: 36px; text-align: center; }
.ck-col-name   { width: 18%; }
.ck-col-value  { width: 22%; }
.ck-col-domain { width: 16%; }
.ck-col-path   { width: 10%; }
.ck-col-expires{ width: 13%; }
.ck-col-flags  { width: 52px; text-align: center; }
.ck-col-action { width: 40px; text-align: center; }

.ck-input {
  width: 100%;
  height: 28px;
  padding: 0 8px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 5px;
  font-size: 12px;
  color: #374151;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s, background 0.15s;
}
.ck-input:hover { border-color: #e4e8f0; background: #fff; }
.ck-input:focus { border-color: #818cf8; background: #fff; box-shadow: 0 0 0 2px rgba(129,140,248,0.14); }
.ck-input::placeholder { color: #c8cdd8; }

.ck-del-btn {
  width: 26px; height: 26px;
  border: none; background: transparent; border-radius: 5px;
  color: #d1d5db; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
  margin: auto;
}
.ck-del-btn:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

.ck-empty-row {
  text-align: center;
  padding: 24px 0 !important;
  color: #b0b7c3;
  font-size: 12px;
  background: transparent !important;
}

/* Auth Tab */
.auth-pane {
  padding-top: 14px;
}

.auth-type-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.auth-type-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1.5px solid #e8eaef;
  border-radius: 10px;
  cursor: pointer;
  background: #fff;
  transition: all 0.15s;
  position: relative;
  min-width: 140px;
  user-select: none;
}
.auth-type-card:hover {
  border-color: #818cf8;
  background: #fafbff;
}
.auth-type-card.active {
  border-color: var(--color-primary-500);
  background: rgba(var(--color-primary-rgb),0.04);
}

.auth-type-icon {
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.auth-type-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}
.auth-type-check {
  position: absolute;
  top: 6px; right: 6px;
}

/* None hint */
.auth-none-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 0;
  color: #9ca3af;
  font-size: 13px;
}

/* Auth form */
.auth-form {
  background: #fafbff;
  border: 1px solid #eef1f8;
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.auth-form-row {
  display: flex;
  gap: 16px;
}
.auth-form-row .auth-form-section {
  flex: 1;
  min-width: 0;
}
.auth-form-section {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.auth-form-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}
.auth-form-hint {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 400;
}
.auth-form-hint code {
  background: #eef1f8;
  border-radius: 4px;
  padding: 1px 5px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  color: var(--color-primary-500);
}
.auth-req { color: #ef4444; }

.auth-token-input { font-family: 'JetBrains Mono', Consolas, monospace !important; font-size: 12px !important; }

.auth-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f0f2ff;
  border-radius: 7px;
  border: 1px solid rgba(var(--color-primary-rgb),0.15);
  margin-top: 4px;
}
.auth-preview-label {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}
.auth-preview-value {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 11px;
  color: var(--color-primary-500);
  word-break: break-all;
}

.oauth-token-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.oauth-token-row .n-input { flex: 1; }

/* Settings Tab */
.settings-pane {
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  background: #fafbff;
  border: 1px solid #eef1f8;
  border-radius: 10px;
  padding: 16px 20px;
}
.settings-section-title {
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

.settings-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 14px;
}
.settings-row:last-child { margin-bottom: 0; }

.settings-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}
.settings-item--switch {
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
.settings-item--wide { flex: 1; min-width: 300px; }

.settings-switch-info { flex: 1; }
.settings-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}
.settings-hint {
  font-size: 11px;
  color: #b0b7c3;
  font-weight: 400;
}
.settings-desc {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.settings-proxy-fields {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 14px;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}
</style>
