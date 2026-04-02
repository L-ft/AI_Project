<template>
  <div class="error-page">
    <div class="error-card">
      <div class="error-icon-wrap">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" stroke-width="1.5" stroke-linecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <h1 class="error-title">403</h1>
      <p class="error-subtitle">权限不足</p>
      <p class="error-desc">抱歉，您当前的角色权限不足以访问此页面。请联系管理员获取相应权限。</p>
      <div class="error-actions">
        <n-button type="primary" @click="$router.push('/dashboard')">返回仪表盘</n-button>
        <n-button quaternary @click="$router.push('/login')">重新登录</n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'
</script>

<style scoped>
.error-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(165deg, var(--color-gray-50) 0%, #eef0f8 45%, var(--color-gray-50) 100%);
  font-family: var(--font-family-base);
}

.error-card {
  text-align: center;
  max-width: 420px;
  padding: 48px 40px;
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.error-icon-wrap {
  width: 88px;
  height: 88px;
  border-radius: 20px;
  background: var(--color-primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.error-title {
  font-size: 56px;
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1;
  letter-spacing: -0.03em;
}

.error-subtitle {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  margin: 8px 0 0;
}

.error-desc {
  font-size: var(--text-md);
  color: var(--color-text-tertiary);
  margin: 12px 0 28px;
  line-height: var(--leading-relaxed);
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
