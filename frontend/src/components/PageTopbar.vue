<template>
  <div class="page-topbar">
    <div class="page-topbar-deco"></div>
    <div class="page-topbar-inner">
      <div class="page-topbar-left">
        <div class="page-topbar-breadcrumb">
          <span v-for="(crumb, i) in breadcrumbs" :key="i" class="crumb-item">
            <svg v-if="i > 0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="crumb-sep">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span :class="i === breadcrumbs.length - 1 ? 'crumb-active' : ''">{{ crumb }}</span>
          </span>
        </div>
        <div class="page-topbar-title-row">
          <div class="page-topbar-icon">
            <slot name="icon" />
          </div>
          <h1 class="page-topbar-title">{{ title }}</h1>
          <span v-if="badge" class="page-topbar-badge">{{ badge }}</span>
        </div>
      </div>
      <div class="page-topbar-right">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  badge?: string
  breadcrumbs?: string[]
}>()
</script>

<style scoped>
.page-topbar {
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #f8f7ff 60%, #f0f0ff 100%);
  border-bottom: 1px solid #e4e4f0;
}

.page-topbar-deco {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(125, 51, 255, 0.10) 0%, transparent 70%);
  pointer-events: none;
}

.page-topbar-inner {
  position: relative;
  z-index: 1;
  height: 72px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-topbar-left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.page-topbar-breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
}

.crumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.crumb-sep {
  flex-shrink: 0;
  color: #d1d5db;
}

.crumb-active {
  color: #7d33ff;
  font-weight: 500;
}

.page-topbar-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-topbar-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #7d33ff, #a855f7);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(125, 51, 255, 0.3);
  flex-shrink: 0;
}

.page-topbar-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
  line-height: 1;
}

.page-topbar-badge {
  height: 18px;
  padding: 0 7px;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, rgba(125, 51, 255, 0.12), rgba(168, 85, 247, 0.10));
  color: #7d33ff;
  border: 1px solid rgba(125, 51, 255, 0.2);
  display: inline-flex;
  align-items: center;
}

.page-topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
