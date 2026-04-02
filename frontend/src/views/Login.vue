<template>
  <div class="login-page">
    <div class="login-bg-glow"></div>

    <n-card class="login-card" :bordered="false">
      <div class="login-header">
        <div class="login-logo">
          <div class="logo-inner-pulse"></div>
        </div>
        <h2 class="login-title">AI 自动化平台</h2>
        <p class="login-subtitle">{{ isLogin ? '智能接口自动化专家系统' : '创建您的智能自动化账户' }}</p>
      </div>

      <n-tabs v-model:value="authMode" justify-content="space-evenly" type="line" @update:value="isLogin = (authMode === 'login')">
        <n-tab name="login">登录</n-tab>
        <n-tab name="register">注册</n-tab>
      </n-tabs>

      <n-form :model="authForm" :rules="rules" size="large" style="margin-top: 20px">
        <n-form-item v-if="!isLogin" path="username" :show-label="false">
          <n-input v-model:value="authForm.username" placeholder="用户昵称">
            <template #prefix><n-icon :component="UserOutlined" /></template>
          </n-input>
        </n-form-item>

        <n-form-item path="phone" :show-label="false">
          <n-input v-model:value="authForm.phone" placeholder="手机号码">
            <template #prefix><n-icon :component="MobileOutlined" /></template>
          </n-input>
        </n-form-item>

        <n-form-item path="password" :show-label="false">
          <n-input
            v-model:value="authForm.password"
            type="password"
            show-password-on="mousedown"
            placeholder="登录密码"
          >
            <template #prefix><n-icon :component="LockOutlined" /></template>
          </n-input>
        </n-form-item>

        <div style="margin-top: 10px">
          <n-button type="primary" block round @click="handleAuth" class="login-btn">
            {{ isLogin ? '立即登录' : '完成注册' }}
          </n-button>
        </div>
      </n-form>

      <div class="footer-links">
        <span @click="isLogin = !isLogin">{{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}</span>
        <span class="dot">·</span>
        <span>找回密码</span>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NForm, NFormItem, NInput, NButton, NIcon, NTabs, NTab } from 'naive-ui'
import { MobileOutlined, LockOutlined, UserOutlined } from '@vicons/antd'
import { message } from '../utils/naive-api'
import request from '../api/request'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const isLogin = ref(true)
const authMode = ref('login')
const authForm = ref({ phone: '', password: '', username: '' })

const rules = {
  phone:    { required: true, message: '请输入手机号码', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' },
  username: { required: true, message: '请输入昵称', trigger: 'blur' }
}

const handleAuth = async () => {
  try {
    if (isLogin.value) {
      const res: any = await request.post('/auth/login', {
        phone: authForm.value.phone,
        password: authForm.value.password
      })
      if (res.access_token) {
        userStore.setUserInfo({
          uid: res.user.uid,
          username: res.user.username,
          phone: res.user.phone,
          role: res.user.role,
          token: res.access_token
        })
        message.success('登录成功，欢迎回来')
        router.push('/dashboard')
      }
    } else {
      await request.post('/auth/register', {
        phone: authForm.value.phone,
        password: authForm.value.password,
        username: authForm.value.username
      })
      message.success('注册成功，请登录')
      isLogin.value = true
      authMode.value = 'login'
    }
  } catch {
    // 错误已由拦截器统一处理
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0ecff 0%, #e8e4ff 40%, #ede8ff 100%);
  overflow: hidden;
  position: relative;
}

.login-bg-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 15% 20%, rgba(125, 51, 255, 0.18) 0%, transparent 50%),
    radial-gradient(circle at 85% 80%, rgba(168, 85, 247, 0.13) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(125, 51, 255, 0.06) 0%, transparent 70%);
  z-index: 1;
}

.login-card {
  width: 400px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(125, 51, 255, 0.15) !important;
  border-radius: 28px !important;
  box-shadow: 0 30px 60px rgba(125, 51, 255, 0.12), 0 8px 24px rgba(0, 0, 0, 0.06);
  z-index: 10;
  padding: 10px;
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.login-logo {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #7d33ff, #a855f7);
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 24px rgba(125, 51, 255, 0.4);
}

.logo-inner-pulse {
  width: 60%;
  height: 60%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%   { transform: scale(0.8); opacity: 0.8; }
  50%  { transform: scale(1.2); opacity: 0.3; }
  100% { transform: scale(0.8); opacity: 0.8; }
}

.login-title {
  color: #1a1f36;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 3px;
  margin: 0;
}

.login-subtitle {
  color: #697386;
  font-size: 13px;
  margin-top: 5px;
}

.login-btn {
  height: 48px;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #7d33ff, #a855f7) !important;
  border: none !important;
  box-shadow: 0 4px 14px rgba(125, 51, 255, 0.35);
  transition: box-shadow 0.2s, transform 0.15s !important;
}

.login-btn:hover {
  box-shadow: 0 8px 22px rgba(125, 51, 255, 0.45) !important;
  transform: translateY(-1px);
}

.footer-links {
  display: flex;
  justify-content: center;
  margin-top: 25px;
  font-size: 12px;
  color: #a3acb9;
  cursor: pointer;
}

.dot { margin: 0 8px; }

:deep(.n-input) {
  background-color: #f7f4ff !important;
  border-radius: 12px;
}

:deep(.n-tabs-tab--active .n-tabs-tab__label) {
  color: #7d33ff !important;
}

:deep(.n-tabs-bar) {
  background-color: #7d33ff !important;
}
</style>
