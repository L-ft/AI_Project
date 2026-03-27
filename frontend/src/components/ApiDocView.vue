<template>
  <div class="api-doc-view">
    <!-- 顶部工具栏 -->
    <div class="doc-header-toolbar">
      <div class="header-left">
        <h1 class="api-title">{{ data.label }}</h1>
        <div class="api-meta-row">
          <n-tag :bordered="false" size="small" class="method-badge post">POST</n-tag>
          <div class="status-dropdown">
            <span class="status-dot"></span>
            <span class="status-text">开发中</span>
            <n-icon :component="DownOutlined" class="arrow-icon" />
          </div>
          <div class="share-info">
            <n-icon :component="GlobalOutlined" />
            <span class="share-text">共享</span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <n-space>
          <n-button type="primary" color="#7D33FF" class="debug-btn">
            <template #icon><n-icon :component="ThunderboltOutlined" /></template>
            调试
          </n-button>
          <n-button secondary class="code-btn">
            <template #icon><n-icon :component="CodeOutlined" /></template>
            生成代码
          </n-button>
          <n-button quaternary class="delete-btn">删除</n-button>
        </n-space>
      </div>
    </div>

    <!-- 元数据行 -->
    <div class="meta-info-bar">
      <div class="meta-item"><span class="label">创建时间</span> <span class="value">2026年1月22日</span></div>
      <div class="meta-item"><span class="label">修改时间</span> <span class="value">几秒前</span></div>
      <div class="meta-item"><span class="label">修改者</span> <span class="value">刘芳婷</span></div>
      <div class="meta-item"><span class="label">创建者</span> <span class="value">刘芳婷</span></div>
      <div class="meta-item"><span class="label">责任人</span> <span class="value">未设置</span></div>
      <div class="meta-item"><span class="label">目录</span> <span class="value">认证中心</span></div>
    </div>

    <!-- 主体内容滚动区 -->
    <n-scrollbar class="doc-content-scroll">
      <div class="doc-body">
        <!-- Mock 区域 -->
        <div class="doc-section mock-section">
          <div class="section-header">
            <span class="title">Mock</span>
            <n-icon :component="DownOutlined" class="arrow-icon" />
          </div>
          <div class="mock-tabs">
            <span class="mock-tab active">本地</span>
            <span class="mock-tab">云端</span>
            <span class="mock-tab">自托管</span>
          </div>
          <n-table :bordered="false" size="small" class="mock-table">
            <thead>
              <tr>
                <th style="width: 150px">名称</th>
                <th style="width: 150px">来源</th>
                <th>URL / 参数</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="status-code-text">200 成功</span></td>
                <td>接口响应</td>
                <td><a href="#" class="mock-url">http://127.0.0.1:4523/m2/6702409-6412172-default/409316636?apifoxApiId=409316636</a></td>
              </tr>
            </tbody>
          </n-table>
        </div>

        <!-- 请求参数 -->
        <div class="doc-section">
          <div class="section-title">请求参数</div>
          <div class="param-card">
            <div class="card-header">Header 参数</div>
            <div class="header-param-row">
              <div class="param-main">
                <span class="param-name">Authorization</span>
                <span class="param-type">string</span>
                <n-tag size="tiny" color="#e6fffb" text-color="#13c2c2" :bordered="false" class="full-tag">全</n-tag>
              </div>
              <div class="param-optional">可选</div>
            </div>
            <div class="param-default-value">
              <span class="label">默认值:</span>
              <div class="value-box">
                bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCVyeXAyX25hbWUiOiIwaS... (已截断)
              </div>
            </div>
          </div>
        </div>

        <!-- 返回响应 -->
        <div class="doc-section">
          <div class="section-title">返回响应</div>
          <div class="response-status-badge">
            <span class="status-code">200</span>
            <span class="status-name">成功</span>
          </div>
          
          <div class="response-container">
            <div class="response-main">
              <div class="response-meta-row">
                <span>HTTP 状态码: <span class="val">200</span></span>
                <span class="val-gray">application/json</span>
              </div>
              
              <div class="body-tree">
                <div class="tree-node">
                  <n-icon :component="CaretDownOutlined" class="expand-icon" />
                  <span class="node-text">object</span>
                </div>
              </div>
            </div>
            
            <div class="response-example">
              <div class="example-header">示例</div>
              <div class="example-content">
                <pre>{}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-scrollbar>

    <!-- 底部操作栏 -->
    <div class="doc-footer-bar">
      <div class="footer-left">
        <n-button-group size="small">
          <n-button secondary class="mode-btn active">文档模式</n-button>
          <n-button secondary class="mode-btn">调试模式</n-button>
        </n-button-group>
      </div>
      <div class="footer-right">
        <n-space :size="16">
          <n-text depth="3" class="footer-icon-text"><n-icon :component="CheckCircleOutlined" style="color: #52c41a" /> 在线</n-text>
          <n-text depth="3" class="footer-icon-text"><n-icon :component="ApiOutlined" /> 请求代理 <n-icon :component="DownOutlined" /></n-text>
          <n-text depth="3" class="footer-icon-text"><n-icon :component="CoffeeOutlined" /> Cookie 管理</n-text>
          <n-text depth="3" class="footer-icon-text"><n-icon :component="DeleteOutlined" /> 回收站</n-text>
          <n-text depth="3" class="footer-icon-text"><n-icon :component="ReadOutlined" /> 文档 & 交流群</n-text>
          <n-icon :component="SettingOutlined" class="footer-settings" />
        </n-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  DownOutlined, GlobalOutlined, ThunderboltOutlined, CodeOutlined,
  CheckCircleOutlined, ApiOutlined, CoffeeOutlined, DeleteOutlined,
  ReadOutlined, SettingOutlined, CaretDownOutlined
} from '@vicons/antd'
import { NTag, NButton, NSpace, NScrollbar, NTable, NIcon, NText, NButtonGroup } from 'naive-ui'

