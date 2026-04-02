<template>
  <div class="placeholder-page">
    <div class="placeholder-inner">
      <header class="placeholder-header">
        <p class="placeholder-eyebrow">接口管理</p>
        <h1 class="placeholder-title">API 管理中心</h1>
        <p class="placeholder-sub">统一管理接口资产、文档与版本，构建可复用的接口知识库。</p>
      </header>

      <div class="placeholder-card">
        <div class="placeholder-icon-wrap">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" stroke-width="1.5" stroke-linecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h2 class="placeholder-card-title">功能正在建设中</h2>
        <p class="placeholder-card-desc">
          该模块正在开发中，即将上线。您可以先使用「单接口测试」和「自动化测试」完成日常测试工作。
        </p>
        <div class="placeholder-actions">
          <n-button type="primary" @click="$router.push('/interface-test')">
            前往单接口测试
          </n-button>
          <n-button quaternary @click="$router.push('/dashboard')">
            返回仪表盘
          </n-button>
        </div>
      </div>

      <div class="placeholder-features">
        <div class="placeholder-feat-item">
          <div class="placeholder-feat-icon" style="background: rgba(var(--color-primary-rgb), 0.1); color: var(--color-primary-500);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div>
            <h3>接口文档</h3>
            <p>自动生成标准化 API 文档</p>
          </div>
        </div>
        <div class="placeholder-feat-item">
          <div class="placeholder-feat-icon" style="background: rgba(6, 182, 212, 0.1); color: #0891b2;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div>
            <h3>版本管理</h3>
            <p>追踪接口变更与版本历史</p>
          </div>
        </div>
        <div class="placeholder-feat-item">
          <div class="placeholder-feat-icon" style="background: rgba(16, 185, 129, 0.1); color: #059669;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <h3>团队协作</h3>
            <p>多人协同编辑与权限控制</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'
</script>

<style scoped>
.placeholder-page {
  position: absolute;
  inset: 0;
  overflow: auto;
  background: linear-gradient(165deg, var(--color-gray-50) 0%, #eef0f8 45%, var(--color-gray-50) 100%);
  font-family: var(--font-family-base);
}

.placeholder-inner {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6) var(--page-padding-x) var(--space-10);
}

.placeholder-header {
  margin-bottom: var(--space-6);
}

.placeholder-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary-500);
  margin-bottom: var(--space-2);
}

.placeholder-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  margin: 0 0 var(--space-2);
}

.placeholder-sub {
  font-size: var(--text-md);
  color: var(--color-text-tertiary);
  max-width: 520px;
  line-height: var(--leading-relaxed);
  margin: 0;
}

.placeholder-card {
  text-align: center;
  padding: var(--space-10) var(--space-6);
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  border: 1px dashed var(--color-border);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-6);
}

.placeholder-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: var(--color-primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-5);
}

.placeholder-card-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.placeholder-card-desc {
  font-size: var(--text-md);
  color: var(--color-text-tertiary);
  max-width: 420px;
  margin: 0 auto var(--space-6);
  line-height: var(--leading-relaxed);
}

.placeholder-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.placeholder-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.placeholder-feat-item {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  padding: var(--space-4);
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
  transition: box-shadow var(--duration-normal), transform var(--duration-normal);
}

.placeholder-feat-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.placeholder-feat-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.placeholder-feat-item h3 {
  font-size: var(--text-md);
  font-weight: var(--font-semibold);
  margin: 0 0 4px;
  color: var(--color-text-primary);
}

.placeholder-feat-item p {
  font-size: var(--text-sm);
  margin: 0;
  color: var(--color-text-tertiary);
  line-height: 1.5;
}

@media (max-width: 700px) {
  .placeholder-features {
    grid-template-columns: 1fr;
  }
}
</style>
