<template>
  <div class="account-container">
    <n-grid :x-gap="24" :cols="24">
      <!-- 左侧：个人信息 -->
      <n-gi :span="8">
        <n-card class="info-card" :bordered="false">
          <div class="avatar-section">
            <n-avatar
              :size="120"
              round
              :style="{ backgroundColor: '#0077ff', fontSize: '48px' }"
            >
              {{ userStore.username?.slice(0, 1).toUpperCase() }}
            </n-avatar>
            <n-button class="change-avatar-btn" size="small" quaternary round>
              <template #icon>
                <n-icon :component="UploadOutlined" />
              </template>
              更换头像
            </n-button>
          </div>
          <div class="user-details">
            <div class="detail-item">
              <span class="label">账户名称：</span>
              <span class="value">{{ userStore.username }}</span>
            </div>
            <div class="detail-item">
              <span class="label">注册账号：</span>
              <span class="value">{{ userStore.phone }}</span>
            </div>
          </div>
        </n-card>
      </n-gi>

      <!-- 右侧：安全设置 -->
      <n-gi :span="16">
        <n-card title="安全设置" :bordered="false" class="security-card">
          <n-list :show-divider="true">
            <!-- 登录密码 -->
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

            <!-- 手机绑定 -->
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

            <!-- 操作保护 -->
            <n-list-item>
              <template #suffix>
                <n-button text type="primary">修改</n-button>
              </template>
              <n-thing title="操作保护">
                <template #description>
                  <span class="security-desc">在关键操作（如：API密钥重置、权限修改）时，通过验证方式再次确认您的身份。</span>
                  <div class="security-value status-on">
                    <n-icon :component="CheckCircleOutlined" /> 已开启保护
                  </div>
                </template>
              </n-thing>
            </n-list-item>

            <!-- API 密钥 -->
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
                  <div class="security-value key-text">
                    {{ isKeyVisible ? apiKey : maskedKey }}
                  </div>
                </template>
              </n-thing>
            </n-list-item>

            <!-- 登录保持时长 -->
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  NGrid, NGi, NCard, NAvatar, NButton, NIcon, NList, NListItem, NThing, NSpace 
} from 'naive-ui'
import { 
  UploadOutlined, CheckCircleOutlined, EyeOutlined, EyeInvisibleOutlined 
} from '@vicons/antd'
import { useUserStore } from '../store/user'
import { message } from '../utils/naive-api'

const userStore = useUserStore()
const apiKey = ref('ai_7f2d90a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p')
const isKeyVisible = ref(false)

const maskedKey = computed(() => {
  return apiKey.value.substring(0, 6) + '****************************'
})

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
.account-container {
  max-width: 1200px;
  margin: 0 auto;
}

.info-card {
  height: 100%;
  background: #ffffff;
  border-radius: 16px;
  text-align: center;
  padding: 20px 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.change-avatar-btn {
  color: #697386;
}

.user-details {
  text-align: left;
  padding: 0 32px;
}

.detail-item {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-item .label {
  color: #697386;
}

.detail-item .value {
  color: #1a1f36;
  font-weight: 500;
}

.security-card {
  background: #ffffff;
  border-radius: 16px;
}

.security-desc {
  color: #697386;
  font-size: 13px;
  line-height: 1.6;
}

.security-value {
  margin-top: 8px;
  font-weight: 500;
  color: #1a1f36;
}

.status-on {
  color: #18a058;
  display: flex;
  align-items: center;
  gap: 4px;
}

.key-text {
  font-family: monospace;
  background: #f5f8ff;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

:deep(.n-thing-header__title) {
  font-size: 16px !important;
  font-weight: 600 !important;
}
</style>