defineProps<{ data: any }>()
</script>

<style scoped>
.api-doc-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  color: #1a1f36;
}

/* 顶部标题工具栏 */
.doc-header-toolbar {
  padding: 24px 32px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.api-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.api-meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.method-badge {
  font-weight: 700;
  border-radius: 4px;
}
.method-badge.post { background: #fff7e6; color: #fa8c16; }

.status-dropdown {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
}
.status-dot {
  width: 6px;
  height: 6px;
  background: #1890ff;
  border-radius: 50%;
}
.arrow-icon { font-size: 10px; color: #8792a2; }

.share-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8792a2;
  font-size: 13px;
}

/* 元数据栏 */
.meta-info-bar {
  display: flex;
  padding: 0 32px 16px;
  gap: 24px;
  font-size: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.meta-item .label { color: #8792a2; margin-right: 8px; }
.meta-item .value { color: #1a1f36; }

/* 内容区 */
.doc-content-scroll {
  flex: 1;
}

.doc-body {
  padding: 24px 32px 64px;
  max-width: 1200px;
}

.doc-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  cursor: pointer;
}

/* Mock 区域 */
.mock-tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}
.mock-tab {
  padding: 8px 16px;
  font-size: 13px;
  color: #8792a2;
  cursor: pointer;
  position: relative;
}
.mock-tab.active {
  color: #7D33FF;
  font-weight: 500;
}
.mock-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #7D33FF;
}

.status-code-text { color: #52c41a; font-weight: 500; }
.mock-url { color: #1890ff; text-decoration: none; word-break: break-all; }

/* 请求参数卡片 */
.param-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
}
.card-header {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}
.header-param-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.param-main { display: flex; align-items: center; gap: 12px; }
.param-name { color: #1890ff; font-weight: 500; }
.param-type { color: #8792a2; font-size: 13px; }
.param-optional { color: #8792a2; font-size: 12px; }

.param-default-value {
  display: flex;
  gap: 12px;
  font-size: 13px;
}
.param-default-value .label { color: #8792a2; }
.value-box {
  background: #f8f9fc;
  padding: 12px;
  border-radius: 4px;
  flex: 1;
  color: #1a1f36;
  font-family: monospace;
  word-break: break-all;
}

/* 返回响应 */
.response-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 4px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  margin-bottom: 16px;
}
.status-code { color: #52c41a; font-weight: 700; }
.status-name { color: #52c41a; font-size: 13px; }

.response-container {
  display: flex;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}
.response-main {
  flex: 3;
  padding: 16px;
  border-right: 1px solid #f0f0f0;
}
.response-meta-row {
  font-size: 13px;
  margin-bottom: 16px;
}
.response-meta-row .val { font-weight: 600; margin-left: 4px; }
.response-meta-row .val-gray { color: #8792a2; margin-left: 16px; }

.response-example {
  flex: 1;
  padding: 16px;
  background: #fafafa;
}
.example-header { font-size: 13px; color: #8792a2; margin-bottom: 12px; }
.example-content pre { margin: 0; font-family: monospace; color: #1a1f36; }

/* 底部操作栏 */
.doc-footer-bar {
  padding: 8px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}
.mode-btn { border-radius: 4px; font-size: 12px; }
.mode-btn.active { background: #f0f2f5 !important; color: #1a1f36 !important; }

.footer-icon-text {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.footer-settings {
  font-size: 16px;
  color: #8792a2;
  cursor: pointer;
}
</style>
