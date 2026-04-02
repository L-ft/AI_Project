<template>
  <div class="account-page">
    <div class="account-inner">

      <!-- 页头 -->
      <header class="account-header">
        <p class="account-eyebrow">个人中心</p>
        <h1 class="account-title">账户设置</h1>
        <p class="account-sub">管理您的个人信息、登录凭证与安全偏好。</p>
      </header>

      <n-grid :x-gap="24" :y-gap="24" :cols="24">

        <!-- 左侧：个人信息卡片 -->
        <n-gi :span="8">
          <n-card :bordered="false" class="account-card profile-card">
            <div class="avatar-section">
              <div class="avatar-wrap">
                <n-avatar
                  :size="96"
                  round
                  :style="{ backgroundColor: 'var(--color-primary-500)', fontSize: '38px' }"
                >
                  {{ userStore.username?.slice(0, 1).toUpperCase() }}
                </n-avatar>
                <div class="avatar-ring"></div>
              </div>
              <h2 class="profile-name">{{ userStore.username }}</h2>
              <n-tag type="primary" round size="small" class="profile-role-tag">
                {{ userStore.role }}
              </n-tag>
              <n-button size="small" quaternary round class="change-avatar-btn">
                <template #icon><n-icon :component="UploadOutlined" /></template>
                更换头像
              </n-button>
            </div>
            <n-divider style="margin: 16px 0" />
            <div class="profile-details">
              <div class="detail-row">
                <span class="detail-label">账户名称</span>
                <span class="detail-value">{{ userStore.username }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">注册手机</span>
                <span class="detail-value">{{ userStore.phone }}</span>
              </div>
            </div>
          </n-card>
        </n-gi>

        <!-- 右侧：安全设置 -->
        <n-gi :span="16">
          <n-card title="安全设置" :bordered="false" class="account-card">
            <n-list :show-divider="true">
              <n-list-item>
                <template #suffix>
                  <n-button text type="primary">修改</n-button>
                </template>
                <n-thing title="登录密码">
                  <template #description>
                    <span class="security-desc">安全性高的密码可以使账号更安全。建议您定期更换密码。</span>
                  </template>
                </n-thing>
              </n-list-item>

              <n-list-item>
                <template #suffix>
                  <n-button text type="primary">修改</n-button>
                </template>
                <n-thing title="手机绑定">
                  <template #description>
                    <span class="security-desc">绑定手机号码用于接收验证码、找回密码、重要安全设置的校验等。</span>
                    <div class="security-value">{{ maskPhone(userStore.phone) }}</div>
                  </template>
                </n-thing>
              </n-list-item>

              <n-list-item>
                <template #suffix>
                  <n-button text type="primary">修改</n-button>
                </template>
                <n-thing title="操作保护">
                  <template #description>
                    <span class="security-desc">在关键操作（如：API密钥重置、权限修改）时，通过验证方式再次确认您的身份。</span>
                    <div class="security-value security-value--success">
                      <n-icon :component="CheckCircleOutlined" /> 已开启保护
                    </div>
                  </template>
                </n-thing>
              </n-list-item>

              <n-list-item>
                <template #suffix>
                  <n-space>
                    <n-button text type="primary" @click="isKeyVisible = !isKeyVisible">
                      {{ isKeyVisible ? '隐藏' : '显示' }}
                    </n-button>
                    <n-button text type="primary" @click="copyToClipboard">复制</n-button>
                  </n-space>
                </template>
                <n-thing title="API 密钥 (Access Key)">
                  <template #description>
                    <span class="security-desc">用于调用平台 API 或执行引擎的身份凭证。请妥善保管。</span>
                    <div class="security-value key-text">{{ isKeyVisible ? apiKey : maskedKey }}</div>
                  </template>
                </n-thing>
              </n-list-item>

              <n-list-item>
                <template #suffix>
                  <n-button text type="primary">修改</n-button>
                </template>
                <n-thing title="登录保持时长">
                  <template #description>
                    <span class="security-desc">您可以设置保持登录的时间长度，超过该时间系统会自动退出登录。（系统默认认证3小时）</span>
                    <div class="security-value">12小时</div>
                  </template>
                </n-thing>
              </n-list-item>
            </n-list>
          </n-card>
        </n-gi>

      </n-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NGrid, NGi, NCard, NAvatar, NButton, NIcon, NList, NListItem, NThing, NSpace, NTag, NDivider } from 'naive-ui'
import { UploadOutlined, CheckCircleOutlined } from '@vicons/antd'
import { useUserStore } from '../store/user'
import { message } from '../utils/naive-api'

const userStore = useUserStore()
const apiKey = ref('ai_7f2d90a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p')
const isKeyVisible = ref(false)

const maskedKey = computed(() => apiKey.value.substring(0, 6) + '****************************')

const maskPhone = (phone: string) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(apiKey.value)
  message.success('API 密钥已复制到剪贴板')
}
</script>

<style scoped>
@import '@/styles/design-tokens.css';

.account-page {
  position: absolute;
  inset: 0;
  overflow: auto;
  background: linear-gradient(165deg, var(--color-gray-50) 0%, #eef0f8 45%, var(--color-gray-50) 100%);
  font-family: var(--font-family-base);
}

.account-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-6) var(--page-padding-x) var(--space-10);
}

.account-header {
  margin-bottom: var(--space-6);
}

.account-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary-500);
  margin-bottom: var(--space-2);
}

.account-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  margin: 0 0 var(--space-2);
}

.account-sub {
  font-size: var(--text-md);
  color: var(--color-text-tertiary);
  margin: 0;
  line-height: var(--leading-relaxed);
}

.account-card {
  border-radius: var(--radius-lg) !important;
  border: 1px solid var(--color-border) !important;
  box-shadow: var(--shadow-sm);
  background: var(--color-bg-surface);
}

/* 个人信息卡 */
.profile-card {
  text-align: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) 0 var(--space-2);
}

.avatar-wrap {
  position: relative;
  display: inline-block;
}

.avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid var(--color-primary-200);
  animation: ring-pulse 3s ease-in-out infinite;
}

@keyframes ring-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.04); }
}

.profile-name {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.profile-role-tag {
  font-size: var(--text-xs);
}

.change-avatar-btn {
  color: var(--color-text-tertiary);
}

.profile-details {
  text-align: left;
  padding: 0 var(--space-4);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
  font-size: var(--text-md);
  border-bottom: 1px solid var(--color-border-subtle);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: var(--color-text-tertiary);
}

.detail-value {
  color: var(--color-text-primary);
  font-weight: var(--font-medium);
}

/* 安全设置 */
.security-desc {
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.security-value {
  margin-top: var(--space-1);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  font-size: var(--text-md);
}

.security-value--success {
  color: var(--color-success);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.key-text {
  font-family: var(--font-family-mono);
  font-size: var(--text-sm);
  background: var(--color-gray-100);
  padding: 3px var(--space-2);
  border-radius: var(--radius-sm);
  display: inline-block;
}

:deep(.n-thing-header__title) {
  font-size: var(--text-lg) !important;
  font-weight: var(--font-semibold) !important;
}
</style>
